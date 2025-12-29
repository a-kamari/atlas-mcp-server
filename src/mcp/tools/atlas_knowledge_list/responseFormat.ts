import { encode as encodeToon } from "@toon-format/toon";
import { createToolResponse, ResponseFormat } from "../../../types/mcp.js";
import { logger, requestContextService } from "../../../utils/index.js";
import { KnowledgeListResponse, KnowledgeItem } from "./types.js";
import {
  KnowledgeField,
  resolveFields,
  VerbosityLevel,
} from "./fieldPresets.js";

/**
 * Filter a knowledge item to only include specified fields
 */
function filterKnowledgeFields(
  item: KnowledgeItem,
  fields: KnowledgeField[],
): Partial<KnowledgeItem> {
  const filtered: Partial<KnowledgeItem> = {};
  for (const field of fields) {
    if (field in item) {
      (filtered as unknown as Record<string, unknown>)[field] = (
        item as unknown as Record<string, unknown>
      )[field];
    }
  }
  return filtered;
}

/**
 * Apply field filtering to the entire response
 */
export function applyFieldFiltering(
  response: KnowledgeListResponse,
  verbosity: VerbosityLevel = "standard",
  explicitFields?: string[],
): KnowledgeListResponse {
  const fields = resolveFields(verbosity, explicitFields);

  const filteredKnowledge = response.knowledge.map((item) => {
    return filterKnowledgeFields(item, fields) as KnowledgeItem;
  });

  return {
    ...response,
    knowledge: filteredKnowledge,
  };
}

/**
 * Encode response data to TOON format
 */
function encodeToToon(data: KnowledgeListResponse): string {
  try {
    const toonData: Record<string, unknown> = {
      knowledge: data.knowledge,
      pagination: {
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      },
    };

    return encodeToon(toonData);
  } catch (error) {
    const reqContext = requestContextService.createRequestContext({
      toolName: "encodeToToon",
    });
    logger.warning("TOON encoding failed, falling back to JSON", {
      ...reqContext,
      error: error instanceof Error ? error.message : String(error),
    });
    return JSON.stringify(data, null, 2);
  }
}

/**
 * Formatter for structured knowledge query responses
 */
export class KnowledgeListFormatter {
  format(data: KnowledgeListResponse): string {
    const { knowledge, total, page, limit, totalPages } = data;

    const summary =
      `Knowledge Repository\n\n` +
      `Total Items: ${total}\n` +
      `Page: ${page} of ${totalPages}\n` +
      `Displaying: ${Math.min(limit, knowledge.length)} item(s) per page\n`;

    if (knowledge.length === 0) {
      return `${summary}\n\nNo knowledge items matched the specified criteria`;
    }

    const knowledgeSections = knowledge
      .map((item, index) => {
        const {
          id,
          projectId,
          projectName,
          domain,
          tags,
          text,
          citations,
          createdAt,
          updatedAt,
        } = item;

        let knowledgeSection =
          `${index + 1}. ${domain || "Uncategorized"} Knowledge\n\n` +
          `ID: ${id}\n` +
          `Project: ${projectName || projectId}\n` +
          `Domain: ${domain}\n`;

        if (tags && tags.length > 0) {
          knowledgeSection += `Tags: ${tags.join(", ")}\n`;
        }

        const createdDate = createdAt
          ? new Date(createdAt).toLocaleString()
          : "Unknown Date";
        const updatedDate = updatedAt
          ? new Date(updatedAt).toLocaleString()
          : "Unknown Date";

        knowledgeSection +=
          `Created: ${createdDate}\n` + `Updated: ${updatedDate}\n\n`;

        knowledgeSection += `Content:\n${text || "No content available"}\n`;

        if (citations && citations.length > 0) {
          knowledgeSection += `\nCitations:\n`;
          citations.forEach((citation, citIndex) => {
            knowledgeSection += `${citIndex + 1}. ${citation}\n`;
          });
        }

        return knowledgeSection;
      })
      .join("\n\n----------\n\n");

    let paginationInfo = "";
    if (totalPages > 1) {
      paginationInfo =
        `\n\nPagination Controls\n\n` +
        `Viewing page ${page} of ${totalPages}.\n` +
        `${page < totalPages ? "Use 'page' parameter to navigate to additional results." : ""}`;
    }

    return `${summary}\n\n${knowledgeSections}${paginationInfo}`;
  }
}

/**
 * Format response based on the requested format
 */
export function formatResponse(
  data: KnowledgeListResponse,
  responseFormat: ResponseFormat,
  verbosity: VerbosityLevel = "standard",
  explicitFields?: string[],
): ReturnType<typeof createToolResponse> {
  const filteredData = applyFieldFiltering(data, verbosity, explicitFields);

  switch (responseFormat) {
    case ResponseFormat.TOON:
      return createToolResponse(encodeToToon(filteredData));

    case ResponseFormat.JSON:
      return createToolResponse(JSON.stringify(filteredData, null, 2));

    case ResponseFormat.FORMATTED:
    default:
      const formatter = new KnowledgeListFormatter();
      return createToolResponse(formatter.format(filteredData));
  }
}

/**
 * Create a human-readable formatted response for the atlas_knowledge_list tool
 * @deprecated Use formatResponse instead for full format support
 */
export function formatKnowledgeListResponse(
  data: unknown,
  isError = false,
): ReturnType<typeof createToolResponse> {
  const formatter = new KnowledgeListFormatter();
  const formattedText = formatter.format(data as KnowledgeListResponse);
  return createToolResponse(formattedText, isError);
}
