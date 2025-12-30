import type { Project } from "./project";

export interface DashboardOverview {
  totalProjects: number;
  activeProjects: number;
  pendingProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  archivedProjects: number;
}

export interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  backlogTasks: number;
  overallCompletionRate: number;
}

export interface KnowledgeMetrics {
  totalKnowledge: number;
}

export interface DashboardMetrics {
  overview: DashboardOverview;
  taskMetrics: TaskMetrics;
  knowledgeMetrics: KnowledgeMetrics;
  statusDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  recentProjects: Project[];
}
