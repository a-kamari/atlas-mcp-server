# Atlas WebUI React Component Architecture

**Date:** 2024-12-29
**Status:** Architecture Design
**Version:** 1.0.0

## Table of Contents

1. [Project Structure](#project-structure)
2. [Component Hierarchy](#component-hierarchy)
3. [Type Definitions](#type-definitions)
4. [State Management Strategy](#state-management-strategy)
5. [Data Flow Architecture](#data-flow-architecture)
6. [Routing Strategy](#routing-strategy)
7. [Component Specifications](#component-specifications)
8. [Performance Optimization](#performance-optimization)

---

## 1. Project Structure

```
src/webui-react/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Dashboard route (/)
│   ├── projects/
│   │   └── [id]/
│   │       └── page.tsx         # Project detail route
│   └── error.tsx                # Error boundary
│
├── components/                   # React components
│   ├── layout/                  # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── KPICards/
│   │   │   ├── KPICard.tsx
│   │   │   ├── KPICardSkeleton.tsx
│   │   │   ├── TotalProjectsCard.tsx
│   │   │   ├── ActiveProjectsCard.tsx
│   │   │   ├── CompletionRateCard.tsx
│   │   │   └── AtRiskCard.tsx
│   │   │
│   │   ├── FilterToolbar/
│   │   │   ├── FilterToolbar.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── StatusFilter.tsx
│   │   │   ├── TypeFilter.tsx
│   │   │   ├── DateRangeFilter.tsx
│   │   │   ├── ActiveFilterBadges.tsx
│   │   │   └── ClearFiltersButton.tsx
│   │   │
│   │   ├── ProjectList/
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectListHeader.tsx
│   │   │   ├── ViewToggle.tsx
│   │   │   ├── ProjectCardView.tsx
│   │   │   ├── ProjectTableView.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectCardSkeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── BulkActionBar.tsx
│   │   │
│   │   └── ProjectDetail/
│   │       ├── ProjectDetailSheet.tsx
│   │       ├── ProjectHeader.tsx
│   │       ├── ProjectDescription.tsx
│   │       ├── ProjectProgress.tsx
│   │       ├── TaskBreakdownChart.tsx
│   │       ├── TaskList.tsx
│   │       ├── TaskItem.tsx
│   │       ├── KnowledgeList.tsx
│   │       └── KnowledgeItem.tsx
│   │
│   ├── features/                # Feature-specific components
│   │   ├── CommandPalette/
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── RecentProjects.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── QuickFilters.tsx
│   │   │
│   │   ├── Charts/
│   │   │   ├── SparklineChart.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── StackedBarChart.tsx
│   │   │   └── TrendIndicator.tsx
│   │   │
│   │   └── DataTable/
│   │       ├── ProjectDataTable.tsx
│   │       ├── columns.tsx
│   │       └── DataTablePagination.tsx
│   │
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── combobox.tsx
│       ├── date-picker.tsx
│       ├── sheet.tsx
│       ├── command.tsx
│       ├── progress.tsx
│       ├── skeleton.tsx
│       ├── toast.tsx
│       ├── popover.tsx
│       ├── dropdown-menu.tsx
│       ├── checkbox.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       ├── tabs.tsx
│       └── data-table.tsx
│
├── hooks/                       # Custom React hooks
│   ├── useProjects.ts          # Fetch and manage projects
│   ├── useTasks.ts             # Fetch and manage tasks
│   ├── useKnowledge.ts         # Fetch and manage knowledge
│   ├── useProjectDetail.ts     # Fetch single project with relations
│   ├── useKPIMetrics.ts        # Fetch KPI statistics
│   ├── useFilterState.ts       # Manage filter state with URL sync
│   ├── useDebounce.ts          # Debounce utility
│   ├── useLocalStorage.ts      # localStorage persistence
│   ├── useMediaQuery.ts        # Responsive breakpoints
│   └── useKeyboardShortcuts.ts # Global keyboard shortcuts
│
├── lib/                         # Utilities and configurations
│   ├── api/
│   │   ├── client.ts           # HTTP client configuration
│   │   ├── projects.ts         # Project API calls
│   │   ├── tasks.ts            # Task API calls
│   │   ├── knowledge.ts        # Knowledge API calls
│   │   └── search.ts           # Search API calls
│   │
│   ├── utils/
│   │   ├── cn.ts               # Class name utilities
│   │   ├── date-formatters.ts  # Date formatting
│   │   ├── filter-helpers.ts   # Filter logic
│   │   ├── sort-helpers.ts     # Sorting logic
│   │   └── validators.ts       # Input validation
│   │
│   └── constants.ts            # App constants
│
├── types/                       # TypeScript type definitions
│   ├── project.ts              # Project types
│   ├── task.ts                 # Task types
│   ├── knowledge.ts            # Knowledge types
│   ├── filter.ts               # Filter state types
│   ├── api.ts                  # API response types
│   └── index.ts                # Type exports
│
├── styles/                      # Global styles
│   └── globals.css             # Tailwind imports + custom CSS
│
└── config/                      # Configuration files
    ├── site.ts                 # Site metadata
    └── navigation.ts           # Navigation structure
```

---

## 2. Component Hierarchy

### 2.1 Visual Component Tree

```
App
└── RootLayout
    ├── Providers
    │   ├── ThemeProvider
    │   ├── QueryClientProvider (TanStack Query)
    │   └── ToastProvider
    │
    └── DashboardLayout
        ├── Header
        │   ├── Logo
        │   ├── CommandPaletteButton (Cmd+K)
        │   ├── ThemeToggle
        │   └── UserMenu
        │
        └── DashboardPage
            ├── KPICardsSection
            │   ├── TotalProjectsCard
            │   │   ├── MetricValue
            │   │   ├── TrendIndicator
            │   │   └── SparklineChart
            │   ├── ActiveProjectsCard
            │   ├── CompletionRateCard
            │   └── AtRiskCard
            │
            ├── FilterToolbar
            │   ├── SearchInput
            │   ├── StatusFilter (Multi-select Combobox)
            │   ├── TypeFilter (Multi-select Combobox)
            │   ├── DateRangeFilter (DatePicker + Popover)
            │   ├── ActiveFilterBadges
            │   └── ClearFiltersButton
            │
            └── ProjectList
                ├── ProjectListHeader
                │   ├── ResultCount
                │   └── ViewToggle (Card/Table)
                │
                ├── ProjectCardView (when view === 'card')
                │   └── ProjectCard[]
                │       ├── StatusBadge
                │       ├── TypeBadge
                │       ├── ProgressBar
                │       ├── TaskCount
                │       ├── Timestamp
                │       └── ActionMenu (DropdownMenu)
                │
                ├── ProjectTableView (when view === 'table')
                │   ├── DataTable (TanStack Table)
                │   │   ├── Columns
                │   │   │   ├── SelectColumn (Checkbox)
                │   │   │   ├── NameColumn
                │   │   │   ├── StatusColumn
                │   │   │   ├── TypeColumn
                │   │   │   ├── ProgressColumn
                │   │   │   ├── UpdatedColumn
                │   │   │   └── ActionsColumn
                │   │   └── Rows[]
                │   ├── DataTablePagination
                │   └── BulkActionBar (when rows selected)
                │
                └── ProjectDetailSheet (Sheet overlay)
                    ├── ProjectHeader
                    │   ├── BackButton
                    │   ├── ProjectTitle
                    │   ├── StatusBadge
                    │   ├── TypeBadge
                    │   └── ActionMenu
                    │
                    ├── ProjectDescription
                    ├── ProjectProgress
                    │   ├── ProgressBar
                    │   └── CompletionStats
                    │
                    ├── TaskBreakdownChart (Stacked Bar)
                    ├── TaskList
                    │   ├── AddTaskButton
                    │   └── TaskItem[]
                    │       ├── Checkbox
                    │       ├── TaskTitle
                    │       └── StatusBadge
                    │
                    └── KnowledgeList
                        ├── AddKnowledgeButton
                        └── KnowledgeItem[]
                            ├── KnowledgeText
                            └── DomainBadge
```

### 2.2 Component Props Interface

```typescript
// Layout Components
interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface HeaderProps {
  onCommandPaletteOpen: () => void;
}

// KPI Components
interface KPICardProps {
  title: string;
  value: number | string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  sparklineData?: number[];
  onClick?: () => void;
  loading?: boolean;
}

// Filter Components
interface FilterToolbarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface StatusFilterProps {
  selectedStatuses: ProjectStatus[];
  onStatusChange: (statuses: ProjectStatus[]) => void;
  projectCounts: Record<ProjectStatus, number>;
}

interface TypeFilterProps {
  selectedTypes: TaskType[];
  onTypeChange: (types: TaskType[]) => void;
}

interface DateRangeFilterProps {
  dateRange: DateRange | null;
  onDateRangeChange: (range: DateRange | null) => void;
}

// Project List Components
interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  view: 'card' | 'table';
  onViewChange: (view: 'card' | 'table') => void;
  selectedProjectIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onProjectClick: (projectId: string) => void;
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

interface ProjectTableViewProps {
  projects: Project[];
  selectedProjectIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onProjectClick: (projectId: string) => void;
}

// Project Detail Components
interface ProjectDetailSheetProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProjectProgressProps {
  totalTasks: number;
  completedTasks: number;
  percentage: number;
}

interface TaskBreakdownChartProps {
  tasksByStatus: Record<TaskStatus, number>;
}

interface TaskListProps {
  projectId: string;
  tasks: Task[];
  onTaskCreate: (task: CreateTaskInput) => void;
  onTaskUpdate: (taskId: string, updates: UpdateTaskInput) => void;
}

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

interface KnowledgeListProps {
  projectId: string;
  knowledge: KnowledgeItem[];
  onKnowledgeCreate: (item: CreateKnowledgeInput) => void;
}

// Chart Components
interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
}

interface ProgressBarProps {
  percentage: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

interface StackedBarChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  height?: number;
}

interface TrendIndicatorProps {
  value: number;
  direction: 'up' | 'down' | 'neutral';
  showPercentage?: boolean;
}

// Command Palette
interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

---

## 3. Type Definitions

### 3.1 Core Domain Types

```typescript
// types/project.ts

export type ProjectStatus = 'active' | 'pending' | 'in-progress' | 'completed' | 'archived';

export type TaskType = 'research' | 'generation' | 'analysis' | 'integration';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  taskType: TaskType;
  completionRequirements: string;
  outputFormat: string;
  createdAt: string;
  updatedAt: string;
  urls?: Array<{ title: string; url: string }>;
  
  // Computed fields (from API)
  taskCount?: number;
  completedTaskCount?: number;
  completionPercentage?: number;
  hasOverdueTasks?: boolean;
}

export interface ProjectWithRelations extends Project {
  tasks: Task[];
  knowledge: KnowledgeItem[];
  dependencies?: Dependency[];
}

// types/task.ts

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  taskType: TaskType;
  completionRequirements: string;
  outputFormat: string;
  assignedTo?: string;
  tags?: string[];
  urls?: Array<{ title: string; url: string }>;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description: string;
  completionRequirements: string;
  outputFormat: string;
  taskType: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedTo?: string;
  tags?: string[];
  dependencies?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string | null;
  tags?: string[];
}

// types/knowledge.ts

export type KnowledgeDomain = 'technical' | 'business' | 'scientific';

export interface KnowledgeItem {
  id: string;
  projectId: string;
  text: string;
  domain: KnowledgeDomain | string;
  tags?: string[];
  citations?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowledgeInput {
  projectId: string;
  text: string;
  domain: KnowledgeDomain | string;
  tags?: string[];
  citations?: string[];
}

// types/filter.ts

export interface DateRange {
  from: Date;
  to: Date;
  preset?: 'last7d' | 'last30d' | 'last90d' | 'custom';
}

export interface FilterState {
  search: string;
  statuses: ProjectStatus[];
  types: TaskType[];
  dateRange: DateRange | null;
}

export interface SortConfig {
  field: 'name' | 'status' | 'createdAt' | 'updatedAt' | 'completionPercentage';
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// types/api.ts

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: ProjectStatus | ProjectStatus[];
  taskType?: TaskType;
  verbosity?: 'minimal' | 'standard' | 'full';
  fields?: string[];
}

export interface ListProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProjectDetailResponse {
  project: ProjectWithRelations;
}

export interface KPIMetrics {
  totalProjects: number;
  activeProjects: number;
  completionRate: number;
  atRiskProjects: number;
  trends: {
    totalProjects: number[];
    activeProjects: number[];
    completionRate: number[];
  };
}

// types/index.ts
export * from './project';
export * from './task';
export * from './knowledge';
export * from './filter';
export * from './api';
```

---

## 4. State Management Strategy

### 4.1 State Categories

```typescript
// 1. SERVER STATE (managed by TanStack Query)
// - Project list
// - Project details
// - Tasks
// - Knowledge items
// - KPI metrics

// 2. URL STATE (managed by URL search params)
// - Filter state (search, status, type, date range)
// - Sort configuration
// - Pagination (page, pageSize)
// - Selected project ID (for detail sheet)

// 3. LOCAL STATE (React useState)
// - View preference (card/table)
// - Selected project IDs (bulk selection)
// - UI toggles (command palette open, sheet open)
// - Form inputs (create/edit modals)

// 4. PERSISTED STATE (localStorage via custom hook)
// - User preferences (theme, default view)
// - Recent projects
// - Filter presets
```

### 4.2 TanStack Query Configuration

```typescript
// lib/api/client.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys factory
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: ListProjectsParams) => 
      [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => 
      [...queryKeys.projects.details(), id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (projectId: string) => 
      [...queryKeys.tasks.all, 'list', projectId] as const,
  },
  knowledge: {
    all: ['knowledge'] as const,
    list: (projectId: string) => 
      [...queryKeys.knowledge.all, 'list', projectId] as const,
  },
  kpi: {
    all: ['kpi'] as const,
    metrics: () => [...queryKeys.kpi.all, 'metrics'] as const,
  },
};
```

### 4.3 Custom Hooks

```typescript
// hooks/useProjects.ts

import { useQuery } from '@tanstack/react-query';
import { listProjects } from '@/lib/api/projects';
import { queryKeys } from '@/lib/api/client';
import type { ListProjectsParams } from '@/types';

export function useProjects(params: ListProjectsParams) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => listProjects(params),
    keepPreviousData: true, // For smooth pagination
  });
}

// hooks/useProjectDetail.ts

export function useProjectDetail(projectId: string | null) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? ''),
    queryFn: () => getProjectDetail(projectId!),
    enabled: !!projectId, // Only fetch when projectId exists
  });
}

