import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        // Status variants with Mission Control styling
        active:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_hsl(173,80%,40%,0.3)]",
        pending:
          "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_8px_hsl(43,96%,56%,0.3)]",
        "in-progress":
          "border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_8px_hsl(217,91%,60%,0.3)]",
        completed:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_hsl(142,76%,36%,0.3)]",
        archived:
          "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
