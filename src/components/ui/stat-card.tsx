import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Card } from "./card"

const statCardVariants = cva(
  "p-5",
  {
    variants: {
      variant: {
        default: "",
        colored: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconVariants = cva(
  "w-8 h-8 rounded-md flex items-center justify-center text-white text-sm",
  {
    variants: {
      color: {
        blue: "bg-blue-500",
        green: "bg-green-500",
        yellow: "bg-yellow-500",
        red: "bg-red-500",
        purple: "bg-purple-500",
        orange: "bg-orange-500",
        gray: "bg-gray-500",
      },
    },
    defaultVariants: {
      color: "blue",
    },
  }
)

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string
  value: string | number
  icon: string
  iconColor?: VariantProps<typeof iconVariants>["color"]
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({
    className,
    variant,
    title,
    value,
    icon,
    iconColor = "blue",
    description,
    trend,
    ...props
  }, ref) => (
    <Card
      ref={ref}
      className={cn("bg-white overflow-hidden shadow rounded-lg", className)}
      padding="none"
      {...props}
    >
      <div className={cn(statCardVariants({ variant }))}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={cn(iconVariants({ color: iconColor }))}>
              <span>{icon}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-lg font-medium text-gray-900">
                  {value}
                </div>
                {trend && (
                  <div className={cn(
                    "ml-2 flex items-baseline text-sm font-semibold",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    <span className="sr-only">
                      {trend.isPositive ? "Increased" : "Decreased"} by
                    </span>
                    {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                  </div>
                )}
              </dd>
              {description && (
                <dd className="text-xs text-gray-400 mt-1">
                  {description}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </Card>
  )
)
StatCard.displayName = "StatCard"

export { StatCard, statCardVariants }