import { encode as encodeToon } from "@toon-format/toon";
import { createToolResponse, ResponseFormat } from "../../../types/mcp.js";
import { logger, requestContextService } from "../../../utils/index.js";
import { Project, ProjectListResponse, Task, Knowledge } from "./types.js";
import {
  ProjectField,
  resolveFields,
  VerbosityLevel,
  NESTED_TASK_FIELDS,
  NESTED_KNOWLEDGE_FIELDS,
} from "./fieldPresets.js";

/**
 * Defines a generic interface for formatting data into a string.
 */
interface ResponseFormatter<T> {
  format(data: T): string;
}

/**
 * Filter a project to only include specified fields
 */
function filterProjectFields(
  project: Project,
  fields: ProjectField[],
): Partial<Project> {
  const filtered: Partial<Project> = {};
  for (const field of fields) {
    if (field in project) {
      (filtered as unknown as Record<string, unknown>)[field] = (
        project as unknown as Record<string, unknown>
      )[field];
    }
  }
  return filtered;
}

/**
 * Filter a task to only include minimal fields
 */
function filterTaskFields(
  task: Task,
): Pick<Task, "id" | "title" | "status" | "priority"> {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
  };
}

/**
 * Filter a knowledge item to only include minimal fields
 */
function filterKnowledgeFields(
  knowledge: Knowledge,
): Pick<Knowledge, "id" | "domain" | "tags"> {
  return {
    id: knowledge.id,
    domain: knowledge.domain,
    tags: knowledge.tags,
  };
}

/**
 * Apply field filtering to the entire response
 */
export function applyFieldFiltering(
  response: ProjectListResponse,
  verbosity: VerbosityLevel = "standard",
  explicitFields?: string[],
): ProjectListResponse {
  const fields = resolveFields(verbosity, explicitFields);

  const filteredProjects = response.projects.map((project) => {
    const filtered = filterProjectFields(project, fields) as Project;

    // Apply fixed minimal verbosity to nested entities
    if (project.tasks && project.tasks.length > 0) {
      filtered.tasks = project.tasks.map(filterTaskFields) as Task[];
    }
    if (project.knowledge && project.knowledge.length > 0) {
      filtered.knowledge = project.knowledge.map(
        filterKnowledgeFields,
      ) as Knowledge[];
    }

    return filtered;
  });

  return {
    ...response,
    projects: filteredProjects,
  };
}

/**
 * Encode response data to TOON format
 */
