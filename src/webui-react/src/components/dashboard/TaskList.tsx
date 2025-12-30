import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  Tag,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  taskType: string;
  assignedTo?: string | null;
  tags?: string[];
  urls?: { title: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

interface TaskListProps {
  tasks: Task[];
  className?: string;
}

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  "in-progress": {
    icon: Loader2,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  todo: {
    icon: Circle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  backlog: {
    icon: Clock,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
  },
};

const PRIORITY_CONFIG = {
  critical: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: AlertTriangle,
  },
  high: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: ArrowUpRight,
  },
  medium: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    icon: null,
  },
  low: {
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    icon: null,
  },
};

function TaskCard({ task }: { task: Task }) {
  const status = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.backlog;
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
  const StatusIcon = status.icon;
  const PriorityIcon = priority.icon;

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-4 transition-all duration-200",
        "bg-card/50 hover:bg-card/80",
        "border-border/50 hover:border-primary/30",
        "hover:shadow-[0_0_20px_rgba(20,184,166,0.1)]"
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
          status.color.replace("text-", "bg-").replace("-400", "-500")
        )}
      />

      <div className="flex items-start gap-3 pl-2">
        <StatusIcon
          className={cn(
            "h-5 w-5 mt-0.5 flex-shrink-0",
            status.color,
            task.status === "in-progress" && "animate-spin"
          )}
        />
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {PriorityIcon && (
                <PriorityIcon className={cn("h-4 w-4", priority.color)} />
              )}
              <Badge
                variant="outline"
                className={cn(
                  "text-xs capitalize",
                  priority.bg,
                  priority.border,
                  priority.color
                )}
              >
                {task.priority}
              </Badge>
            </div>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs capitalize",
                status.bg,
                status.border,
                status.color
              )}
            >
              {task.status}
            </Badge>

            {task.taskType && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {task.taskType}
              </Badge>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                {task.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {task.urls && task.urls.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {task.urls.slice(0, 2).map((url, idx) => (
                <a
                  key={idx}
                  href={url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {url.title}
                </a>
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground/70 pt-1">
            Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskList({ tasks, className }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Circle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No tasks found</p>
      </div>
    );
  }

  const groupedTasks = {
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    todo: tasks.filter((t) => t.status === "todo"),
    backlog: tasks.filter((t) => t.status === "backlog"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  return (
    <div className={cn("space-y-6", className)}>
      {Object.entries(groupedTasks).map(([status, statusTasks]) => {
        if (statusTasks.length === 0) return null;
        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
        const StatusIcon = config.icon;
        
        return (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-4 w-4", config.color)} />
              <h3 className="text-sm font-medium capitalize">
                {status.replace("-", " ")}
              </h3>
              <span className="text-xs text-muted-foreground">
                ({statusTasks.length})
              </span>
            </div>
            <div className="space-y-2">
              {statusTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
