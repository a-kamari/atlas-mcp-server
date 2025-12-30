/**
 * @fileoverview REST API handlers for WebUI dashboard endpoints.
 * These handlers provide optimized data access for the React dashboard.
 * @module src/api/webui/handlers
 */

import type { Request, Response } from "express";
import { neo4jDriver } from "../../services/neo4j/driver.js";
import { ProjectService } from "../../services/neo4j/projectService.js";
import { TaskService } from "../../services/neo4j/taskService.js";
import { KnowledgeService } from "../../services/neo4j/knowledgeService.js";
import { logger, requestContextService } from "../../utils/index.js";
import type {
  ListProjectsParams,
  ListTasksParams,
  ListKnowledgeParams,
  ListProjectsResponse,
  GetProjectResponse,
  ListTasksResponse,
  ListKnowledgeResponse,
  DashboardMetricsResponse,
  ProjectSummary,
  TaskSummary,
  KnowledgeSummary,
  ApiErrorResponse,
} from "./types.js";

/**
 * Helper to parse comma-separated query params into array.
 */
function parseArrayParam(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Helper to parse boolean query param.
 */
function parseBoolParam(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

/**
 * Helper to parse integer query param with default.
 */
function parseIntParam(
  value: string | undefined,
  defaultValue: number,
  min: number = 1,
  max: number = 100,
): number {
  const parsed = parseInt(value || "", 10);
  if (isNaN(parsed)) return defaultValue;
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Send error response with consistent format.
 */
function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): void {
  const errorResponse: ApiErrorResponse = {
    error: { code, message, details },
  };
  res.status(statusCode).json(errorResponse);
}

// ============================================================================
// Project Handlers
// ============================================================================

/**
 * GET /api/projects
 * List projects with pagination, filtering, and optional stats.
 */
export async function listProjects(req: Request, res: Response): Promise<void> {
  const context = requestContextService.createRequestContext({
    operation: "webui.listProjects",
    query: req.query,
  });
  logger.debug("WebUI API: List projects request", context);

  try {
    const sortByParam = (req.query.sortBy as string) || "updatedAt";
    const params: ListProjectsParams = {
      page: parseIntParam(req.query.page as string, 1, 1, 1000),
      limit: parseIntParam(req.query.limit as string, 20, 1, 100),
      sortBy: sortByParam as ListProjectsParams["sortBy"],
      sortDirection: (req.query.sortDirection as "asc" | "desc") || "desc",
      status: req.query.status as string,
      taskType: req.query.taskType as string,
      search: req.query.search as string,
      includeStats: parseBoolParam(req.query.includeStats as string),
    };

    // Parse status array if provided
    const statusArray = parseArrayParam(params.status);

    // Get projects from service
    const result = await ProjectService.getProjects({
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy as "name" | "status" | "taskType" | "createdAt" | "updatedAt",
      status: statusArray.length === 1 ? (statusArray[0] as "active" | "pending" | "in-progress" | "completed" | "archived") : undefined,
      taskType: params.taskType,
    });

    // Transform to response format
    let projects: ProjectSummary[] = result.data.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status as any,
      taskType: p.taskType,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      urls: p.urls,
    }));

    // Add stats if requested
    if (params.includeStats) {
      projects = await Promise.all(
        projects.map(async (project) => {
          const stats = await getProjectStats(project.id);
          return { ...project, stats };
        }),
      );
    }

    const response: ListProjectsResponse = {
      projects,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    logger.debug("WebUI API: List projects success", {
      ...context,
      count: projects.length,
      total: result.total,
    });
    res.json(response);
  } catch (error) {
    logger.error("WebUI API: List projects error", error as Error, context);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch projects");
  }
}

/**
 * GET /api/projects/:id
 * Get single project with optional tasks and knowledge.
 */
