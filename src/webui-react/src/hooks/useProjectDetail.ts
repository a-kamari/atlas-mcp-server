import { useQuery } from "@tanstack/react-query";
import { getProject } from "@/lib/api/projects";

interface UseProjectDetailOptions {
  includeTasks?: boolean;
  includeKnowledge?: boolean;
  enabled?: boolean;
}

export function useProjectDetail(
  projectId: string | null,
  options: UseProjectDetailOptions = {}
) {
  const {
    includeTasks = true,
    includeKnowledge = true,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: ["project", projectId, { includeTasks, includeKnowledge }],
    queryFn: () =>
      getProject(projectId!, { includeTasks, includeKnowledge }),
    enabled: enabled && projectId !== null,
    staleTime: 30 * 1000,
  });
}