// hooks/useFilterState.ts

import { useSearchParams } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import type { FilterState } from '@/types';

export function useFilterState() {
  const searchParams = useSearchParams();
  
  const filters = useMemo<FilterState>(() => ({
    search: searchParams.get('search') ?? '',
    statuses: (searchParams.get('statuses')?.split(',') ?? []) as ProjectStatus[],
    types: (searchParams.get('types')?.split(',') ?? []) as TaskType[],
    dateRange: parseDateRange(searchParams.get('dateRange')),
  }), [searchParams]);
  
  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    const params = new URLSearchParams(searchParams);
    
    if (newFilters.search !== undefined) {
      params.set('search', newFilters.search);
    }
    if (newFilters.statuses !== undefined) {
      params.set('statuses', newFilters.statuses.join(','));
    }
    if (newFilters.types !== undefined) {
      params.set('types', newFilters.types.join(','));
    }
    if (newFilters.dateRange !== undefined) {
      params.set('dateRange', serializeDateRange(newFilters.dateRange));
    }
    
    window.history.pushState(null, '', `?${params.toString()}`);
  }, [searchParams]);
  
  const clearFilters = useCallback(() => {
    window.history.pushState(null, '', window.location.pathname);
  }, []);
  
  return { filters, setFilters, clearFilters };
}

