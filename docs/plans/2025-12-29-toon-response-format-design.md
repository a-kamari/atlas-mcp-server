# TOON Response Format & Project Sorting Design

**Date:** 2025-12-29
**Status:** In Progress
**Scope:** `atlas_project_list` tool

## Implementation Status

| Component | Status | Files Modified |
|-----------|--------|----------------|
| ResponseFormat enum | Done | `src/types/mcp.ts` |
| Multi-field sorting | Done | `src/services/neo4j/helpers.ts`, `types.ts`, `projectService.ts` |
| Field presets & validation | Done | `src/mcp/tools/atlas_project_list/fieldPresets.ts`, `index.ts` |
| Neo4j composite indexes | Done | `src/services/neo4j/utils.ts` |
| TOON encoder integration | Pending | `src/mcp/tools/atlas_project_list/responseFormat.ts` |
| Field filtering in response | Pending | `src/mcp/tools/atlas_project_list/listProjects.ts` |

### Completed Changes

**`src/types/mcp.ts`:**
- Added `TOON = "toon"` to `ResponseFormat` enum

**`src/services/neo4j/helpers.ts`:**
- Added `SortField` interface
- Added `SORTABLE_PROJECT_FIELDS` constant
- Added `parseSortString()`, `normalizeSortBy()`, `buildOrderByClause()` functions
- Updated `ListQueryPaginationOptions` to support `sortBy: string | string[]`
- Updated `buildListQuery()` to use multi-field sorting

**`src/services/neo4j/types.ts`:**
- Added `sortBy?: string | string[]` to `ProjectFilterOptions`

**`src/services/neo4j/projectService.ts`:**
- Updated `getProjects()` to pass sortBy with field validation

**`src/services/neo4j/utils.ts`:**
- Added indexes: `project_name`, `project_updatedAt`
- Added composite indexes: `project_status_name`, `project_status_createdAt`, `project_taskType_createdAt`

**`src/mcp/tools/atlas_project_list/fieldPresets.ts`:** (NEW)
- Created with `PROJECT_FIELDS`, `PROJECT_FIELD_PRESETS`, validation functions

**`src/mcp/tools/atlas_project_list/index.ts`:**
- Added `verbosity`, `fields`, `sortBy` schema parameters with validation

### Remaining Work

1. Install `@toon-format/toon` package
2. Implement TOON encoding in `responseFormat.ts`
3. Wire up field filtering in `listProjects.ts`
4. Update response flow to use verbosity/fields

## Problem Statement

The Atlas MCP server returns verbose responses that waste tokens when consumed by AI agents. Project listing has no sorting control (hardcoded to `createdAt DESC`) and returns all fields regardless of use case.

## Solution Summary

Introduce **TOON (Token-Oriented Object Notation)** as the default response format with **verbosity presets**, **explicit field selection**, and **multi-field sorting** for `atlas_project_list`.

## Goals

- **60% token reduction** on project list responses using TOON format
- **Flexible field selection** via verbosity presets or explicit field arrays
- **Multi-field sorting** with intuitive string shorthand syntax
- **Backwards compatible** JSON option for tooling/debugging

## Non-Goals (YAGNI)

- Extending to tasks/knowledge (future iteration)
- Custom TOON implementation (use npm package)
- Smart detection of caller type

## Dependencies

- `@toon-format/toon` npm package for encoding

---

## API Changes

### New Parameters for `atlas_project_list`

```typescript
{
  // Existing parameters (unchanged)
  mode?: "all" | "details",
  id?: string,
  page?: number,
  limit?: number,
  includeKnowledge?: boolean,
  includeTasks?: boolean,
  taskType?: string,
  status?: ProjectStatus | ProjectStatus[],

  // NEW: Response format (default changes from "formatted" to "toon")
  responseFormat?: "toon" | "json" | "formatted",  // default: "toon"

  // NEW: Verbosity presets
  verbosity?: "minimal" | "standard" | "full",     // default: "standard"

  // NEW: Explicit field selection (overrides verbosity when specified)
  fields?: string[],

  // NEW: Multi-field sorting with direction prefix
  sortBy?: string | string[],  // e.g., ["status", "name", "-createdAt"]
}
```

