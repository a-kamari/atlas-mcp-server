# Atlas WebUI Dashboard Redesign

**Date:** 2024-12-29
**Status:** Design Complete
**Atlas Project ID:** `proj_9d928b748e8f4070ac71152f8f097193`

## Overview

UI/UX improvement for the Atlas MCP Server WebUI targeting power and administrative users who need to quickly understand and consume project information.

### Focus Areas

1. **Finding and filtering projects quickly** - Search, status filters, type filters, date range filters
2. **Understanding project health at a glance** - KPI cards, task completion metrics, progress bars, visual status indicators

### Technology Stack

- **Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Tables:** TanStack Table

---

## 1. Dashboard Layout Architecture

```
+----------------------------------------------------------+
|  [Logo]  Atlas Dashboard    [Cmd+K Search]  [Theme] [User]|
+----------------------------------------------------------+
|                                                           |
|  +----------+ +----------+ +----------+ +----------+      |
|  | Total    | | Active   | | Completion| | At Risk |      |
|  | Projects | | Projects | | Rate     | | Projects|      |
|  |    45    | |    32    | |   67%    | |    3    |      |
|  | +12% ^   | | -2 v     | | +5% ^    | | +1 ^    |      |
|  +----------+ +----------+ +----------+ +----------+      |
|                                                           |
|  [Search...] [Status v] [Type v] [Date v] [Clear Filters] |
|                                                           |
|  Projects (45)                    [Card View | Table View]|
|  +--------------------------------------------------+     |
|  | Project cards or table rows here                 |     |
|  +--------------------------------------------------+     |
+----------------------------------------------------------+
```

### Information Hierarchy

- **Top:** Sticky header with navigation and global search
- **KPI Row:** 4 summary cards for instant health overview
- **Filter Toolbar:** All filter controls in single row
- **Project List:** Hybrid card/table view with toggle

---

## 2. KPI Summary Cards

### Card Anatomy

```
+-----------------------------------+
| Metric Label           ^ +12.5%  |
| -------------------------------- |
|        45                        |
| [sparkline trend graph]          |
| Updated: 2 min ago               |
+-----------------------------------+
```

### Four Primary Cards

| Card | Primary Metric | Secondary Info | Indicator |
|------|----------------|----------------|-----------|
| **Total Projects** | Count (45) | vs last period | Trend arrow + % |
| **Active Projects** | Count (32) | Status breakdown tooltip | Trend arrow |
| **Completion Rate** | Percentage (67%) | X of Y tasks | Progress ring/bar |
| **At Risk** | Count (3) | Overdue/blocked tasks | Warning color if > 0 |

### Interaction Behavior

- **Hover:** Tooltip with breakdown details
- **Click:** Navigates to filtered view
- **Sparkline:** 7-day or 30-day trend
- **Colors:** Green (positive), amber (neutral), red (negative)

### shadcn Components

`Card`, `Badge`, Recharts `<AreaChart>` for sparklines

---

## 3. Filter Toolbar

### Layout

```
+----------------------------------------------------------------------+
| [Search projects...] | [Status v] | [Type v] | [Date Range v] | [Clear] |
+----------------------------------------------------------------------+
```

### Filter Specifications

| Filter | Component | Options | Behavior |
|--------|-----------|---------|----------|
| **Search** | `Input` | Free text | Debounced (300ms), searches name + description |
| **Status** | Multi-select `Combobox` | Active, Pending, In-Progress, Completed, Archived | Checkbox list with count badge |
| **Type** | Multi-select `Combobox` | Research, Generation, Analysis, Integration | Checkbox list |
| **Date Range** | `DatePicker` + `Popover` | Last 7d, 30d, 90d, Custom | Presets + calendar picker |
| **Clear** | `Button` (ghost) | - | Resets all filters, hidden when no filters active |

### Active Filter Display

```
Active filters: [Status: Active, Pending x] [Type: Research x] [Last 30 days x]
```

### State Persistence

- Filters persist in URL query params (shareable links)
- Cached in localStorage for return visits
- `Cmd+K` opens global command palette

### shadcn Components

`Input`, `Combobox`, `DatePicker`, `Popover`, `Button`, `Badge`

---

## 4. Hybrid Project List

### View Toggle

```
Projects (45)                              [Cards] [Table]
```

### Card View (Default)

