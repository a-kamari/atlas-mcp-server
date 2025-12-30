import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown content with proper styling for the Mission Control dark theme.
 * Uses react-markdown with GFM support for tables, task lists, strikethrough, etc.
 *
 * SECURITY: This component is secure by default - raw HTML in markdown is NOT rendered.
 * react-markdown converts markdown directly to React components without using
 * dangerouslySetInnerHTML, preventing XSS attacks.
 *
 * WARNING: Do NOT add rehype-raw without also adding rehype-sanitize for XSS protection.
 */
export const MarkdownContent = React.memo(function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  return (
    <article
      className={cn(
        "prose prose-sm prose-invert max-w-none",
        // Headings
        "prose-headings:text-slate-100 prose-headings:font-semibold",
        "prose-h1:text-lg prose-h2:text-base prose-h3:text-sm",
        // Paragraphs and text
        "prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-2",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline hover:prose-a:text-primary/80",
        // Strong and emphasis
        "prose-strong:text-slate-100 prose-em:text-slate-200",
        // Inline code
        "prose-code:text-cyan-300 prose-code:bg-slate-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs",
        "prose-code:before:content-none prose-code:after:content-none",
        // Code blocks
        "prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-lg",
        // Blockquotes
        "prose-blockquote:border-primary/50 prose-blockquote:text-slate-400 prose-blockquote:not-italic prose-blockquote:pl-4",
        // Lists
        "prose-ul:text-slate-300 prose-ol:text-slate-300",
        "prose-li:text-slate-300 prose-li:marker:text-primary/70",
        "prose-li:my-1",
        // Horizontal rule
        "prose-hr:border-slate-700",
        // Tables
        "prose-th:text-slate-200 prose-th:font-semibold prose-th:border-slate-700",
        "prose-td:text-slate-300 prose-td:border-slate-700",
        className
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </article>
  );
});
