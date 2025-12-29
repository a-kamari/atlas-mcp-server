/**
 * Field presets for project verbosity levels
 */

export const PROJECT_FIELDS = {
  id: true,
  name: true,
  status: true,
  taskType: true,
  createdAt: true,
  description: true,
  updatedAt: true,
  urls: true,
  completionRequirements: true,
  outputFormat: true,
} as const;

export type ProjectField = keyof typeof PROJECT_FIELDS;

export const PROJECT_FIELD_PRESETS = {
  minimal: ["id", "name", "status", "taskType"] as const,
  standard: ["id", "name", "status", "taskType", "createdAt"] as const,
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
  ] as const,
} as const;

export type VerbosityLevel = keyof typeof PROJECT_FIELD_PRESETS;

export const NESTED_TASK_FIELDS = [
  "id",
  "title",
  "status",
  "priority",
] as const;
export const NESTED_KNOWLEDGE_FIELDS = ["id", "domain", "tags"] as const;

export const SORTABLE_PROJECT_FIELDS = [
  "name",
  "status",
  "taskType",
  "createdAt",
  "updatedAt",
] as const;
export type SortableProjectField = (typeof SORTABLE_PROJECT_FIELDS)[number];

/**
 * Validate and filter fields against allowed project fields
 */
export function validateProjectFields(fields: string[]): {
  valid: ProjectField[];
  invalid: string[];
} {
  const valid: ProjectField[] = [];
  const invalid: string[] = [];

  for (const field of fields) {
    if (field in PROJECT_FIELDS) {
      valid.push(field as ProjectField);
    } else {
      invalid.push(field);
    }
  }

  return { valid, invalid };
}

/**
 * Get fields for a verbosity level, or explicit fields if provided
 */
export function resolveFields(
  verbosity: VerbosityLevel = "standard",
  explicitFields?: string[],
): ProjectField[] {
  if (explicitFields && explicitFields.length > 0) {
    const { valid, invalid } = validateProjectFields(explicitFields);
    if (invalid.length > 0) {
      // Log warning but continue with valid fields
      console.warn(`Invalid fields ignored: ${invalid.join(", ")}`);
    }
    return valid.length > 0 ? valid : [...PROJECT_FIELD_PRESETS.standard];
  }
  return [...PROJECT_FIELD_PRESETS[verbosity]];
}
