import { useProjectDetail } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { X, ExternalLink, CheckCircle2, Circle } from "lucide-react";
import type { ProjectStatus } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ProjectDetailSheetProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetailSheet({
  projectId,
  open,
  onOpenChange,
}: ProjectDetailSheetProps) {
  const { data, isLoading } = useProjectDetail(projectId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl border-l bg-background shadow-lg overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-6">
          <h2 className="text-2xl font-bold">Project Details</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data?.project ? (
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-xl font-semibold">{data.project.name}</h3>
                <Badge variant={data.project.status as ProjectStatus}>
                  {data.project.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {data.project.taskType}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {data.project.description}
              </p>
            </div>

            {data.project.stats && (
              <div>
                <h4 className="text-sm font-medium mb-2">Progress</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Task Completion
                    </span>
                    <span className="font-medium">
                      {data.project.stats.completedTasks}/
                      {data.project.stats.totalTasks}
                    </span>
                  </div>
                  <Progress value={data.project.stats.completionPercentage} />
                </div>
              </div>
            )}

            {data.tasks && data.tasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">
                  Tasks ({data.tasks.length})
                </h4>
                <div className="space-y-2">
                  {data.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      {task.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.project.urls && data.project.urls.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Resources</h4>
                <div className="space-y-2">
                  {data.project.urls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {url.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground pt-4 border-t">
              <div>
                Created{" "}
                {formatDistanceToNow(new Date(data.project.createdAt), {
                  addSuffix: true,
                })}
              </div>
              <div>
                Updated{" "}
                {formatDistanceToNow(new Date(data.project.updatedAt), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
