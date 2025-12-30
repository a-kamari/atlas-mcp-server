import { Search, LayoutGrid, Table2, X, Filter, CalendarDays, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import type { ProjectStatus, TaskType } from "@/types/filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterState, ViewMode } from "@/types/filter";
import { useDebounce } from "@/hooks";
import { useState, useEffect } from "react";

interface FilterToolbarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const STATUS_OPTIONS: MultiSelectOption[] = [
  { value: "active", label: "Active", color: "hsl(173, 80%, 40%)" },
  { value: "pending", label: "Pending", color: "hsl(43, 96%, 56%)" },
  { value: "in-progress", label: "In Progress", color: "hsl(217, 91%, 60%)" },
  { value: "completed", label: "Completed", color: "hsl(142, 76%, 36%)" },
  { value: "archived", label: "Archived", color: "hsl(215, 20%, 45%)" },
];

const TYPE_OPTIONS: MultiSelectOption[] = [
  { value: "research", label: "Research" },
  { value: "generation", label: "Generation" },
  { value: "analysis", label: "Analysis" },
  { value: "integration", label: "Integration" },
  { value: "design", label: "Design" },
  { value: "refactoring", label: "Refactoring" },
];

const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 days" },
  { value: "30days", label: "Last 30 days" },
  { value: "90days", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export function FilterToolbar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
}: FilterToolbarProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [datePreset, setDatePreset] = useState<string>("all");
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const hasActiveFilters =
    filters.search ||
    filters.status.length > 0 ||
    filters.taskType.length > 0 ||
    datePreset !== "all";

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.status.length +
    filters.taskType.length +
    (datePreset !== "all" ? 1 : 0);

  const clearFilters = () => {
    setSearchInput("");
    setDatePreset("all");
    onFiltersChange({
      search: "",
      status: [],
      taskType: [],
      dateRange: null,
    });
  };

  const handleDatePresetChange = (value: string) => {
    setDatePreset(value);
    if (value === "all") {
      onFiltersChange({ ...filters, dateRange: null });
    } else {
      const now = new Date();
      let from: Date;
      switch (value) {
        case "today":
          from = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "7days":
          from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
          from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90days":
          from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          from = new Date(0);
      }
      onFiltersChange({
        ...filters,
        dateRange: { from, to: new Date() },
      });
    }
  };

  const removeStatusFilter = (status: string) => {
    onFiltersChange({
      ...filters,
      status: filters.status.filter((s) => s !== status),
    });
  };

  const removeTypeFilter = (type: string) => {
    onFiltersChange({
      ...filters,
      taskType: filters.taskType.filter((t) => t !== type),
    });
  };

  return (
    <div className="space-y-4">
      {/* Main filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-card border-border/50 focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Status filter */}
        <MultiSelect
          options={STATUS_OPTIONS}
          selected={filters.status}
          onChange={(status) => onFiltersChange({ ...filters, status: status as ProjectStatus[] })}
          placeholder="Status"
          className="w-[140px] bg-card border-border/50"
        />

        {/* Type filter */}
        <MultiSelect
          options={TYPE_OPTIONS}
          selected={filters.taskType}
          onChange={(taskType) => onFiltersChange({ ...filters, taskType: taskType as TaskType[] })}
          placeholder="Type"
          className="w-[140px] bg-card border-border/50"
        />

        {/* Date range preset */}
        <Select value={datePreset} onValueChange={handleDatePresetChange}>
          <SelectTrigger className="w-[150px] bg-card border-border/50">
            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-md bg-card border border-border/50">
          <Button
            variant={viewMode === "card" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("card")}
            className="h-7 w-7 p-0"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("table")}
            className="h-7 w-7 p-0"
          >
            <Table2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">
              {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
            </span>
          </div>
          
          <div className="h-4 w-px bg-border" />

          {/* Search badge */}
          {filters.search && (
            <span className="filter-chip">
              Search: "{filters.search}"
              <button
                onClick={() => {
                  setSearchInput("");
                  onFiltersChange({ ...filters, search: "" });
                }}
                className="hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Status badges */}
          {filters.status.map((status) => {
            const option = STATUS_OPTIONS.find((o) => o.value === status);
            return (
              <span key={status} className="filter-chip">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: option?.color }}
                />
                {option?.label || status}
                <button
                  onClick={() => removeStatusFilter(status)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}

          {/* Type badges */}
          {filters.taskType.map((type) => {
            const option = TYPE_OPTIONS.find((o) => o.value === type);
            return (
              <span key={type} className="filter-chip">
                {option?.label || type}
                <button
                  onClick={() => removeTypeFilter(type)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}

          {/* Date range badge */}
          {datePreset !== "all" && (
            <span className="filter-chip">
              <CalendarDays className="h-3 w-3" />
              {DATE_PRESETS.find((p) => p.value === datePreset)?.label}
              <button
                onClick={() => handleDatePresetChange("all")}
                className="hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <div className="h-4 w-px bg-border" />

          {/* Clear all button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
