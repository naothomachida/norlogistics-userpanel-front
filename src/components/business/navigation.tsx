'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { MENU_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface NavigationProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  showIcons?: boolean
  isCollapsed?: boolean
}

export function Navigation({
  className,
  orientation = 'horizontal',
  showIcons = true,
  isCollapsed = false
}: NavigationProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  // Filter menu items based on user role
  const visibleMenuItems = MENU_ITEMS.filter(item =>
    user.role && (item.roles as readonly string[]).includes(user.role)
  )

  // Function to check if a menu item should be highlighted
  const isActive = (href: string) => {
    // Special case: root path should highlight Dashboard
    if (pathname === '/' && href === '/dashboard') {
      return true
    }
    
    // Exact match
    if (pathname === href) {
      return true
    }
    
    // Parent route match - check if current path starts with menu href (but not root)
    if (href !== '/' && pathname.startsWith(href + '/')) {
      return true
    }
    
    return false
  }

  const linkClass = (href: string) => cn(
    "transition-all duration-200 flex flex-col items-center justify-center font-medium relative overflow-hidden group",
    orientation === 'horizontal'
      ? "px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-lg backdrop-blur-sm text-sm space-x-2"
      : isCollapsed
        ? "w-12 h-12 rounded-lg border border-slate-600/50 text-slate-400 hover:text-white hover:bg-slate-700/50 hover:border-slate-500"
        : "w-full p-4 rounded-lg border border-slate-600/50 text-slate-400 hover:text-white hover:bg-slate-700/50 hover:border-slate-500 min-h-[80px]",
    isActive(href) && orientation === 'vertical' && "bg-purple-600 text-white border-purple-500 shadow-lg",
    isActive(href) && orientation === 'horizontal' && "bg-slate-700/70 text-white shadow-lg ring-1 ring-purple-500/30"
  )

  return (
    <nav className={cn(
      orientation === 'horizontal'
        ? "hidden md:flex bg-slate-800/30 rounded-full px-1.5 py-0.5 backdrop-blur-sm border border-slate-700/50"
        : "space-y-0",
      className
    )}>
      {visibleMenuItems.map((item) => {
        const IconComponent = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.href)}
            title={isCollapsed ? item.name : undefined}
          >
            {showIcons && IconComponent && (
              <IconComponent className={cn(
                "w-6 h-6 mb-1",
                isCollapsed && "w-5 h-5 mb-0"
              )} />
            )}
            {!isCollapsed && (
              <span className="text-xs text-center leading-tight">
                {item.name}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export function MobileNavigation() {
  return (
    <div className="md:hidden border-t border-slate-700/50">
      <Navigation
        orientation="vertical"
        className="pb-4 pt-2"
      />
    </div>
  )
}