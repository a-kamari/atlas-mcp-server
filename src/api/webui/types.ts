/**
 * @fileoverview Type definitions for WebUI REST API endpoints.
 * These types define the request parameters and response shapes for the dashboard API.
 * @module src/api/webui/types
 */

// Status and TaskType use string to allow flexibility with the const object values from mcp.ts

// ============================================================================
// Request Types
// ============================================================================

/**
 * Query parameters for listing projects.
 */
export interface ListProjectsParams {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page (max 100) */
  limit?: number;
  /** Field to sort by */
  sortBy?: "name" | "createdAt" | "updatedAt" | "status" | "taskType";
  /** Sort direction */
  sortDirection?: "asc" | "desc";
  /** Filter by status(es) - comma-separated */
  status?: string;
  /** Filter by task type */
  taskType?: string;
  /** Search term for name/description */
  search?: string;
  /** Include task statistics */
  includeStats?: boolean;
}

/**
 * Query parameters for listing tasks.
 */
export interface ListTasksParams {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page (max 100) */
  limit?: number;
  /** Filter by status(es) - comma-separated */
  status?: string;
  /** Filter by priority(es) - comma-separated */
  priority?: string;
  /** Filter by assigned user */
  assignedTo?: string;
  /** Filter by tags - comma-separated */
  tags?: string;
  /** Sort field */
  sortBy?: "priority" | "createdAt" | "status" | "title";
  /** Sort direction */
  sortDirection?: "asc" | "desc";
}

/**
 * Query parameters for listing knowledge items.
 */
export interface ListKnowledgeParams {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page (max 100) */
  limit?: number;
  /** Filter by domain */
  domain?: string;
  /** Filter by tags - comma-separated */
  tags?: string;
  /** Search term for text content */
  search?: string;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * URL object for project/task links.
 */
export interface UrlEntry {
  title: string;
  url: string;
}

/**
 * Project summary for list views.
 */
export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  status: string;
  taskType: string;
  createdAt: string;
  updatedAt: string;
  urls?: UrlEntry[];
  /** Task statistics (when includeStats=true) */
  stats?: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    backlogTasks: number;
    completionPercentage: number;
    totalKnowledge: number;
  };
}

/**
 * Detailed project information including related data.
 */
export interface ProjectDetails extends ProjectSummary {
  completionRequirements: string;
  outputFormat: string;
}

/**
 * Task summary for list views.
 */
export interface TaskSummary {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  taskType: string;
  assignedTo?: string | null;
  tags?: string[];
  urls?: UrlEntry[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Knowledge item summary.
 */
export interface KnowledgeSummary {
  id: string;
  projectId: string;
  text: string;
  domain: string | null;
  tags?: string[];
  citations?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination metadata.
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Response for project list endpoint.
 */
export interface ListProjectsResponse {
  projects: ProjectSummary[];
  pagination: PaginationInfo;
}

/**
 * Response for single project endpoint.
 */
export interface GetProjectResponse {
  project: ProjectDetails;
  tasks?: TaskSummary[];
  knowledge?: KnowledgeSummary[];
}

/**
 * Response for tasks list endpoint.
 */
export interface ListTasksResponse {
  tasks: TaskSummary[];
  pagination: PaginationInfo;
}

/**
 * Response for knowledge list endpoint.
 */
export interface ListKnowledgeResponse {
  knowledge: KnowledgeSummary[];
  pagination: PaginationInfo;
}

/**
 * Dashboard metrics response.
 */
export interface DashboardMetricsResponse {
  overview: {
    totalProjects: number;
    activeProjects: number;
    pendingProjects: number;
    inProgressProjects: number;
    completedProjects: number;
    archivedProjects: number;
  };
  taskMetrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    backlogTasks: number;
    overallCompletionRate: number;
  };
  knowledgeMetrics: {
    totalKnowledge: number;
  };
  statusDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  recentProjects: ProjectSummary[];
}

/**
 * API error response.
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