export async function getProject(req: Request, res: Response): Promise<void> {
  const projectId = req.params.id;
  const includeTasks = parseBoolParam(req.query.includeTasks as string);
  const includeKnowledge = parseBoolParam(req.query.includeKnowledge as string);

  const context = requestContextService.createRequestContext({
    operation: "webui.getProject",
    projectId,
    includeTasks,
    includeKnowledge,
  });
  logger.debug("WebUI API: Get project request", context);

  try {
    const project = await ProjectService.getProjectById(projectId);

    if (!project) {
      sendError(res, 404, "NOT_FOUND", `Project not found: ${projectId}`);
      return;
    }

    const response: GetProjectResponse = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status as any,
        taskType: project.taskType,
        completionRequirements: project.completionRequirements,
        outputFormat: project.outputFormat,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        urls: project.urls,
      },
    };

    // Fetch tasks if requested
    if (includeTasks) {
      const tasksResult = await TaskService.getTasks({
        projectId,
        page: 1,
        limit: 100, // Get all tasks for project detail view
      });
      response.tasks = tasksResult.data.map((t) => ({
        id: t.id,
        projectId: t.projectId,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        taskType: t.taskType,
        assignedTo: t.assignedToUserId,
        tags: t.tags,
        urls: t.urls,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));
    }

    // Fetch knowledge if requested
    if (includeKnowledge) {
      const knowledgeResult = await KnowledgeService.getKnowledge({
        projectId,
        page: 1,
        limit: 100, // Get all knowledge for project detail view
      });
      response.knowledge = knowledgeResult.data.map((k) => ({
        id: k.id,
        projectId: k.projectId,
        text: k.text,
        domain: k.domain,
        tags: k.tags,
        citations: k.citations,
        createdAt: k.createdAt,
        updatedAt: k.updatedAt,
      }));
    }

    logger.debug("WebUI API: Get project success", context);
    res.json(response);
  } catch (error) {
    logger.error("WebUI API: Get project error", error as Error, context);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch project");
  }
}

// ============================================================================
// Task Handlers
// ============================================================================

/**
 * GET /api/projects/:projectId/tasks
 * List tasks for a project with filtering.
 */