// hooks/useKPIMetrics.ts

export function useKPIMetrics() {
  return useQuery({
    queryKey: queryKeys.kpi.metrics(),
    queryFn: fetchKPIMetrics,
    refetchInterval: 1000 * 60 * 2, // Refresh every 2 minutes
  });
}
```

### 4.4 State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                        │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─ Search Input ──────────────┐
             ├─ Filter Select ─────────────┤
             ├─ Sort Column ───────────────┼─> URL Search Params
             ├─ Pagination ────────────────┤   (useSearchParams)
             └─ Select Project ────────────┘
                                           │
                                           ▼
                            ┌──────────────────────────┐
                            │   useFilterState Hook    │
                            │  Parses URL → FilterState│
                            └──────────┬───────────────┘
                                       │
                                       ▼
                            ┌──────────────────────────┐
                            │    useProjects Hook      │
                            │  (TanStack Query)        │
                            └──────────┬───────────────┘
                                       │
                                       ▼
                            ┌──────────────────────────┐
                            │  API Request to Backend  │
                            │  GET /api/projects       │
                            └──────────┬───────────────┘
                                       │
                                       ▼
                            ┌──────────────────────────┐
                            │   Query Cache Update     │
                            │   (TanStack Query)       │
                            └──────────┬───────────────┘
                                       │
                                       ▼
                            ┌──────────────────────────┐
                            │   Component Re-render    │
                            │   with new data          │
                            └──────────────────────────┘
```