function encodeToToon(data: ProjectListResponse): string {
  try {
    // Prepare data structure for TOON encoding
    const toonData: Record<string, unknown> = {
      projects: data.projects,
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
 * Formatter for structured project query responses (formatted text output)
 */
export class ProjectListFormatter
  implements ResponseFormatter<ProjectListResponse>
{
  /**
   * Get an emoji indicator for the task status
   */
  private getStatusEmoji(status: string): string {
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

  /**
   * Get a visual indicator for the priority level
   */
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
  format(data: ProjectListResponse): string {
    const { projects, total, page, limit, totalPages } = data;

    // Generate result summary section
    const summary =
      `Project Portfolio\n\n` +
      `Total Entities: ${total}\n` +
      `Page: ${page} of ${totalPages}\n` +
      `Displaying: ${Math.min(limit, projects.length)} project(s) per page\n`;

    if (projects.length === 0) {
      return `${summary}\n\nNo project entities matched the specified criteria`;
    }

    // Format each project
    const projectsSections = projects
      .map((project, index) => {
        // Access properties directly from the project object
        const { name, id, status, taskType, createdAt } = project;

        let projectSection =
          `${index + 1}. ${name || "Unnamed Project"}\n\n` +
          `ID: ${id || "Unknown ID"}\n` +
          `Status: ${status || "Unknown Status"}\n` +
          `Type: ${taskType || "Unknown Type"}\n` +
          `Created: ${createdAt ? new Date(createdAt).toLocaleString() : "Unknown Date"}\n`;

        // Add project details in plain text format
        projectSection += `\nProject Details\n\n`;

        // Add each property with proper formatting, accessing directly from 'project'
        if (project.id) projectSection += `ID: ${project.id}\n`;
        if (project.name) projectSection += `Name: ${project.name}\n`;
        if (project.description)
          projectSection += `Description: ${project.description}\n`;
        if (project.status) projectSection += `Status: ${project.status}\n`;

        // Format URLs array
        if (project.urls) {
          const urlsValue =
            Array.isArray(project.urls) && project.urls.length > 0
              ? project.urls
                  .map((u) => `${u.title}: ${u.url}`)
                  .join("\n           ") // Improved formatting for URLs
              : "None";
          projectSection += `URLs: ${urlsValue}\n`;
        }

        if (project.completionRequirements)
          projectSection += `Completion Requirements: ${project.completionRequirements}\n`;
        if (project.outputFormat)
          projectSection += `Output Format: ${project.outputFormat}\n`;
        if (project.taskType)
          projectSection += `Task Type: ${project.taskType}\n`;

        // Format dates
        if (project.createdAt) {
          const createdDate =
            typeof project.createdAt === "string" &&
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(project.createdAt)
              ? new Date(project.createdAt).toLocaleString()
              : project.createdAt;
          projectSection += `Created At: ${createdDate}\n`;
        }

        if (project.updatedAt) {
          const updatedDate =
            typeof project.updatedAt === "string" &&
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(project.updatedAt)
              ? new Date(project.updatedAt).toLocaleString()
              : project.updatedAt;
          projectSection += `Updated At: ${updatedDate}\n`;
        }

        // Add tasks if included
        if (project.tasks && project.tasks.length > 0) {
          projectSection += `\nTasks (${project.tasks.length}):\n`;

          projectSection += project.tasks
            .map((task, taskIndex) => {
              const taskTitle = task.title || "Unnamed Task";
              const taskId = task.id || "Unknown ID";
              const taskStatus = task.status || "Unknown Status";
              const taskPriority = task.priority || "Unknown Priority";
              const taskCreatedAt = task.createdAt
                ? new Date(task.createdAt).toLocaleString()
                : "Unknown Date";

              const statusIndicator = this.getStatusEmoji(taskStatus);
              const priorityIndicator = this.getPriorityIndicator(taskPriority);

              return (
                `  ${taskIndex + 1}. ${statusIndicator} ${priorityIndicator} ${taskTitle}\n` +
                `     ID: ${taskId}\n` +
                `     Status: ${taskStatus}\n` +
                `     Priority: ${taskPriority}\n` +
                `     Created: ${taskCreatedAt}`
              );
            })
            .join("\n\n");
          projectSection += "\n";
        }

        // Add knowledge if included
        if (project.knowledge && project.knowledge.length > 0) {
          projectSection += `\nKnowledge Items (${project.knowledge.length}):\n`;

          projectSection += project.knowledge
            .map((item, itemIndex) => {
              return (
                `  ${itemIndex + 1}. ${item.domain || "Uncategorized"} (ID: ${item.id || "N/A"})\n` +
                `     Tags: ${item.tags && item.tags.length > 0 ? item.tags.join(", ") : "None"}\n` +
                `     Created: ${item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}\n` +
                `     Content Preview: ${item.text || "No content available"}`
              ); // Preview already truncated if needed
            })
            .join("\n\n");
          projectSection += "\n";
        }

        return projectSection;
      })
      .join("\n\n----------\n\n");

    // Append pagination metadata for multi-page results
    let paginationInfo = "";
    if (totalPages > 1) {
      paginationInfo =
        `\n\nPagination Controls:\n` + // Added colon for clarity
        `Viewing page ${page} of ${totalPages}.\n` +
        `${page < totalPages ? "Use 'page' parameter to navigate to additional results." : "You are on the last page."}`;
    }

    return `${summary}\n\n${projectsSections}${paginationInfo}`;
  }
}

/**
 * Format response based on the requested format
 */
export function formatResponse(
  data: ProjectListResponse,
  responseFormat: ResponseFormat,
  verbosity: VerbosityLevel = "standard",
  explicitFields?: string[],
): ReturnType<typeof createToolResponse> {
  // Apply field filtering first
  const filteredData = applyFieldFiltering(data, verbosity, explicitFields);

  switch (responseFormat) {
    case ResponseFormat.TOON:
      return createToolResponse(encodeToToon(filteredData));

    case ResponseFormat.JSON:
      return createToolResponse(JSON.stringify(filteredData, null, 2));

    case ResponseFormat.FORMATTED:
    default:
      const formatter = new ProjectListFormatter();
      return createToolResponse(formatter.format(filteredData));
  }
}

/**
 * Create a human-readable formatted response for the atlas_project_list tool
 * @deprecated Use formatResponse instead for full format support
 */
export function formatProjectListResponse(data: unknown, isError = false): ReturnType<typeof createToolResponse> {
  const formatter = new ProjectListFormatter();
  const formattedText = formatter.format(data as ProjectListResponse);
  return createToolResponse(formattedText, isError);
}
