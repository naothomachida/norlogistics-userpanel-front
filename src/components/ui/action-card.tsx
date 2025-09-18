import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card } from "./card"

export interface ActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  href: string
  icon: string
  iconColor?: string
  disabled?: boolean
}

const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  ({
    className,
    title,
    description,
    href,
    icon,
    iconColor = "bg-purple-500",
    disabled = false,
    ...props
  }, ref) => (
    <Link
      href={disabled ? "#" : href}
      className={cn(
        "block",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <Card
        ref={ref}
        className={cn(
          "relative border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition-colors",
          disabled && "hover:border-gray-300",
          className
        )}
        padding="none"
        {...props}
      >
        <div className="flex-shrink-0">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-white",
            iconColor
          )}>
            <span>{icon}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="absolute inset-0" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </Card>
    </Link>
  )
)
ActionCard.displayName = "ActionCard"

export { ActionCard }