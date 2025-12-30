import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Tag,
  Link2,
  Clock,
  Globe,
  Beaker,
  Briefcase,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ExpandableContent } from "./ExpandableContent";

interface Knowledge {
  id: string;
  projectId: string;
  text: string;
  domain: string | null;
  tags?: string[];
  citations?: string[];
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeListProps {
  knowledge: Knowledge[];
  className?: string;
}

const DOMAIN_CONFIG: Record<string, { icon: typeof Globe; color: string; bg: string }> = {
  technical: {
    icon: Beaker,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  business: {
    icon: Briefcase,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  scientific: {
    icon: Globe,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
};

const DEFAULT_DOMAIN_CONFIG = { icon: BookOpen, color: "text-slate-400", bg: "bg-slate-500/10" };

/** Safely parse URL hostname with fallback for malformed URLs */
function safeParseHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    // Fallback for malformed URLs: truncate to reasonable length
    return url.length > 30 ? url.slice(0, 30) + "..." : url;
  }
}

function KnowledgeCard({ item }: { item: Knowledge }) {
  const domain = (item.domain && DOMAIN_CONFIG[item.domain]) || DEFAULT_DOMAIN_CONFIG;
  const DomainIcon = domain.icon;

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-4 transition-all duration-200",
        "bg-card/50 hover:bg-card/80",
        "border-border/50 hover:border-primary/30",
        "hover:shadow-[0_0_20px_rgba(20,184,166,0.1)]"
      )}
    >
      <div className="space-y-3">
        {/* Header with domain */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md", domain.bg)}>
              <DomainIcon className={cn("h-4 w-4", domain.color)} />
            </div>
            {item.domain && (
              <Badge
                variant="outline"
                className={cn("text-xs capitalize", domain.color)}
              >
                {item.domain}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
          </div>
        </div>

        {/* Expandable content with markdown rendering */}
        <ExpandableContent
          content={item.text}
          maxLines={4}
          renderAsMarkdown={true}
        />

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {item.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs bg-muted/50"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Citations */}
        {item.citations && item.citations.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" />
              <span>Citations ({item.citations.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.citations.slice(0, 3).map((citation, idx) => {
                const isUrl = citation.startsWith("http");
                return isUrl ? (
                  <a
                    key={idx}
                    href={citation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline truncate max-w-[200px]"
                    aria-label={`Citation link to ${safeParseHostname(citation)} (opens in new tab)`}
                  >
                    {safeParseHostname(citation)}
                  </a>
                ) : (
                  <span
                    key={idx}
                    className="text-xs text-muted-foreground truncate max-w-[200px]"
                  >
                    {citation}
                  </span>
                );
              })}
              {item.citations.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{item.citations.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function KnowledgeList({ knowledge, className }: KnowledgeListProps) {
  if (knowledge.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No knowledge items found</p>
      </div>
    );
  }

  // Group by domain
  const groupedKnowledge = knowledge.reduce((acc, item) => {
    const domain = item.domain || "uncategorized";
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(item);
    return acc;
  }, {} as Record<string, Knowledge[]>);

  const domainOrder = ["technical", "business", "scientific", "uncategorized"];

  return (
    <div className={cn("space-y-6", className)}>
      {domainOrder.map((domain) => {
        const items = groupedKnowledge[domain];
        if (!items || items.length === 0) return null;

        const config = DOMAIN_CONFIG[domain] || DEFAULT_DOMAIN_CONFIG;
        const DomainIcon = config.icon;

        return (
          <div key={domain} className="space-y-3">
            <div className="flex items-center gap-2">
              <DomainIcon className={cn("h-4 w-4", config.color)} />
              <h3 className="text-sm font-medium capitalize">
                {domain === "uncategorized" ? "Other" : domain}
              </h3>
              <span className="text-xs text-muted-foreground">
                ({items.length})
              </span>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <KnowledgeCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
