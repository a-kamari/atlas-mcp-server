import { z } from "zod";
import { SearchResultItem } from "../../../services/neo4j/index.js";

// Schema for the tool input
export const UnifiedSearchRequestSchema = z.object({
  property: z
    .string()
    .optional()
    .describe(
      "Optional: Target a specific property for search. If specified, a regex-based search is performed on this property (e.g., 'name', 'description', 'text', 'tags', 'urls'). If omitted, a full-text index search is performed across default fields for each entity type (typically includes fields like name, title, description, text, tags, but depends on index configuration).",
    ),
  value: z.string().describe("The search term or phrase."),
  entityTypes: z
    .array(z.enum(["project", "task", "knowledge"]))
    .optional()
    .describe(
      "Array of entity types ('project', 'task', 'knowledge') to include in search (Default: all types if omitted)",
    ),
  caseInsensitive: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "For regex search (when 'property' is specified): Controls case sensitivity of the search (Default: true for case-insensitive). Not applicable to full-text index searches which are inherently case-insensitive.",
    ),
  fuzzy: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Search behavior control: For regex search (when 'property' is specified): enables 'contains' matching when true (default), exact match when false. For full-text search (when 'property' is omitted): enables Lucene fuzzy matching (~1) when true, standard term match when false. Note: Different search paths may interpret this parameter differently based on available indexes.",
    ),
  taskType: z
    .string()
    .optional()
    .describe(
      "Optional filter by project/task classification (applies to project and task types)",
    ),
  assignedToUserId: z
    .string()
    .optional()
    .describe(
      "Optional: Filter tasks by the ID of the assigned user. Only applicable when 'property' is specified (regex search) and 'entityTypes' includes 'task'.",
    ),
  page: z
    .number()
    .int()
    .positive()
    .optional()
    .default(1)
    .describe("Page number for paginated results (Default: 1)"),
  limit: z
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .default(20)
    .describe("Number of results per page, maximum 100 (Default: 20)"),
});

export type UnifiedSearchRequestInput = z.infer<
  typeof UnifiedSearchRequestSchema
>;

export interface UnifiedSearchResponse {
  results: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
