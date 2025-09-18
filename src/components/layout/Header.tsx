'use client'

import { Logo } from '@/components/business/logo'
import { Navigation, MobileNavigation } from '@/components/business/navigation'
import { UserDropdown } from '@/components/business/user-dropdown'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className={cn("bg-black shadow-md", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <Navigation />

          {/* User Info & Actions */}
          <div className="flex items-center">
            {user && <UserDropdown />}
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </header>
  )
}