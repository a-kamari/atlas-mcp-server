interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProject: (projectId: string) => void;
  onApplyFilters: (filters: any) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
}: CommandPaletteProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <div className="bg-background border rounded-lg shadow-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            Command palette coming soon
          </p>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Esc to close
          </p>
        </div>
      </div>
    </div>
  );
}
