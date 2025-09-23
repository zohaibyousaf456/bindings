import * as React from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "secondary" | "outline"

function Badge({ className, variant = "secondary", ...props }: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
  const styles =
    variant === "default"
      ? "bg-primary text-primary-foreground"
      : variant === "outline"
        ? "border border-border text-foreground"
        : "bg-secondary text-secondary-foreground"
  return <span className={cn(base, styles, className)} {...props} />
}

export default Badge