### Parameter Interactions

| Scenario                         | Behavior                                              |
| -------------------------------- | ----------------------------------------------------- |
| Neither `verbosity` nor `fields` | Uses `verbosity: "standard"`                          |
| Only `verbosity` specified       | Uses preset field set                                 |
| Only `fields` specified          | Uses exactly those fields (ignores default verbosity) |
| Both specified                   | `fields` wins, `verbosity` ignored                    |

### Sort String Syntax

```
"fieldName"   → ascending (default)
"-fieldName"  → descending
"+fieldName"  → explicit ascending (optional)
```

**Sortable fields:** `name`, `status`, `taskType`, `createdAt`, `updatedAt`

---

## Verbosity Presets

### Project Field Tiers

| Field                  | minimal | standard | full |
| ---------------------- | :-----: | :------: | :--: |
| id                     |    Y    |    Y     |  Y   |
| name                   |    Y    |    Y     |  Y   |
| status                 |    Y    |    Y     |  Y   |
| taskType               |    Y    |    Y     |  Y   |
| createdAt              |         |    Y     |  Y   |
| description            |         |          |  Y   |
| updatedAt              |         |          |  Y   |
| urls                   |         |          |  Y   |
| completionRequirements |         |          |  Y   |
| outputFormat           |         |          |  Y   |

### Nested Entity Verbosity (Fixed Minimal)

When `includeTasks: true` or `includeKnowledge: true`:

**Tasks (fixed minimal):**

- id, title, status, priority

**Knowledge (fixed minimal):**

- id, domain, tags

This prevents token explosion while providing useful context. Agents needing full details should call `atlas_task_list` or `atlas_knowledge_list` separately.

---

## TOON Output Format

### Example: Minimal Verbosity (List Mode)

```toon
projects[3]{id,name,status,taskType}:
 abc123,Project Alpha,active,research
 def456,Project Beta,completed,analysis
 ghi789,Project Gamma,in-progress,generation
pagination:
 total: 3
 page: 1
 totalPages: 1
```

### Example: Standard Verbosity

```toon
projects[3]{id,name,status,taskType,createdAt}:
 abc123,Project Alpha,active,research,2025-12-01T10:00:00Z
 def456,Project Beta,completed,analysis,2025-12-15T14:30:00Z
 ghi789,Project Gamma,in-progress,generation,2025-12-20T09:15:00Z
pagination:
 total: 3
 page: 1
 totalPages: 1
```

### Example: With Nested Tasks (Fixed Minimal)

```toon
projects[1]{id,name,status,taskType,createdAt}:
 abc123,Project Alpha,active,research,2025-12-01T10:00:00Z
project_abc123_tasks[2]{id,title,status,priority}:
 task001,Implement feature X,in-progress,high
 task002,Write documentation,todo,medium
pagination:
 total: 1
 page: 1
 totalPages: 1
```

### Token Comparison (10 projects, standard verbosity)

| Format            | Estimated Tokens |
| ----------------- | ---------------- |
| Current formatted | ~2,400           |
| JSON              | ~1,800           |
| **TOON**          | **~720**         |

**Savings: ~70% vs current, ~60% vs JSON**

---

## Implementation Architecture

### File Changes

```
src/mcp/tools/atlas_project_list/
├── index.ts           # Add new schema params
├── types.ts           # Add new type definitions
├── listProjects.ts    # Add field filtering, sorting logic
├── responseFormat.ts  # Add TOON encoder, refactor formatters
└── fieldPresets.ts    # NEW: Verbosity preset definitions
```

### New Module: `fieldPresets.ts`

