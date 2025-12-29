import { encode as encodeToon } from "@toon-format/toon";
import { Neo4jTask } from "../../../services/neo4j/types.js";
import { createToolResponse, McpToolResponse, ResponseFormat } from "../../../types/mcp.js";
import { logger, requestContextService } from "../../../utils/index.js";
import { TaskListResponse } from "./types.js";
import {
  TaskField,
  resolveFields,
  VerbosityLevel,
} from "./fieldPresets.js";

/**
 * Filter a task to only include specified fields
 */
function filterTaskFields(
  task: Neo4jTask,
  fields: TaskField[],
): Partial<Neo4jTask> {
  const filtered: Partial<Neo4jTask> = {};
  for (const field of fields) {
    if (field in task) {
      (filtered as unknown as Record<string, unknown>)[field] = (
        task as unknown as Record<string, unknown>
      )[field];
    }
  }
  return filtered;
}

/**
 * Apply field filtering to the entire response
 */
export function applyFieldFiltering(
  response: TaskListResponse,
  verbosity: VerbosityLevel = "standard",
  explicitFields?: string[],
): TaskListResponse {
  const fields = resolveFields(verbosity, explicitFields);

  const filteredTasks = response.tasks.map((task) => {
    return filterTaskFields(task, fields) as Neo4jTask;
  });

  return {
    ...response,
    tasks: filteredTasks,
  };
}

/**
 * Encode response data to TOON format
 */
function encodeToToon(data: TaskListResponse): string {
  try {
    const toonData: Record<string, unknown> = {
      tasks: data.tasks,
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
 * Formatter for task list responses
 */
class TaskListFormatter {
  format(data: TaskListResponse): string {
    const { tasks = [], total, page, limit, totalPages } = data;

    if (!Array.isArray(tasks)) {
      return "Error: Invalid task data received.";
    }

    const summary =
      `Task List\n\n` +
      `Found ${total} task(s)\n` +
      `Page ${page} of ${totalPages} (${limit} per page)\n`;

    if (tasks.length === 0) {
      return `${summary}\nNo tasks found matching the specified criteria.`;
    }

    let tasksSection = "Tasks:\n\n";

    tasksSection += tasks
      .map((taskData, index) => {
        if (!taskData) {
          return null;
        }

        const task = taskData as Neo4jTask & {
          assignedToUserId: string | null;
        };

        const statusIndicator = this.getStatusIndicator(task.status);
        const priorityIndicator = this.getPriorityIndicator(task.priority);

        const assignedToLine = task.assignedToUserId
          ? `   Assigned To: ${task.assignedToUserId}\n`
          : "";

        return (
          `${index + 1}. ${statusIndicator} ${priorityIndicator} ${task.title}\n` +
          `   ID: ${task.id}\n` +
          `   Status: ${task.status}\n` +
          `   Priority: ${task.priority}\n` +
          assignedToLine +
          (Array.isArray(task.tags) && task.tags.length > 0
            ? `   Tags: ${task.tags.join(", ")}\n`
            : "") +
          `   Type: ${task.taskType}\n` +
          `   Created: ${new Date(task.createdAt).toLocaleString()}\n`
        );
      })
      .filter(Boolean)
      .join("\n");

    let paginationHelp = "";
    if (totalPages > 1) {
      paginationHelp = `\nTo view more tasks, use 'page' parameter (current: ${page}, total pages: ${totalPages}).`;
    }

    return `${summary}\n${tasksSection}${paginationHelp}`;
  }

  private getStatusIndicator(status: string): string {
    switch (status) {
      case "backlog":
        return "[B]";
      case "todo":
        return "[T]";
      case "in_progress":
        return "[P]";
      case "completed":
        return "[C]";
      default:
        return "[?]";
    }
  }

  private getPriorityIndicator(priority: string): string {
    switch (priority) {
      case "critical":
        return "[!!!]";
      case "high":
        return "[!!]";
      case "medium":
        return "[!]";
      case "low":
        return "[-]";
      default:
        return "[?]";
    }
  }
}

/**
 * Format response based on the requested format
 */
export function formatResponse(
  data: TaskListResponse,
  responseFormat: ResponseFormat,
  verbosity: VerbosityLevel = "standard",
  explicitFields?: string[],
): McpToolResponse {
  const filteredData = applyFieldFiltering(data, verbosity, explicitFields);

  switch (responseFormat) {
    case ResponseFormat.TOON:
      return createToolResponse(encodeToToon(filteredData));

    case ResponseFormat.JSON:
      return createToolResponse(JSON.stringify(filteredData, null, 2));

    case ResponseFormat.FORMATTED:
    default:
      const formatter = new TaskListFormatter();
      return createToolResponse(formatter.format(filteredData));
  }
}

/**
 * Create a formatted, human-readable response for the atlas_task_list tool
 * @deprecated Use formatResponse instead for full format support
 */
export function formatTaskListResponse(
  data: TaskListResponse,
  isError = false,
): McpToolResponse {
  const formatter = new TaskListFormatter();
  const formattedText = formatter.format(data);
  return createToolResponse(formattedText, isError);
}
