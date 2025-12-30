import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listProjects, filtersToApiParams } from "@/lib/api/projects";
import type { FilterState, SortState } from "@/types/filter";

interface UseProjectsOptions {
  filters?: FilterState;
  sort?: SortState;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const {
    filters,
    sort = { field: "updatedAt", direction: "desc" },
    page = 1,
    limit = 20,
    enabled = true,
  } = options;

  const queryClient = useQueryClient();

  const apiParams = {
    ...(filters ? filtersToApiParams(filters) : {}),
    sortBy: sort.field,
    sortDirection: sort.direction,
    page,
    limit,
    includeStats: true,
  };

  const query = useQuery({
    queryKey: ["projects", apiParams],
    queryFn: () => listProjects(apiParams),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  return {
    ...query,
    projects: query.data?.projects ?? [],
    pagination: query.data?.pagination,
    refetch,
  };
}