---

## 5. Data Flow Architecture

### 5.1 Component Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       DashboardPage                         │
│                                                             │
│  useFilterState() ──────────┐                              │
│  useProjects(filters) ──────┼─> React Query Cache          │
│  useKPIMetrics() ───────────┘                              │
│                                                             │
│  ┌──────────────────┐   ┌───────────────────┐             │
│  │  KPICardsSection │   │  FilterToolbar    │             │
│  │                  │   │                   │             │
│  │  Props:          │   │  Props:           │             │
│  │  - metrics       │   │  - filters        │             │
│  │  - loading       │   │  - onFilterChange │             │
│  └──────────────────┘   └───────────────────┘             │
│                                                             │
│  ┌────────────────────────────────────────┐                │
│  │         ProjectList                    │                │
│  │                                        │                │
│  │  Props:                                │                │
│  │  - projects                            │                │
│  │  - loading                             │                │
│  │  - view (card/table)                   │                │
│  │  - onViewChange                        │                │
│  │  - selectedIds                         │                │
│  │  - onSelectionChange                   │                │
│  │  - onProjectClick                      │                │
│  │                                        │                │
│  │  ┌──────────────────────────────────┐ │                │
│  │  │  ProjectCardView | TableView     │ │                │
│  │  │                                  │ │                │
│  │  │  Maps: projects.map(project =>  │ │                │
│  │  │    <ProjectCard                 │ │                │
│  │  │      key={project.id}           │ │                │
│  │  │      project={project}          │ │                │
│  │  │      onClick={() =>             │ │                │
│  │  │        onProjectClick(id)}      │ │                │
│  │  │    />                           │ │                │
│  │  │  )                              │ │                │
│  │  └──────────────────────────────────┘ │                │
│  └────────────────────────────────────────┘                │
│                                                             │
│  ┌────────────────────────────────────────┐                │
│  │     ProjectDetailSheet                 │                │
│  │                                        │                │
│  │  useProjectDetail(selectedProjectId)  │                │
│  │                                        │                │
│  │  Props:                                │                │
│  │  - projectId                           │                │
│  │  - open                                │                │
│  │  - onOpenChange                        │                │
│  │                                        │                │
│  │  Children:                             │                │
│  │  - ProjectHeader                       │                │
│  │  - ProjectProgress                     │                │
│  │  - TaskList (useTasks hook)            │                │
│  │  - KnowledgeList (useKnowledge hook)   │                │
│  └────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 API Layer Architecture