export async function listTasks(req: Request, res: Response): Promise<void> {
  const projectId = req.params.projectId;
  const context = requestContextService.createRequestContext({
    operation: "webui.listTasks",
    projectId,
    query: req.query,
  });
  logger.debug("WebUI API: List tasks request", context);

  try {
    // Verify project exists
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
      sendError(res, 404, "NOT_FOUND", `Project not found: ${projectId}`);
      return;
    }

    const taskSortByParam = (req.query.sortBy as string) || "createdAt";
    const params: ListTasksParams = {
      page: parseIntParam(req.query.page as string, 1, 1, 1000),
      limit: parseIntParam(req.query.limit as string, 20, 1, 100),
      status: req.query.status as string,
      priority: req.query.priority as string,
      assignedTo: req.query.assignedTo as string,
      tags: req.query.tags as string,
      sortBy: taskSortByParam as ListTasksParams["sortBy"],
      sortDirection: (req.query.sortDirection as "asc" | "desc") || "desc",
    };

    const statusArray = parseArrayParam(params.status);
    const priorityArray = parseArrayParam(params.priority);
    const tagsArray = parseArrayParam(params.tags);

    const result = await TaskService.getTasks({
      projectId,
      page: params.page,
      limit: params.limit,
      status: statusArray.length === 1 ? (statusArray[0] as any) : undefined,
      priority:
        priorityArray.length === 1 ? (priorityArray[0] as any) : undefined,
      assignedTo: params.assignedTo,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      sortBy: params.sortBy as any,
      sortDirection: params.sortDirection,
    });

    const tasks: TaskSummary[] = result.data.map((t) => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      taskType: t.taskType,
      assignedTo: t.assignedToUserId,
      tags: t.tags,
      urls: t.urls,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    const response: ListTasksResponse = {
      tasks,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    logger.debug("WebUI API: List tasks success", {
      ...context,
      count: tasks.length,
      total: result.total,
    });
    res.json(response);
  } catch (error) {
    logger.error("WebUI API: List tasks error", error as Error, context);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch tasks");
  }
}

// ============================================================================
// Knowledge Handlers
// ============================================================================

/**
 * GET /api/projects/:projectId/knowledge
 * List knowledge items for a project.
 */
export async function listKnowledge(
  req: Request,
  res: Response,
): Promise<void> {
  const projectId = req.params.projectId;
  const context = requestContextService.createRequestContext({
    operation: "webui.listKnowledge",
    projectId,
    query: req.query,
  });
  logger.debug("WebUI API: List knowledge request", context);

  try {
    // Verify project exists
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
      sendError(res, 404, "NOT_FOUND", `Project not found: ${projectId}`);
      return;
    }

    const params: ListKnowledgeParams = {
      page: parseIntParam(req.query.page as string, 1, 1, 1000),
      limit: parseIntParam(req.query.limit as string, 20, 1, 100),
      domain: req.query.domain as string,
      tags: req.query.tags as string,
      search: req.query.search as string,
    };

    const tagsArray = parseArrayParam(params.tags);

    const result = await KnowledgeService.getKnowledge({
      projectId,
      page: params.page,
      limit: params.limit,
      domain: params.domain,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      search: params.search,
    });

    const knowledge: KnowledgeSummary[] = result.data.map((k) => ({
      id: k.id,
      projectId: k.projectId,
      text: k.text,
      domain: k.domain,
      tags: k.tags,
      citations: k.citations,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
    }));

    const response: ListKnowledgeResponse = {
      knowledge,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    logger.debug("WebUI API: List knowledge success", {
      ...context,
      count: knowledge.length,
      total: result.total,
    });
    res.json(response);
  } catch (error) {
    logger.error("WebUI API: List knowledge error", error as Error, context);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch knowledge");
  }
}

// ============================================================================
// Metrics Handlers
// ============================================================================

/**
 * GET /api/metrics
 * Get dashboard-wide metrics and statistics.
 */
export async function getDashboardMetrics(
  req: Request,
  res: Response,
): Promise<void> {
  const context = requestContextService.createRequestContext({
    operation: "webui.getDashboardMetrics",
  });
  logger.debug("WebUI API: Get dashboard metrics request", context);

  try {
    const session = await neo4jDriver.getSession();

    try {
      // Single aggregation query for all metrics
      const metricsQuery = `
        // Project counts by status
        MATCH (p:Project)
        WITH
          count(p) as totalProjects,
          sum(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) as activeProjects,
          sum(CASE WHEN p.status = 'pending' THEN 1 ELSE 0 END) as pendingProjects,
          sum(CASE WHEN p.status = 'in-progress' THEN 1 ELSE 0 END) as inProgressProjects,
          sum(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as completedProjects,
          sum(CASE WHEN p.status = 'archived' THEN 1 ELSE 0 END) as archivedProjects,
          collect({status: p.status, taskType: p.taskType}) as projectDetails

        // Task counts
        OPTIONAL MATCH (t:Task)
        WITH
          totalProjects, activeProjects, pendingProjects, inProgressProjects, completedProjects, archivedProjects, projectDetails,
          count(t) as totalTasks,
          sum(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
          sum(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) as inProgressTasks,
          sum(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END) as todoTasks,
          sum(CASE WHEN t.status = 'backlog' THEN 1 ELSE 0 END) as backlogTasks

        // Knowledge count
        OPTIONAL MATCH (k:Knowledge)
        WITH
          totalProjects, activeProjects, pendingProjects, inProgressProjects, completedProjects, archivedProjects, projectDetails,
          totalTasks, completedTasks, inProgressTasks, todoTasks, backlogTasks,
          count(k) as totalKnowledge

        RETURN
          totalProjects, activeProjects, pendingProjects, inProgressProjects, completedProjects, archivedProjects,
          totalTasks, completedTasks, inProgressTasks, todoTasks, backlogTasks,
          totalKnowledge,
          projectDetails
      `;

      const result = await session.executeRead(async (tx) => {
        const queryResult = await tx.run(metricsQuery);
        return queryResult.records[0];
      });

      // Extract values (handle Neo4j integers)
      const toNumber = (val: any): number => {
        if (val && typeof val.toNumber === "function") return val.toNumber();
        return Number(val) || 0;
      };

      const totalProjects = toNumber(result?.get("totalProjects"));
      const activeProjects = toNumber(result?.get("activeProjects"));
      const pendingProjects = toNumber(result?.get("pendingProjects"));
      const inProgressProjects = toNumber(result?.get("inProgressProjects"));
      const completedProjects = toNumber(result?.get("completedProjects"));
      const archivedProjects = toNumber(result?.get("archivedProjects"));
      const totalTasks = toNumber(result?.get("totalTasks"));
      const completedTasks = toNumber(result?.get("completedTasks"));
      const inProgressTasks = toNumber(result?.get("inProgressTasks"));
      const todoTasks = toNumber(result?.get("todoTasks"));
      const backlogTasks = toNumber(result?.get("backlogTasks"));
      const totalKnowledge = toNumber(result?.get("totalKnowledge"));

      // Calculate distributions from project details
      const projectDetails = (result?.get("projectDetails") || []) as Array<{
        status: string;
        taskType: string;
      }>;
      const statusDistribution: Record<string, number> = {};
      const typeDistribution: Record<string, number> = {};

      projectDetails.forEach((p) => {
        if (p.status) {
          statusDistribution[p.status] =
            (statusDistribution[p.status] || 0) + 1;
        }
        if (p.taskType) {
          typeDistribution[p.taskType] =
            (typeDistribution[p.taskType] || 0) + 1;
        }
      });

      // Get recent projects
      const recentProjectsResult = await ProjectService.getProjects({
        page: 1,
        limit: 5,
        sortBy: "updatedAt",
      });

      const recentProjects: ProjectSummary[] = recentProjectsResult.data.map(
        (p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status as any,
          taskType: p.taskType,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          urls: p.urls,
        }),
      );

      const response: DashboardMetricsResponse = {
        overview: {
          totalProjects,
          activeProjects,
          pendingProjects,
          inProgressProjects,
          completedProjects,
          archivedProjects,
        },
        taskMetrics: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          backlogTasks,
          overallCompletionRate:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
        },
        knowledgeMetrics: {
          totalKnowledge,
        },
        statusDistribution,
        typeDistribution,
        recentProjects,
      };

      logger.debug("WebUI API: Get dashboard metrics success", context);
      res.json(response);
    } finally {
      await session.close();
    }
  } catch (error) {
    logger.error(
      "WebUI API: Get dashboard metrics error",
      error as Error,
      context,
    );
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch dashboard metrics");
  }
}

