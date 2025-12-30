import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-muted/50",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all relative"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full bg-primary opacity-50 blur-sm"
        style={{ transform: "scaleY(2)" }}
      />
      {/* Highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/30 rounded-full" />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