```
+-------------------------+  +-------------------------+
| Atlas MCP Server        |  | Frontend Redesign       |
| * Active    Research    |  | * In-Progress  Gen      |
|                         |  |                         |
| ============----  75%   |  | ======--------  42%     |
| 9/12 tasks completed    |  | 5/12 tasks completed    |
|                         |  |                         |
| Updated: 2 hours ago    |  | Updated: 10 min ago     |
| [View] [...]            |  | [View] [...]            |
+-------------------------+  +-------------------------+
```

**Card Features:**
- Status badge with color
- Type tag
- Progress bar with percentage
- Task count fraction
- Relative timestamp
- Action menu (View, Edit, Archive, Delete)

### Table View

```
+------------------------------------------------------------------------+
| [ ] | Name              | Status      | Type     | Progress | Updated  |
|-----|-------------------|-------------|----------|----------|----------|
| [ ] | Atlas MCP Server  | * Active    | Research | ===- 75% | 2h ago   |
| [ ] | Frontend Redesign | * In-Prog   | Gen      | ==-- 42% | 10m ago  |
| [ ] | API Integration   | o Pending   | Analysis | ---- 0%  | 1d ago   |
+------------------------------------------------------------------------+
        [< Prev]  Page 1 of 5  [Next >]    Showing 10 per page v
```

**Table Features:**
- Sortable columns (click header)
- Row selection checkboxes
- Inline progress bars
- Pagination controls
- Bulk action bar on selection

### Interactions

- **Card/Row click:** Opens project detail sheet
- **`...` menu:** Quick actions
- **Bulk selection:** Shows bulk action bar

### shadcn Components

`DataTable` (TanStack), `Card`, `Progress`, `Badge`, `DropdownMenu`, `Checkbox`, `Button`

---

## 5. Project Detail View

Slide-out sheet from right side:

```
+--------------------------------------------------+
| <- Back                              [Edit] [...] |
|--------------------------------------------------|
|                                                  |
| Atlas MCP Server                                 |
| * Active   Research   Created: Dec 15, 2024     |
|                                                  |
| ------------------------------------------------ |
| Description                                      |
| MCP server for project and task management...   |
|                                                  |
| ------------------------------------------------ |
| Progress                        75% Complete    |
| ====================--------   9 of 12 tasks   |
|                                                  |
| Task Breakdown                                   |
| +---------------------------------------------+ |
| | Backlog     ==------------------  2        | |
| | Todo        ===----------------- 1        | |
| | In-Progress ====---------------- 0        | |
| | Completed   =================--- 9        | |
| +---------------------------------------------+ |
|                                                  |
| ------------------------------------------------ |
| Tasks                           [+ Add Task]    |
| [ ] Implement auth flow           * In-Progress |
| [ ] Write unit tests              o Todo        |
| [x] Setup database schema         / Completed   |
|                                                  |
| ------------------------------------------------ |
| Knowledge Items (5)             [+ Add]         |
| - API design patterns (technical)               |
| - User requirements (business)                  |
|                                                  |
+--------------------------------------------------+
```

### Sections

1. **Header:** Name, status badge, type, dates, actions
2. **Description:** Full project description (expandable)
3. **Progress:** Visual bar + fraction + percentage
4. **Task Breakdown:** Horizontal stacked bar by status
5. **Task List:** Scrollable list with status indicators
6. **Knowledge Items:** Collapsible list

### shadcn Components

`Sheet`, `Progress`, `Tabs`, `ScrollArea`, `Badge`, `Button`

---

## 6. Command Palette

Accessible via `Cmd+K` (macOS) or `Ctrl+K` (Windows):

```
+------------------------------------------------------+
| > Type a command or search...                        |
|------------------------------------------------------|
| Recent                                               |
|   <- Atlas MCP Server                               |
|   <- Frontend Redesign                              |
|                                                      |
| Projects                                             |
|   [folder] Search all projects...                   |
|   + Create new project                              |
|                                                      |
| Quick Filters                                        |
|   * Show Active projects                            |
|   ! Show At-Risk projects                           |
|   / Show Completed projects                         |
|                                                      |
| Navigation                                           |
|   [chart] Go to Dashboard                           |
|   [gear] Settings                                   |
|   ? Keyboard shortcuts                              |
+------------------------------------------------------+
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open command palette |
| `Escape` | Close palette/drawer/modal |
| `Up/Down` | Navigate list items |
| `Enter` | Select/confirm |
| `/` | Focus search input (on dashboard) |
| `g` then `d` | Go to dashboard |
| `g` then `p` | Go to projects |
| `n` | New project (on project list) |

### Search Behavior

- Fuzzy matches project names
- Shows recent projects first
- Groups results by category
- Highlights matching characters

### shadcn Components

`CommandDialog`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`

