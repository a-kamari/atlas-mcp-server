import { useProjects } from "@/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilterState, ViewMode } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpDown,
  ChevronRight,
  FolderKanban,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectListProps {
  filters: FilterState;
  viewMode: ViewMode;
  onSelectProject: (projectId: string) => void;
}

const STATUS_CONFIG: Record<
  string,
  { icon: typeof CheckCircle2; className: string; badgeClass: string }
> = {
  active: {
    icon: CheckCircle2,
    className: "text-emerald-400",
    badgeClass: "badge-active",
  },
  pending: {
    icon: Clock,
    className: "text-amber-400",
    badgeClass: "badge-pending",
  },
  "in-progress": {
    icon: Loader2,
    className: "text-blue-400",
    badgeClass: "badge-in-progress",
  },
  completed: {
    icon: CheckCircle2,
    className: "text-emerald-400",
    badgeClass: "badge-completed",
  },
  archived: {
    icon: Archive,
    className: "text-muted-foreground",
    badgeClass: "badge-archived",
  },
};

function getStatusConfig(status: string) {
  return (
    STATUS_CONFIG[status] || {
      icon: AlertCircle,
      className: "text-muted-foreground",
      badgeClass: "",
    }
  );
}

export function ProjectList({
  filters,
  viewMode,
  onSelectProject,
}: ProjectListProps) {
  const { projects, isLoading } = useProjects({ filters });

  if (isLoading) {
    if (viewMode === "table") {
      return (
        <Card className="mission-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Progress</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td>
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48 bg-muted/50" />
                          <Skeleton className="h-3 w-64 bg-muted/50" />
                        </div>
                      </td>
                      <td>
                        <Skeleton className="h-6 w-20 rounded-full bg-muted/50" />
                      </td>
                      <td>
                        <Skeleton className="h-4 w-24 bg-muted/50" />
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-2 w-24 rounded-full bg-muted/50" />
                          <Skeleton className="h-4 w-12 bg-muted/50" />
                        </div>
                      </td>
                      <td>
                        <Skeleton className="h-4 w-20 bg-muted/50" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="mission-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Skeleton className="h-6 w-3/4 bg-muted/50" />
                <Skeleton className="h-6 w-16 rounded-full bg-muted/50" />
              </div>
              <Skeleton className="h-4 w-24 mb-4 bg-muted/50" />
              <Skeleton className="h-12 w-full mb-4 bg-muted/50" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16 bg-muted/50" />
                  <Skeleton className="h-3 w-20 bg-muted/50" />
                </div>
                <Skeleton className="h-2 w-full rounded-full bg-muted/50" />
                <Skeleton className="h-3 w-32 bg-muted/50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="mission-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-full bg-muted/30 mb-4">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">
            No projects found
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Try adjusting your filters or search query to find what you're
            looking for.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "table") {
    return (
      <Card className="mission-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Name
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Progress</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => {
                  const statusConfig = getStatusConfig(project.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr
                      key={project.id}
                      onClick={() => onSelectProject(project.id)}
                      className="cursor-pointer group"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                {project.name}
                              </span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                              {project.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge className={cn("gap-1", statusConfig.badgeClass)}>
                          <StatusIcon
                            className={cn(
                              "h-3 w-3",
                              project.status === "in-progress" && "animate-spin"
                            )}
                          />
                          {project.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm capitalize">
                            {project.taskType}
                          </span>
                        </div>
                      </td>
                      <td>
                        {project.stats && (
                          <div className="flex items-center gap-3 min-w-[140px]">
                            <div className="flex-1 relative">
                              <Progress
                                value={project.stats.completionPercentage}
                                className="h-2"
                              />
                            </div>
                            <span className="text-sm font-mono text-muted-foreground w-12 text-right">
                              {Math.round(project.stats.completionPercentage)}%
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(project.updatedAt), {
                            addSuffix: false,
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
      {projects.map((project, index) => {
        const statusConfig = getStatusConfig(project.status);
        const StatusIcon = statusConfig.icon;
        return (
          <Card
            key={project.id}
            className="mission-card mission-glow cursor-pointer group"
            onClick={() => onSelectProject(project.id)}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <Badge className={cn("shrink-0 gap-1", statusConfig.badgeClass)}>
                  <StatusIcon
                    className={cn(
                      "h-3 w-3",
                      project.status === "in-progress" && "animate-spin"
                    )}
                  />
                  {project.status}
                </Badge>
              </div>

              {/* Type */}
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground capitalize">
                  {project.taskType}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
                {project.description}
              </p>

              {/* Progress */}
              {project.stats && (
                <div className="space-y-2 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono font-medium">
                      {project.stats.completedTasks}/{project.stats.totalTasks}{" "}
                      <span className="text-muted-foreground">tasks</span>
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={project.stats.completionPercentage}
                      className="h-2"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(project.updatedAt), {
                        addSuffix: true,
                      })}
                    </div>
                    <span className="font-mono">
                      {Math.round(project.stats.completionPercentage)}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
