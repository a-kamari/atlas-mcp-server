import type { ProjectStatus, TaskType } from "./filter";

export interface UrlEntry {
  title: string;
  url: string;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  backlogTasks: number;
  completionPercentage: number;
  totalKnowledge: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  taskType: TaskType | string;
  createdAt: string;
  updatedAt: string;
  urls?: UrlEntry[];
  stats?: ProjectStats;
}

export interface ProjectDetails extends Project {
  completionRequirements: string;
  outputFormat: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProjectListResponse {
  projects: Project[];
  pagination: PaginationInfo;
}

export interface ProjectDetailResponse {
  project: ProjectDetails;
  tasks?: Task[];
  knowledge?: Knowledge[];
}

export interface Task {
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

export interface Knowledge {
  id: string;
  projectId: string;
  text: string;
  domain: string | null;
  tags?: string[];
  citations?: string[];
  createdAt: string;
  updatedAt: string;
}
