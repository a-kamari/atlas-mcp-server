/**
 * @fileoverview WebUI REST API router setup.
 * Configures Express routes for the dashboard REST API.
 * @module src/api/webui
 */

import { Router } from "express";
import {
  listProjects,
  getProject,
  listTasks,
  listKnowledge,
  getDashboardMetrics,
  getProjectMetrics,
} from "./handlers.js";

/**
 * Creates and configures the WebUI API router.
 * @returns Express Router with all WebUI API routes
 */
export function createWebuiApiRouter(): Router {
  const router = Router();

  // ============================================================================
  // Dashboard Metrics
  // ============================================================================

  /**
   * GET /api/metrics
   * Get dashboard-wide metrics including project/task/knowledge counts,
   * status distributions, and recent activity.
   */
  router.get("/metrics", getDashboardMetrics);

  // ============================================================================
  // Projects
  // ============================================================================

  /**
   * GET /api/projects
   * List all projects with pagination and filtering.
   *
   * Query params:
   * - page (number): Page number, default 1
   * - limit (number): Items per page, default 20, max 100
   * - sortBy (string): Sort field - name, createdAt, updatedAt, status, taskType
   * - sortDirection (string): asc or desc
   * - status (string): Filter by status (comma-separated for multiple)
   * - taskType (string): Filter by task type
   * - search (string): Search in name/description
   * - includeStats (boolean): Include task/knowledge counts per project
   */
  router.get("/projects", listProjects);

  /**
   * GET /api/projects/:id
   * Get a single project by ID with optional related data.
   *
   * Query params:
   * - includeTasks (boolean): Include project's tasks
   * - includeKnowledge (boolean): Include project's knowledge items
   */
  router.get("/projects/:id", getProject);

  /**
   * GET /api/projects/:id/metrics
   * Get metrics for a specific project.
   */
  router.get("/projects/:id/metrics", getProjectMetrics);

  // ============================================================================
  // Tasks (scoped to project)
  // ============================================================================

  /**
   * GET /api/projects/:projectId/tasks
   * List tasks for a specific project.
   *
   * Query params:
   * - page (number): Page number
   * - limit (number): Items per page
   * - status (string): Filter by status (comma-separated)
   * - priority (string): Filter by priority (comma-separated)
   * - assignedTo (string): Filter by assigned user
   * - tags (string): Filter by tags (comma-separated)
   * - sortBy (string): Sort field
   * - sortDirection (string): asc or desc
   */
  router.get("/projects/:projectId/tasks", listTasks);

  // ============================================================================
  // Knowledge (scoped to project)
  // ============================================================================

  /**
   * GET /api/projects/:projectId/knowledge
   * List knowledge items for a specific project.
   *
   * Query params:
   * - page (number): Page number
   * - limit (number): Items per page
   * - domain (string): Filter by domain
   * - tags (string): Filter by tags (comma-separated)
   * - search (string): Search in text content
   */
  router.get("/projects/:projectId/knowledge", listKnowledge);

  return router;
}

// Re-export types for consumers
export * from "./types.js";
