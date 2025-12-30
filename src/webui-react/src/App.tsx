import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICards } from "@/components/dashboard/KPICards";
import { FilterToolbar } from "@/components/dashboard/FilterToolbar";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { ProjectDetailSheet } from "@/components/dashboard/ProjectDetailSheet";
import { CommandPalette } from "@/components/features/CommandPalette";
import { Toaster } from "@/components/ui/sonner";
import type { FilterState, ViewMode } from "@/types/filter";

const initialFilters: FilterState = {
  search: "",
  status: [],
  taskType: [],
  dateRange: null,
};

function App() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for command palette
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCommandPaletteOpen(true);
    }
  };

  // Register keyboard listener
  useState(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <KPICards />
          <FilterToolbar
            filters={filters}
            onFiltersChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <ProjectList
            filters={filters}
            viewMode={viewMode}
            onSelectProject={setSelectedProjectId}
          />
        </div>
      </DashboardLayout>

      <ProjectDetailSheet
        projectId={selectedProjectId}
        open={selectedProjectId !== null}
        onOpenChange={(open) => !open && setSelectedProjectId(null)}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onSelectProject={setSelectedProjectId}
        onApplyFilters={setFilters}
      />

      <Toaster />
    </>
  );
}

export default App;
