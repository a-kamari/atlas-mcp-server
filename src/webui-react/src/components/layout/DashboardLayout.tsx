import { ReactNode } from "react";
import { Command, Zap, Signal, Wifi } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between px-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg">
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight">
                Atlas
                <span className="text-primary ml-1">Dashboard</span>
              </h1>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-0.5">
                Mission Control
              </span>
            </div>
          </div>

          {/* Center - Status indicators */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-xs text-muted-foreground">
                System Online
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Signal className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">
                Neo4j Connected
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <span className="text-primary">{currentTime}</span>
              <span>UTC</span>
            </div>
          </div>

          {/* Right - Command palette hint */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted border border-border/50 transition-colors group">
              <Command className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Quick search...
              </span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6 px-6">{children}</main>

      {/* Footer status bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/80 backdrop-blur-xl z-40">
        <div className="container flex h-8 items-center justify-between px-6 text-xs">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-emerald-400" />
              Connected to Atlas MCP Server
            </span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>v2.8.15</span>
            <span className="h-3 w-px bg-border" />
            <span className="font-mono text-primary">atlas-mcp-server</span>
          </div>
        </div>
      </footer>

      {/* Add padding to account for fixed footer */}
      <div className="h-8" />
    </div>
  );
}