```typescript
// lib/api/projects.ts

import type { 
  ListProjectsParams, 
  ListProjectsResponse, 
  ProjectWithRelations 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export async function listProjects(
  params: ListProjectsParams
): Promise<ListProjectsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));
  if (params.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params.sortDirection) queryParams.set('sortDirection', params.sortDirection);
  if (params.status) {
    queryParams.set('status', Array.isArray(params.status) 
      ? params.status.join(',') 
      : params.status
    );
  }
  if (params.taskType) queryParams.set('taskType', params.taskType);
  
  const response = await fetch(
    `${API_BASE_URL}/api/atlas/projects?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getProjectDetail(
  projectId: string
): Promise<ProjectWithRelations> {
  const response = await fetch(
    `${API_BASE_URL}/api/atlas/projects/${projectId}?includeTasks=true&includeKnowledge=true`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.project;
}

export async function createProject(
  project: CreateProjectInput
): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/atlas/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'single', ...project }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.statusText}`);
  }
  
  return response.json();
}

// Similar patterns for tasks.ts, knowledge.ts, search.ts
```

---

## 6. Routing Strategy

### 6.1 Next.js App Router Structure

```typescript
// app/layout.tsx

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/api/client';
import '@/styles/globals.css';

export const metadata = {
  title: 'Atlas Dashboard',
  description: 'Project and task management dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

// app/page.tsx (Dashboard)

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICardsSection } from '@/components/dashboard/KPICards';
import { FilterToolbar } from '@/components/dashboard/FilterToolbar';
import { ProjectList } from '@/components/dashboard/ProjectList';
import { CommandPalette } from '@/components/features/CommandPalette';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <KPICardsSection />
        <FilterToolbar />
        <ProjectList />
      </div>
      <CommandPalette />
    </DashboardLayout>
  );
}

// app/projects/[id]/page.tsx (Future: Dedicated project page)

interface ProjectPageProps {
  params: { id: string };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  // Dedicated full-page project view (optional enhancement)
  // For MVP, we use Sheet overlay from dashboard
  return null;
}
```

