export type ProjectStatus =
  | "active"
  | "pending"
  | "in-progress"
  | "completed"
  | "archived";

export type TaskType = "research" | "generation" | "analysis" | "integration" | "design" | "refactoring";

export type TaskStatus = "backlog" | "todo" | "in-progress" | "completed";

export type PriorityLevel = "low" | "medium" | "high" | "critical";

export type ViewMode = "card" | "table";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface FilterState {
  search: string;
  status: ProjectStatus[];
  taskType: TaskType[];
  dateRange: DateRange | null;
}

export interface SortState {
  field: "name" | "createdAt" | "updatedAt" | "status" | "taskType";
  direction: "asc" | "desc";
}