---

## 7. Responsive Design

### Breakpoint Behavior

| Breakpoint | KPI Cards | Filters | Project List | Detail View |
|------------|-----------|---------|--------------|-------------|
| **Desktop** (1024px+) | 4 columns | Single row | Card grid or full table | Side sheet (40% width) |
| **Tablet** (768-1023px) | 2 columns | 2 rows stacked | 2-col cards or scrollable table | Side sheet (60% width) |
| **Mobile** (<768px) | 1 column | Collapsible accordion | Cards only (no table) | Full-screen sheet |

### Grid Layout

```css
/* Desktop */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* Tablet */
@media (max-width: 1023px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 767px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 8. Component Summary

| Feature | shadcn Components |
|---------|-------------------|
| Layout | `Card`, `Separator`, `Tabs` |
| KPI Cards | `Card`, `Badge`, Recharts `AreaChart` |
| Filters | `Input`, `Combobox`, `DatePicker`, `Popover`, `Button` |
| Project List | `DataTable`, `Card`, `Progress`, `Badge`, `DropdownMenu` |
| Detail View | `Sheet`, `ScrollArea`, `Progress`, `Tabs` |
| Command Palette | `CommandDialog`, `CommandInput`, `CommandList`, `CommandGroup` |
| Feedback | `Skeleton`, `Toast`, empty states |

---

## 9. Implementation Phases

### Phase 1: Core Dashboard (Foundation)

1. KPI summary cards (project counts, completion rates)
2. Basic project list with status badges
3. Text search across projects
4. Card/Table view toggle

**Components:** Card, Badge, Input, Tabs, DataTable

### Phase 2: Enhanced Filtering

5. Status filter dropdown (multi-select)
6. Task type filter dropdown
7. Date range picker with presets
8. Active filter badges with clear option
9. Filter state persistence (localStorage)

**Components:** Select, Combobox, DatePicker, Popover

### Phase 3: Advanced Views & Navigation

10. Sortable table columns
11. Column visibility toggles
12. Command palette (Cmd+K global search)
13. Pagination controls
14. Row selection for bulk actions

**Components:** Command, DropdownMenu, Checkbox

### Phase 4: Rich Visualizations

15. Progress bars per project
16. Task distribution stacked bar charts
17. Sparkline trends in KPI cards
18. Project health score indicators
19. Timeline/activity views

**Components:** Progress, Recharts (Bar, Line), custom health badges

### Phase 5: Polish & Optimization

20. Loading skeletons
21. Empty states with guidance
22. Error boundaries
23. Keyboard navigation
24. Dark mode refinements
25. Performance optimization

---

## 10. Design Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary Layout | Hybrid Card/Table with Toggle | Cards for visual scanning, tables for power users |
| Filter Types | Status, Type, Search, Date Range | Covers all user-requested filtering needs |
| KPI Metrics | 4 summary cards | Quick health overview without overwhelming |
| Component Library | shadcn/ui | Modern, accessible, themeable, composable |
| Detail View | Side sheet | Maintains context, doesn't lose list position |
| Global Search | Command palette (Cmd+K) | Power user friendly, keyboard-first |

---

## References

### Dashboard Design
- [UXPin Dashboard Design Principles](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- [Pencil & Paper UX Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)
- [Fuselab 2025 Trends](https://fuselabcreative.com/top-dashboard-design-trends-2025/)

### Data Visualization
- [Userpilot Data Visualization UX](https://userpilot.com/blog/data-visualization-ux-best-practices/)
- [DataCamp Dashboard Design](https://www.datacamp.com/tutorial/dashboard-design-tutorial)

### shadcn/ui
- [Official Dashboard Examples](https://ui.shadcn.com/examples/dashboard)
- [Data Table Docs](https://ui.shadcn.com/docs/components/data-table)
- [Chart Component](https://ui.shadcn.com/docs/components/chart)
- [Command Component](https://ui.shadcn.com/docs/components/command)

### Layout
- [PatternFly Dashboard Guidelines](https://www.patternfly.org/patterns/dashboard/design-guidelines/)
