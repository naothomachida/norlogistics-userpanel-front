'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { ChevronDown, LogOut } from 'lucide-react'

export function UserDropdown({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const trigger = (
    <Button
      variant="ghost"
      className={cn(
        "flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg transition-all duration-200 group",
        isCollapsed ? "w-full h-10 p-0 justify-center" : "space-x-2 px-3 py-2 h-9"
      )}
    >
      <UserAvatar name={user.nome} size="sm" />
      {!isCollapsed && (
        <>
          <div className="text-left flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors leading-tight truncate">
              {user.nome}
            </div>
            <div className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors leading-tight truncate">
              {user.email}
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-all duration-200 text-gray-400 group-hover:text-gray-600 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </>
      )}
    </Button>
  )

  return (
    <div className="flex items-center space-x-4">
      {/* User Dropdown */}
      <DropdownMenu
        trigger={trigger}
        open={isOpen}
        onOpenChange={setIsOpen}
        align="end"
      >
        <DropdownMenuLabel>
          <div className="text-sm font-medium text-gray-900">
            {user.nome}
          </div>
          <div className="text-sm text-gray-500">
            {user.email}
          </div>
          <div className="mt-3">
            <Badge variant={user.role.toLowerCase() as "gestor" | "solicitante" | "transportador" | "motorista"} size="sm">
              {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
            </Badge>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          variant="destructive"
          className="flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair do Sistema</span>
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  )
}