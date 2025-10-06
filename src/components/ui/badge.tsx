
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-md",
        outline: "border-2 border-primary/50 text-foreground backdrop-blur-sm bg-background/50 hover:bg-primary/10",
        success: "border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg",
        info: "border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg",
        warning: "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg",
        live: "border-transparent bg-gradient-to-r from-accent to-destructive text-white shadow-md hover:shadow-glow animate-pulse-subtle",
        source: "border-2 border-primary/30 bg-card/80 backdrop-blur-sm text-foreground hover:bg-primary/10 hover:border-primary/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