### 6.2 URL State Management

```typescript
// Example URL structure:

// Dashboard with filters
// /?search=atlas&statuses=active,in-progress&types=research&dateRange=last30d&page=1&view=card

// Dashboard with project detail open
// /?project=proj_123abc

// Parsing logic in useFilterState hook
function parseURLFilters(searchParams: URLSearchParams): FilterState {
  return {
    search: searchParams.get('search') ?? '',
    statuses: searchParams.get('statuses')?.split(',').filter(Boolean) as ProjectStatus[] ?? [],
    types: searchParams.get('types')?.split(',').filter(Boolean) as TaskType[] ?? [],
    dateRange: parseDateRange(searchParams.get('dateRange')),
  };
}

function serializeURLFilters(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.search) params.set('search', filters.search);
  if (filters.statuses.length) params.set('statuses', filters.statuses.join(','));
  if (filters.types.length) params.set('types', filters.types.join(','));
  if (filters.dateRange) params.set('dateRange', serializeDateRange(filters.dateRange));
  
  return params;
}
```

---

## 7. Component Specifications

### 7.1 KPICard Component

```typescript
// components/dashboard/KPICards/KPICard.tsx

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SparklineChart } from '@/components/features/Charts/SparklineChart';
import { TrendIndicator } from '@/components/features/Charts/TrendIndicator';

interface KPICardProps {
  title: string;
  value: number | string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  sparklineData?: number[];
  subtitle?: string;
  onClick?: () => void;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  trend,
  sparklineData,
  subtitle,
  onClick,
  loading,
}: KPICardProps) {
  if (loading) {
    return <KPICardSkeleton />;
  }

  return (
    <Card 
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        {trend && (
          <TrendIndicator 
            value={trend.value} 
            direction={trend.direction} 
          />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {sparklineData && (
          <div className="mt-3">
            <SparklineChart data={sparklineData} height={40} />
          </div>
        )}
        {subtitle && (
          <p className="mt-2 text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### 7.2 FilterToolbar Component

```typescript
// components/dashboard/FilterToolbar/FilterToolbar.tsx

'use client';

import { SearchInput } from './SearchInput';
import { StatusFilter } from './StatusFilter';
import { TypeFilter } from './TypeFilter';
import { DateRangeFilter } from './DateRangeFilter';
import { ActiveFilterBadges } from './ActiveFilterBadges';
import { ClearFiltersButton } from './ClearFiltersButton';
import { useFilterState } from '@/hooks/useFilterState';
import { useDebounce } from '@/hooks/useDebounce';

export function FilterToolbar() {
  const { filters, setFilters, clearFilters } = useFilterState();
  
  const debouncedSearch = useDebounce(filters.search, 300);
  
  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
  };
  
  const handleStatusChange = (statuses: ProjectStatus[]) => {
    setFilters({ statuses });
  };
  
  const handleTypeChange = (types: TaskType[]) => {
    setFilters({ types });
  };
  
  const handleDateRangeChange = (dateRange: DateRange | null) => {
    setFilters({ dateRange });
  };
  
  const hasActiveFilters = 
    filters.search || 
    filters.statuses.length > 0 || 
    filters.types.length > 0 || 
    filters.dateRange !== null;
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput 
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Search projects..."
          className="flex-1"
        />
        <StatusFilter 
          selectedStatuses={filters.statuses}
          onStatusChange={handleStatusChange}
        />
        <TypeFilter 
          selectedTypes={filters.types}
          onTypeChange={handleTypeChange}
        />
        <DateRangeFilter 
          dateRange={filters.dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
        {hasActiveFilters && (
          <ClearFiltersButton onClick={clearFilters} />
        )}
      </div>
      
      {hasActiveFilters && (
        <ActiveFilterBadges 
          filters={filters}
          onRemoveFilter={(key) => {
            if (key === 'search') setFilters({ search: '' });
            if (key === 'statuses') setFilters({ statuses: [] });
            if (key === 'types') setFilters({ types: [] });
            if (key === 'dateRange') setFilters({ dateRange: null });
          }}
        />
      )}
    </div>
  );
}
```

### 7.3 ProjectList Component

```typescript
// components/dashboard/ProjectList/ProjectList.tsx

