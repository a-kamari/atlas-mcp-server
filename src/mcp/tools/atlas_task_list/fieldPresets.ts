/**
 * Field presets for task verbosity levels
 */

export const TASK_FIELDS = {
  id: true,
  title: true,
  status: true,
  priority: true,
  projectId: true,
  createdAt: true,
  description: true,
  updatedAt: true,
  assignedTo: true,
  tags: true,
  taskType: true,
  completionRequirements: true,
  outputFormat: true,
  urls: true,
} as const;

export type TaskField = keyof typeof TASK_FIELDS;

export const TASK_FIELD_PRESETS = {
  minimal: ["id", "title", "status", "priority"] as const,
  standard: ["id", "title", "status", "priority", "projectId", "createdAt"] as const,
  full: [
    "id",
    "title",
    "status",
    "priority",
    "projectId",
    "createdAt",
    "description",
    "updatedAt",
    "assignedTo",
    "tags",
    "taskType",
    "completionRequirements",
    "outputFormat",
    "urls",
  ] as const,
} as const;

export type VerbosityLevel = keyof typeof TASK_FIELD_PRESETS;

export const SORTABLE_TASK_FIELDS = [
  "priority",
  "createdAt",
  "status",
  "title",
  "updatedAt",
] as const;

export type SortableTaskField = (typeof SORTABLE_TASK_FIELDS)[number];

/**
 * Validate and filter fields against allowed task fields
 */
export function validateTaskFields(fields: string[]): {
  valid: TaskField[];
  invalid: string[];
} {
  const valid: TaskField[] = [];
  const invalid: string[] = [];

  for (const field of fields) {
    if (field in TASK_FIELDS) {
      valid.push(field as TaskField);
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
): TaskField[] {
  if (explicitFields && explicitFields.length > 0) {
    const { valid, invalid } = validateTaskFields(explicitFields);
    if (invalid.length > 0) {
      console.warn(`Invalid fields ignored: ${invalid.join(", ")}`);
    }
    return valid.length > 0 ? valid : [...TASK_FIELD_PRESETS.standard];
  }
  return [...TASK_FIELD_PRESETS[verbosity]];
}
