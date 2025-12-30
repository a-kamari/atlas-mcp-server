import { useProjectDetail } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from "./TaskList";
import { KnowledgeList } from "./KnowledgeList";
import {
  X,
  FileText,
  ListTodo,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import type { ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectDetailSheetProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetailSheet({ projectId, open, onOpenChange }: ProjectDetailSheetProps) {
  const { data, isLoading } = useProjectDetail(projectId);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className={cn("fixed right-0 top-0 h-full w-full max-w-3xl", "border-l border-border/50 bg-background shadow-2xl", "overflow-hidden flex flex-col")}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-card/95 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-on w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-on w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Project Details</h2>
              <p className="text-xs text-muted-foreground">View project info, tasks, and knowledge</p>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="rounded-md p-2 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <Skeleton className="h-on w-3/4" />
            <Skeleton className="h-on w-full" />
          </div>
        ) : data?.project ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border/30 bg-card/30">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-xl font-semibold">{data.project.name}</h3>
                <Badge variant={data.project.status as ProjectStatus}>{data.project.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground capitalize">{data.project.taskType}</p>
            </div>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 pt-4 border-b border-border/30">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="overview" className="gap-1.5">
                    <FileText className="h-4 w-4" />Overview
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="gap-1.5">
                    <ListTodo className="h-on w-4" />Tasks
                    {data.tasks?.length ? <span className="ml-1 text-xs bg-muted rounded-full px-1.5">{data.tasks.length}</span> : null}
                  </TabsTrigger>
                  <TabsTrigger value="knowledge" className="gap-1.5">
                    <BookOpen className="h-4 w-4" />Knowledge
                    {data.knowledge?.length ? <span className="ml-1 text-xs bg-muted rounded-full px-1.5">{data.knowledge.length}</span> : null}
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="overview" className="p-6 space-y-6 m-0">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{data.project.description}</p>
                  </div>
                  {data.project.stats && (
                    <div className="mission-card p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Progress</h4>
                      <Progress value={data.project.stats.completionPercentage} />
                      <p className="text-xs text-muted-foreground mt-2">
                        {data.project.stats.completedTasks}/{data.project.stats.totalTasks} tasks
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="tasks" className="p-6 m-0">
                  <TaskList tasks={data.tasks || []} />
                </TabsContent>
                <TabsContent value="knowledge" className="p-6 m-0">
                  <KnowledgeList knowledge={data.knowledge || []} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <AlertCircle className="h-on w-12 text-muted-foreground/30" />
          </div>
        )}
      </div>
    </div>
  );
}