'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useFilterState } from '@/hooks/useFilterState';
import { ProjectListHeader } from './ProjectListHeader';
import { ProjectCardView } from './ProjectCardView';
import { ProjectTableView } from './ProjectTableView';
import { ProjectDetailSheet } from '../ProjectDetail/ProjectDetailSheet';
import { EmptyState } from './EmptyState';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function ProjectList() {
  const { filters } = useFilterState();
  const [view, setView] = useLocalStorage<'card' | 'table'>('projectView', 'card');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [detailProjectId, setDetailProjectId] = useState<string | null>(null);
  
  const { data, isLoading, error } = useProjects({
    page: 1,
    limit: 20,
    ...filters,
  });
  
  if (error) {
    return (
      <div className="text-center text-destructive">
        Failed to load projects. Please try again.
      </div>
    );
  }
  
  if (!isLoading && data?.projects.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <div className="space-y-4">
      <ProjectListHeader 
        totalCount={data?.pagination.total ?? 0}
        view={view}
        onViewChange={setView}
      />
      
      {view === 'card' ? (
        <ProjectCardView 
          projects={data?.projects ?? []}
          loading={isLoading}
          onProjectClick={setDetailProjectId}
        />
      ) : (
        <ProjectTableView 
          projects={data?.projects ?? []}
          loading={isLoading}
          selectedProjectIds={selectedProjectIds}
          onSelectionChange={setSelectedProjectIds}
          onProjectClick={setDetailProjectId}
        />
      )}
      
      <ProjectDetailSheet 
        projectId={detailProjectId}
        open={detailProjectId !== null}
        onOpenChange={(open) => !open && setDetailProjectId(null)}
      />
    </div>
  );
}
```

### 7.4 ProjectDetailSheet Component

```typescript
// components/dashboard/ProjectDetail/ProjectDetailSheet.tsx

'use client';

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useProjectDetail } from '@/hooks/useProjectDetail';
import { ProjectHeader } from './ProjectHeader';
import { ProjectDescription } from './ProjectDescription';
import { ProjectProgress } from './ProjectProgress';
import { TaskBreakdownChart } from './TaskBreakdownChart';
import { TaskList } from './TaskList';
import { KnowledgeList } from './KnowledgeList';

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
  const { data: project, isLoading } = useProjectDetail(projectId);
  
  if (!project && !isLoading) {
    return null;
  }
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <ScrollArea className="h-full">
          <div className="space-y-6 pr-6">
            {isLoading ? (
              <ProjectDetailSkeleton />
            ) : project ? (
              <>
                <ProjectHeader project={project} />
                
                <Separator />
                
                <ProjectDescription description={project.description} />
                
                <Separator />
                
                <ProjectProgress 
                  totalTasks={project.taskCount ?? 0}
                  completedTasks={project.completedTaskCount ?? 0}
                  percentage={project.completionPercentage ?? 0}
                />
                
                <TaskBreakdownChart 
                  tasksByStatus={calculateTaskBreakdown(project.tasks)}
                />
                
                <Separator />
                
                <TaskList 
                  projectId={project.id}
                  tasks={project.tasks}
                />
                
                <Separator />
                
                <KnowledgeList 
                  projectId={project.id}
                  knowledge={project.knowledge}
                />
              </>
            ) : null}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function calculateTaskBreakdown(tasks: Task[]): Record<TaskStatus, number> {
  return tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] ?? 0) + 1;
    return acc;
  }, {} as Record<TaskStatus, number>);
}
```

---

## 8. Performance Optimization

### 8.1 Code Splitting Strategy

```typescript
// Use dynamic imports for heavy components

// app/page.tsx
import dynamic from 'next/dynamic';

const CommandPalette = dynamic(
  () => import('@/components/features/CommandPalette').then(mod => mod.CommandPalette),
  { ssr: false }
);

