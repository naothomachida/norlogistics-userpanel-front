import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "end"
  className?: string
}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ trigger, children, open, onOpenChange, align = "end", className }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const isControlled = open !== undefined
    const dropdownOpen = isControlled ? open : isOpen

    React.useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          if (isControlled && onOpenChange) {
            onOpenChange(false)
          } else {
            setIsOpen(false)
          }
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isControlled, onOpenChange])

    const handleTriggerClick = () => {
      if (isControlled && onOpenChange) {
        onOpenChange(!dropdownOpen)
      } else {
        setIsOpen(!isOpen)
      }
    }

    return (
      <div className="relative" ref={containerRef}>
        <div onClick={handleTriggerClick}>
          {trigger}
        </div>
        {dropdownOpen && (
          <div
            ref={ref}
            className={cn(
              "absolute top-full mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border",
              align === "start" ? "left-0" : "right-0",
              className
            )}
          >
            {children}
          </div>
        )}
      </div>
    )
  }
)
DropdownMenu.displayName = "DropdownMenu"

const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "destructive"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "block w-full text-left px-4 py-2 text-sm transition-colors",
      variant === "destructive"
        ? "text-red-700 hover:bg-red-50 hover:text-red-900"
        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-b border-gray-200 my-1", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-4 py-3 border-b", className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

export {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
}