```typescript
export const PROJECT_FIELD_PRESETS = {
  minimal: ["id", "name", "status", "taskType"],
  standard: ["id", "name", "status", "taskType", "createdAt"],
  full: [
    "id",
    "name",
    "status",
    "taskType",
    "createdAt",
    "description",
    "updatedAt",
    "urls",
    "completionRequirements",
    "outputFormat",
  ],
} as const;

export const NESTED_TASK_FIELDS = ["id", "title", "status", "priority"];
export const NESTED_KNOWLEDGE_FIELDS = ["id", "domain", "tags"];
```

### Service Layer Changes

**`projectService.ts`:**

- Modify `getProjects()` to accept `sortBy` array parameter
- Parse sort strings to extract field and direction
- Build dynamic `ORDER BY` clause

**`helpers.ts`:**

- Extend `buildListQuery()` to support multi-field sorting

### Response Flow

```
Request → Validate params → Query DB (with sorting)
        → Filter fields (verbosity/explicit)
        → Encode response (TOON/JSON/formatted)
        → Return
```

---

## Schema & Validation

### Zod Schema Updates

```typescript
// New enums
const VerbosityLevel = z.enum(["minimal", "standard", "full"]);
const ResponseFormat = z.enum(["toon", "json", "formatted"]);
const SortableField = z.enum(["name", "status", "taskType", "createdAt", "updatedAt"]);

// Sort string validation (allows "-" prefix)
const SortString = z.string().regex(/^[+-]?(name|status|taskType|createdAt|updatedAt)$/);

// Schema additions
{
  responseFormat: ResponseFormat.default("toon"),
  verbosity: VerbosityLevel.default("standard"),
  fields: z.array(z.string()).optional(),
  sortBy: z.union([
    SortString,
    z.array(SortString)
  ]).optional().default("createdAt"),
}
```

### Validation Rules

1. **Unknown fields in `fields` array** - Warning logged, field ignored
2. **Invalid sort field** - Error returned
3. **Empty `fields` array** - Falls back to `verbosity: "standard"`
4. **`mode: "details"` with verbosity** - Always returns full (single project = no savings from limiting fields)

---

## Error Handling & Edge Cases

### TOON Encoding Failures

```typescript
try {
  return encodeToon(data);
} catch (error) {
  logger.warn("TOON encoding failed, falling back to JSON", { error });
  return JSON.stringify(data);
}
```

### Edge Cases

| Case                            | Behavior                                                         |
| ------------------------------- | ---------------------------------------------------------------- |
| `fields: []` (empty)            | Use `verbosity: "standard"`                                      |
| `fields` contains invalid field | Ignore invalid, use valid ones; warn in logs                     |
| `sortBy` contains invalid field | Return validation error                                          |
| `sortBy: []` (empty)            | Use default `["createdAt"]`                                      |
| No projects match filters       | Return empty TOON array: `projects[0]{id,name,status,taskType}:` |
| Special chars in project name   | TOON auto-quotes strings containing `,` `:` etc.                 |

---

## Breaking Changes

1. **Default response format** changes from `formatted` to `toon`
2. **Default field set** changes from all fields to standard verbosity

## Migration Guide

```markdown
### atlas_project_list default response format

The default `responseFormat` is now `"toon"` (was `"formatted"`).

**If you parse the formatted text output**, add `responseFormat: "json"` to your calls:

{ "responseFormat": "json" }

**If you're an AI agent**, no changes needed - you'll automatically
receive more efficient TOON format.

### New features

- `verbosity`: Control field inclusion ("minimal" | "standard" | "full")
- `fields`: Explicit field selection (overrides verbosity)
- `sortBy`: Multi-field sorting with direction prefix
```

---

## Summary

| Aspect          | Decision                                        |
| --------------- | ----------------------------------------------- |
| Response format | TOON default, JSON/formatted available          |
| Field selection | Verbosity presets + explicit `fields` override  |
| Verbosity tiers | minimal (4), standard (5), full (10 fields)     |
| Nested entities | Fixed minimal verbosity                         |
| Sorting         | Multi-field, string shorthand (`-field` = desc) |
| Scope           | Projects only (tasks/knowledge later)           |
| Implementation  | `@toon-format/toon` npm package                 |
| Breaking change | Yes - new defaults                              |
