'use client'

import { UserDropdown } from '@/components/business/user-dropdown'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS } from '@/lib/constants'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className={cn(
      "bg-white shadow-sm border-b border-gray-200 relative z-10",
      className
    )}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center py-3">
          {/* User Info & Actions */}
          <div className="flex items-center space-x-3">
            {user && (
              <>
                {/* User Role Badge */}
                <Badge variant={user.role.toLowerCase() as "gestor" | "solicitante" | "transportador" | "motorista"}>
                  {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                </Badge>

                {/* Notifications */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 h-8 w-8 p-0"
                  >
                    <Bell className="w-4 h-4" />
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      3
                    </Badge>
                  </Button>
                </div>

                {/* Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 h-8 w-8 p-0"
                >
                  <Settings className="w-4 h-4" />
                </Button>

                {/* Vertical separator */}
                <div className="h-4 w-px bg-gray-300 mx-1"></div>

                {/* User dropdown */}
                <UserDropdown />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}