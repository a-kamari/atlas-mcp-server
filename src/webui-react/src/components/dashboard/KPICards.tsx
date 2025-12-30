import { useDashboardMetrics } from "@/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  CheckCircle2,
  Clock,
  FolderOpen,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Simple sparkline component
function Sparkline({
  data,
  color = "hsl(173, 80%, 40%)",
  className,
}: {
  data: number[];
  color?: string;
  className?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 32;
  const padding = 2;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y =
        height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full h-8", className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#sparkline-gradient-${color.replace(/[^a-z0-9]/gi, '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Trend indicator component
function TrendIndicator({
  value,
  suffix = "",
  positive = true,
}: {
  value: number;
  suffix?: string;
  positive?: boolean;
}) {
  const isUp = value > 0;
  const isNeutral = value === 0;
  const isGood = positive ? isUp : !isUp;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isNeutral
          ? "text-muted-foreground"
          : isGood
            ? "text-emerald-400"
            : "text-rose-400"
      )}
    >
      {isNeutral ? (
        <Minus className="h-3 w-3" />
      ) : isUp ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

export function KPICards() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="mission-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-4 w-24 bg-muted/50" />
                <Skeleton className="h-8 w-8 rounded-lg bg-muted/50" />
              </div>
              <Skeleton className="h-10 w-20 mb-2 bg-muted/50" />
              <Skeleton className="h-8 w-full mb-3 bg-muted/50" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-32 bg-muted/50" />
                <Skeleton className="h-4 w-12 bg-muted/50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  // Generate mock sparkline data based on metrics
  const generateSparklineData = (baseValue: number, variance: number = 0.2) => {
    const points = 12;
    return Array.from({ length: points }, (_, i) => {
      const trend = i / points;
      const noise = (Math.random() - 0.5) * variance;
      return Math.max(0, baseValue * (0.7 + trend * 0.3 + noise));
    });
  };

  const cards = [
    {
      title: "Total Projects",
      value: metrics.overview.totalProjects,
      description: `${metrics.overview.activeProjects} active, ${metrics.overview.completedProjects} completed`,
      icon: FolderOpen,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      trend: 12,
      trendPositive: true,
      sparklineData: generateSparklineData(metrics.overview.totalProjects),
      sparklineColor: "hsl(217, 91%, 60%)",
    },
    {
      title: "Active Projects",
      value: metrics.overview.activeProjects,
      description: `${metrics.overview.inProgressProjects} in progress`,
      icon: Activity,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      trend: 5,
      trendPositive: true,
      sparklineData: generateSparklineData(metrics.overview.activeProjects),
      sparklineColor: "hsl(173, 80%, 40%)",
    },
    {
      title: "Completion Rate",
      value: Math.round(metrics.taskMetrics.overallCompletionRate),
      suffix: "%",
      description: `${metrics.taskMetrics.completedTasks}/${metrics.taskMetrics.totalTasks} tasks`,
      icon: CheckCircle2,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-400",
      trend: 8,
      trendPositive: true,
      sparklineData: generateSparklineData(
        metrics.taskMetrics.overallCompletionRate
      ),
      sparklineColor: "hsl(265, 89%, 66%)",
    },
    {
      title: "Pending Review",
      value: metrics.overview.pendingProjects,
      description: `${metrics.taskMetrics.todoTasks} tasks in backlog`,
      icon: Clock,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      trend: -3,
      trendPositive: false,
      sparklineData: generateSparklineData(metrics.overview.pendingProjects),
      sparklineColor: "hsl(43, 96%, 56%)",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="mission-card mission-glow group cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </span>
                <div
                  className={cn(
                    "p-2 rounded-lg transition-transform group-hover:scale-110",
                    card.iconBg
                  )}
                >
                  <Icon className={cn("h-4 w-4", card.iconColor)} />
                </div>
              </div>

              {/* Value */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold kpi-value tracking-tight">
                  {card.value}
                  {card.suffix && (
                    <span className="text-xl text-muted-foreground">
                      {card.suffix}
                    </span>
                  )}
                </span>
                <TrendIndicator
                  value={card.trend}
                  suffix="%"
                  positive={card.trendPositive}
                />
              </div>

              {/* Sparkline */}
              <div className="my-3 opacity-80 group-hover:opacity-100 transition-opacity">
                <Sparkline
                  data={card.sparklineData}
                  color={card.sparklineColor}
                />
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