const ProjectDetailSheet = dynamic(
  () => import('@/components/dashboard/ProjectDetail').then(mod => mod.ProjectDetailSheet)
);
```

### 8.2 Memoization Strategy

```typescript
// Use React.memo for expensive components

// components/dashboard/ProjectList/ProjectCard.tsx
import { memo } from 'react';

export const ProjectCard = memo(function ProjectCard({ project, onClick }: ProjectCardProps) {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison for optimization
  return prevProps.project.id === nextProps.project.id &&
         prevProps.project.updatedAt === nextProps.project.updatedAt;
});

// Use useMemo for expensive computations

function ProjectList({ projects }: { projects: Project[] }) {
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [projects]);
  
  // Render sorted projects
}
```

### 8.3 Virtual Scrolling (for large lists)

```typescript
// Use @tanstack/react-virtual for large project lists

import { useVirtualizer } from '@tanstack/react-virtual';

function ProjectCardView({ projects }: { projects: Project[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: projects.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated card height
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="h-[800px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ProjectCard project={projects[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 8.4 Optimistic Updates

```typescript
// lib/api/tasks.ts with optimistic updates

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './client';

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: UpdateTaskInput }) =>
      updateTask(taskId, updates),
    
    // Optimistic update
    onMutate: async ({ taskId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(queryKeys.tasks.list(projectId));
      
      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(
        queryKeys.tasks.list(projectId)
      );
      
      // Optimistically update
      queryClient.setQueryData(
        queryKeys.tasks.list(projectId),
        (old: Task[]) => 
          old.map(task => task.id === taskId 
            ? { ...task, ...updates } 
            : task
          )
      );
      
      return { previousTasks };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          queryKeys.tasks.list(projectId),
          context.previousTasks
        );
      }
    },
    
    // Refetch on success
    onSettled: () => {
      queryClient.invalidateQueries(queryKeys.tasks.list(projectId));
      queryClient.invalidateQueries(queryKeys.projects.detail(projectId));
    },
  });
}
```

---

## 9. Next Steps

### 9.1 Implementation Phases

**Phase 1: Foundation (Week 1)**
- Set up Next.js 15 project structure
- Install and configure shadcn/ui components
- Create base layout components
- Set up TanStack Query
- Implement basic API client

**Phase 2: Core Features (Week 2)**
- Implement KPI cards with live data
- Build filter toolbar with URL state sync
- Create project list (card and table views)
- Add project detail sheet

**Phase 3: Advanced Features (Week 3)**
- Implement command palette
- Add task and knowledge management
- Build charts and visualizations
- Add bulk actions

**Phase 4: Polish (Week 4)**
- Performance optimization
- Loading states and skeletons
- Error boundaries
- Responsive design refinement
- Dark mode polish
- Accessibility audit

### 9.2 Testing Strategy

```typescript
// tests/components/KPICard.test.tsx

import { render, screen } from '@testing-library/react';
import { KPICard } from '@/components/dashboard/KPICards/KPICard';

describe('KPICard', () => {
  it('renders metric value and title', () => {
    render(
      <KPICard 
        title="Total Projects" 
        value={45}
      />
    );
    
    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });
  
  it('displays trend indicator when provided', () => {
    render(
      <KPICard 
        title="Active Projects" 
        value={32}
        trend={{ value: 12.5, direction: 'up' }}
      />
    );
    
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });
});
```

### 9.3 Documentation Requirements

- Component Storybook for all UI components
- API documentation for data fetching hooks
- Type documentation with TSDoc
- README for setup and development
- Architecture decision records (ADRs)

---

## 10. Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "@tanstack/react-virtual": "^3.0.0",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "zod": "^3.22.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## Summary

This architecture provides:

1. **Clear separation of concerns** with feature-based folder structure
2. **Type-safe data flow** with comprehensive TypeScript definitions
3. **Efficient state management** using TanStack Query for server state and URL params for filters
4. **Reusable components** built on shadcn/ui primitives
5. **Performance optimization** through memoization, code splitting, and virtual scrolling
6. **Scalable patterns** that support future feature additions

The architecture is designed to be:
- **Maintainable**: Clear component boundaries and responsibilities
- **Testable**: Pure components with isolated logic
- **Performant**: Optimistic updates, query caching, and lazy loading
- **Accessible**: Built on shadcn/ui's accessible primitives
- **Responsive**: Mobile-first design with breakpoint considerations
