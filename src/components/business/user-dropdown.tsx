'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/lib/constants'
import { UserAvatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { ChevronDown, LogOut } from 'lucide-react'

export function UserDropdown() {
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
      className="flex items-center space-x-3 text-purple-300 hover:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md px-3 py-2"
    >
      <UserAvatar name={user.nome} size="sm" />
      <div className="hidden sm:block text-left">
        <div className="text-sm font-medium text-purple-100">
          {user.nome}
        </div>
        <div className="text-xs text-purple-400">
          {user.email}
        </div>
      </div>
      <ChevronDown
        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </Button>
  )

  return (
    <div className="flex items-center space-x-4">
      {/* Role Badge */}
      <Badge variant={user.role.toLowerCase() as "gestor" | "solicitante" | "transportador" | "motorista"}>
        {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
      </Badge>

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
          <div className="mt-1">
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