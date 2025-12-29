/**
 * Field presets for knowledge verbosity levels
 */

export const KNOWLEDGE_FIELDS = {
  id: true,
  domain: true,
  tags: true,
  projectId: true,
  createdAt: true,
  text: true,
  updatedAt: true,
  citations: true,
  projectName: true,
} as const;

export type KnowledgeField = keyof typeof KNOWLEDGE_FIELDS;

export const KNOWLEDGE_FIELD_PRESETS = {
  minimal: ["id", "domain", "tags"] as const,
  standard: ["id", "domain", "tags", "projectId", "createdAt"] as const,
  full: [
    "id",
    "domain",
    "tags",
    "projectId",
    "createdAt",
    "text",
    "updatedAt",
    "citations",
    "projectName",
  ] as const,
} as const;

export type VerbosityLevel = keyof typeof KNOWLEDGE_FIELD_PRESETS;

export const SORTABLE_KNOWLEDGE_FIELDS = [
  "domain",
  "createdAt",
  "updatedAt",
] as const;

export type SortableKnowledgeField = (typeof SORTABLE_KNOWLEDGE_FIELDS)[number];

/**
 * Validate and filter fields against allowed knowledge fields
 */
export function validateKnowledgeFields(fields: string[]): {
  valid: KnowledgeField[];
  invalid: string[];
} {
  const valid: KnowledgeField[] = [];
  const invalid: string[] = [];

  for (const field of fields) {
    if (field in KNOWLEDGE_FIELDS) {
      valid.push(field as KnowledgeField);
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
): KnowledgeField[] {
  if (explicitFields && explicitFields.length > 0) {
    const { valid, invalid } = validateKnowledgeFields(explicitFields);
    if (invalid.length > 0) {
      console.warn(`Invalid fields ignored: ${invalid.join(", ")}`);
    }
    return valid.length > 0 ? valid : [...KNOWLEDGE_FIELD_PRESETS.standard];
  }
  return [...KNOWLEDGE_FIELD_PRESETS[verbosity]];
}
