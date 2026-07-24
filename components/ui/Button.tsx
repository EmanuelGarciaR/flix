import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center cursor-pointer justify-center whitespace-nowrap rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-on-primary hover:bg-primary/90": variant === "primary",
            "border border-on-background/20 bg-transparent hover:bg-on-background/10": variant === "secondary",
            "h-10 px-4 py-2 text-body-sm": size === "default",
            "h-8 rounded-sm px-3 text-label-caps": size === "sm",
            "h-12 rounded-md px-8 text-body-lg": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
