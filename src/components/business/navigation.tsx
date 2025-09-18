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
}

export function Navigation({
  className,
  orientation = 'horizontal',
  showIcons = true
}: NavigationProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  // Filter menu items based on user role
  const visibleMenuItems = MENU_ITEMS.filter(item =>
    user.role && (item.roles as readonly string[]).includes(user.role)
  )

  const linkClass = (href: string) => cn(
    "transition-colors duration-200 flex items-center space-x-2",
    orientation === 'horizontal'
      ? "px-4 py-2 rounded-md text-purple-300 hover:text-purple-100 hover:bg-gray-800"
      : "block px-3 py-2 rounded-md text-purple-300 hover:text-purple-100 hover:bg-gray-800",
    pathname === href && "bg-gray-800 text-purple-100"
  )

  return (
    <nav className={cn(
      orientation === 'horizontal'
        ? "hidden md:flex space-x-1"
        : "space-y-1",
      className
    )}>
      {visibleMenuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={linkClass(item.href)}
        >
          {showIcons && item.icon && <span>{item.icon}</span>}
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  )
}

export function MobileNavigation() {
  return (
    <div className="md:hidden">
      <Navigation
        orientation="vertical"
        className="pb-4"
      />
    </div>
  )
}