/**
 * GET /api/projects/:id/metrics
 * Get metrics for a specific project.
 */
export async function getProjectMetrics(
  req: Request,
  res: Response,
): Promise<void> {
  const projectId = req.params.id;
  const context = requestContextService.createRequestContext({
    operation: "webui.getProjectMetrics",
    projectId,
  });
  logger.debug("WebUI API: Get project metrics request", context);

  try {
    // Verify project exists
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
      sendError(res, 404, "NOT_FOUND", `Project not found: ${projectId}`);
      return;
    }

    const stats = await getProjectStats(projectId);

    res.json({
      projectId,
      ...stats,
      project: {
        name: project.name,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });

    logger.debug("WebUI API: Get project metrics success", context);
  } catch (error) {
    logger.error(
      "WebUI API: Get project metrics error",
      error as Error,
      context,
    );
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch project metrics");
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get task and knowledge statistics for a project.
 */
async function getProjectStats(projectId: string): Promise<{
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  backlogTasks: number;
  completionPercentage: number;
  totalKnowledge: number;
}> {
  const session = await neo4jDriver.getSession();

  try {
    const statsQuery = `
      MATCH (p:Project {id: $projectId})
      OPTIONAL MATCH (p)-[:CONTAINS_TASK]->(t:Task)
      WITH p,
        count(t) as totalTasks,
        sum(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
        sum(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) as inProgressTasks,
        sum(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END) as todoTasks,
        sum(CASE WHEN t.status = 'backlog' THEN 1 ELSE 0 END) as backlogTasks
      OPTIONAL MATCH (p)-[:CONTAINS_KNOWLEDGE]->(k:Knowledge)
      RETURN
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        backlogTasks,
        count(k) as totalKnowledge
    `;

    const result = await session.executeRead(async (tx) => {
      const queryResult = await tx.run(statsQuery, { projectId });
      return queryResult.records[0];
    });

    const toNumber = (val: any): number => {
      if (val && typeof val.toNumber === "function") return val.toNumber();
      return Number(val) || 0;
    };

    const totalTasks = toNumber(result?.get("totalTasks"));
    const completedTasks = toNumber(result?.get("completedTasks"));
    const inProgressTasks = toNumber(result?.get("inProgressTasks"));
    const todoTasks = toNumber(result?.get("todoTasks"));
    const backlogTasks = toNumber(result?.get("backlogTasks"));
    const totalKnowledge = toNumber(result?.get("totalKnowledge"));

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      backlogTasks,
      completionPercentage:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalKnowledge,
    };
  } finally {
    await session.close();
  }
}
