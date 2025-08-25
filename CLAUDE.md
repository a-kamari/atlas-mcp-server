# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Build and Development

- `npm run build` - Build the TypeScript project and make executable
- `npm run dev` - Watch mode for TypeScript compilation
- `npm run rebuild` - Clean and rebuild project completely
- `npm run format` - Format code with Prettier

### Database Operations

- `npm run db:backup` - Create database backup with timestamped directory
- `npm run db:import <backup_path>` - Restore database from backup (destructive)
- `npm run docker:up` - Start Neo4j database (alias for docker-compose up -d)
- `npm run docker:down` - Stop Neo4j database (alias for docker-compose down)
- `npm run docker:logs` - View Docker container logs

### Running the Server

- `npm run start:stdio` - Run with stdio transport (default for MCP clients)
- `npm run start:http` - Run with HTTP transport on localhost:3010
- `npm run inspector` - Run MCP inspector for debugging tools and resources

### Testing and Quality

- `npm run webui` - Open basic web UI for viewing data at http://localhost:8000
- `npm run tree` - Generate project structure documentation
- `npm run docs:generate` - Generate TypeDoc API documentation
- `npm run fetch-spec` - Fetch OpenAPI specification (development utility)

## Core Architecture

ATLAS is an MCP (Model Context Protocol) server with a three-tier Neo4j-backed architecture:

**Transport Layer** (`src/mcp/transports/`):

- `stdioTransport.ts` - Direct stdio communication (default)
- `httpTransport.ts` - HTTP server with authentication/rate limiting

**MCP Layer** (`src/mcp/`):

- `server.ts` - Main MCP server setup, tool/resource registration
- `tools/` - MCP tool implementations (15 total tools)
- `resources/` - MCP resource handlers for direct data access

**Data Layer** (`src/services/neo4j/`):

- Core services: `projectService.ts`, `taskService.ts`, `knowledgeService.ts`
- `searchService.ts` - Unified search across all entities
- `backupRestoreService.ts` - Database backup/restore operations

**Three-Tier Data Model**:

```
PROJECT (top-level containers)
├── TASK (actionable items within projects)
├── KNOWLEDGE (information/context for projects)
└── DEPENDENCIES (relationships between entities)
```

## Configuration

Environment variables are validated via Zod schema in `src/config/index.ts`. Key settings:

**Database**: `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`
**Transport**: `MCP_TRANSPORT_TYPE` (stdio/http), `MCP_HTTP_PORT` (3010)  
**Logging**: `MCP_LOG_LEVEL` (debug), `LOGS_DIR` (./logs)
**Backup**: `BACKUP_FILE_DIR` (./atlas-backups), `BACKUP_MAX_COUNT` (10)

## Available MCP Tools

The server exposes 14 MCP tools across 4 categories:

**Project Management**: `atlas_project_create`, `atlas_project_list`, `atlas_project_update`, `atlas_project_delete`
**Task Management**: `atlas_task_create`, `atlas_task_list`, `atlas_task_update`, `atlas_task_delete`  
**Knowledge Management**: `atlas_knowledge_add`, `atlas_knowledge_list`, `atlas_knowledge_delete`
**Search & Utility**: `atlas_unified_search`, `atlas_deep_research`, `atlas_database_clean`

All tools support both single and bulk operations via `mode` parameter and include comprehensive input validation with Zod schemas.

## Key Implementation Notes

- Request context tracking for all operations (`src/utils/internal/requestContext.ts`)
- Structured logging with Winston (`src/utils/internal/logger.ts`)
- Backup/restore creates timestamped directories with JSON exports
- Rate limiting and authentication available for HTTP transport
- Token counting utilities for LLM usage tracking (`src/utils/metrics/tokenCounter.ts`)
- Security features: input sanitization, ID generation, rate limiting (`src/utils/security/`)

## Database Schema

Neo4j constraints and indexes are auto-created on startup via `initializeNeo4jSchema()`. Core node types:

- `Project` nodes with unique `id` constraint
- `Task` nodes with unique `id` constraint, linked to projects via `BELONGS_TO`
- `Knowledge` nodes with unique `id` constraint, linked to projects via `BELONGS_TO`
- `DEPENDS_ON` relationships for dependency tracking between all entity types

## Development Workflow

1. **Environment Setup**: Copy `.env.example` to `.env` and configure Neo4j connection
2. **Database**: Start Neo4j with `npm run docker:up` (requires Docker)
3. **Build**: Use `npm run build` for production or `npm run dev` for watch mode
4. **Testing**: Use `npm run inspector` to test MCP tools interactively
5. **Debugging**: Check logs in `./logs/` directory or use `npm run docker:logs`
6. **Data Safety**: Always backup before major changes with `npm run db:backup`
