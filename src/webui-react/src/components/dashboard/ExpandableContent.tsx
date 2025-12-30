"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "./MarkdownContent";

interface ExpandableContentProps {
  /** The text content to display (can be markdown) */
  content: string;
  /** Maximum lines to show before truncation (supports 1-6, defaults to 3) */
  maxLines?: number;
  className?: string;
  /** Whether to render expanded content as markdown (default: true) */
  renderAsMarkdown?: boolean;
}

/**
 * Expandable content component with line-clamp truncation and smooth expand/collapse.
 * Uses CSS line-clamp for preview and Collapsible for smooth transitions.
 * Properly renders markdown content when expanded.
 */
export const ExpandableContent = React.memo(function ExpandableContent({
  content,
  maxLines = 3,
  className,
  renderAsMarkdown = true,
}: ExpandableContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const measureRef = useRef<HTMLDivElement>(null);

  // Use layoutEffect to measure before browser paint to avoid layout shift
  useLayoutEffect(() => {
    const element = measureRef.current;
    if (element) {
      // Compare actual scroll height vs visible height
      const lineHeight = parseInt(getComputedStyle(element).lineHeight) || 20;
      const maxHeight = lineHeight * maxLines;
      setNeedsTruncation(element.scrollHeight > maxHeight + 5);
    }
  }, [content, maxLines]);

  // Handle empty content
  if (!content || content.trim() === "") {
    return null;
  }

  // Generate line clamp class dynamically (supports 1-6)
  const clampedLines = Math.min(Math.max(maxLines, 1), 6);
  const lineClampClass = `line-clamp-${clampedLines}`;

  // Short content that doesn't need truncation
  if (!needsTruncation) {
    return (
      <div className={className}>
        {/* Hidden measurement div */}
        <div
          ref={measureRef}
          className={cn(
            "text-sm text-muted-foreground whitespace-pre-wrap",
            lineClampClass
          )}
          style={{ position: "absolute", visibility: "hidden", pointerEvents: "none" }}
        >
          {content}
        </div>
        {renderAsMarkdown ? (
          <MarkdownContent content={content} />
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {content}
          </p>
        )}
      </div>
    );
  }

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn("space-y-2", className)}
    >
      {/* Hidden measurement div for initial render */}
      <div
        ref={measureRef}
        className={cn(
          "text-sm text-muted-foreground whitespace-pre-wrap",
          lineClampClass
        )}
        style={{ position: "absolute", visibility: "hidden", pointerEvents: "none" }}
      >
        {content}
      </div>

      {/* Preview (truncated) */}
      {!isExpanded && (
        <div
          className={cn(
            "text-sm text-muted-foreground whitespace-pre-wrap",
            lineClampClass
          )}
        >
          {content}
        </div>
      )}

      {/* Full content (expanded) */}
      <CollapsibleContent className="space-y-2">
        {renderAsMarkdown ? (
          <MarkdownContent content={content} />
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {content}
          </p>
        )}
      </CollapsibleContent>

      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-auto px-2 py-1 text-xs",
            "text-primary/70 hover:text-primary hover:bg-primary/10",
            "transition-colors duration-200"
          )}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Show less content" : "Read more content"}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Read more
            </>
          )}
        </Button>
      </CollapsibleTrigger>
    </Collapsible>
  );
});
