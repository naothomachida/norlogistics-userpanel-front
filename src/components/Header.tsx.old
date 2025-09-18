'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface MenuItem {
  name: string
  href: string
  roles: string[] // roles que podem acessar este item
  icon?: string
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    roles: ['GESTOR', 'TRANSPORTADOR', 'MOTORISTA'],
    icon: '📊'
  },
  {
    name: 'Calcular Rotas',
    href: '/calcular-rotas',
    roles: ['GESTOR', 'TRANSPORTADOR'],
    icon: '🗺️'
  },
  {
    name: 'Solicitar Coleta',
    href: '/solicitar-coleta',
    roles: ['GESTOR', 'SOLICITANTE', 'TRANSPORTADOR'],
    icon: '📦'
  },
  {
    name: 'Registrar Viagem',
    href: '/registrar-viagem',
    roles: ['GESTOR', 'TRANSPORTADOR', 'MOTORISTA'],
    icon: '🚛'
  },
  {
    name: 'Operações',
    href: '/operacoes',
    roles: ['GESTOR', 'TRANSPORTADOR'],
    icon: '⚙️'
  },
  {
    name: 'Motorista',
    href: '/motorista',
    roles: ['MOTORISTA'],
    icon: '👨‍💼'
  },
  {
    name: 'Admin - Usuários',
    href: '/admin/usuarios',
    roles: ['GESTOR'],
    icon: '👥'
  },
  {
    name: 'Admin - Clientes',
    href: '/admin/clientes',
    roles: ['GESTOR'],
    icon: '🏢'
  }
]

const roleLabels: Record<string, string> = {
  'GESTOR': 'Gestor',
  'SOLICITANTE': 'Solicitante',
  'TRANSPORTADOR': 'Transportador',
  'MOTORISTA': 'Motorista'
}

const roleColors: Record<string, string> = {
  'GESTOR': 'bg-red-100 text-red-800',
  'SOLICITANTE': 'bg-yellow-100 text-yellow-800',
  'TRANSPORTADOR': 'bg-blue-100 text-blue-800',
  'MOTORISTA': 'bg-green-100 text-green-800'
}

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  // Filtrar itens do menu baseado no role do usuário
  const visibleMenuItems = menuItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  )

  return (
    <header className="bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-purple-400">
                  Nor Logistics
                </h1>
                <p className="text-purple-300 text-sm">Sistema de Gestão</p>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-1">
            {visibleMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-md text-purple-300 hover:text-purple-100 hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Info & Dropdown */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                {/* Role Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                  {roleLabels[user.role] || user.role}
                </span>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 text-purple-300 hover:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md px-3 py-2"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-purple-100">
                        {user.nome}
                      </div>
                      <div className="text-xs text-purple-400">
                        {user.email}
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <div className="px-4 py-3 border-b">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                            {roleLabels[user.role] || user.role}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900"
                      >
                        <div className="flex items-center space-x-2">
                          <span>🚪</span>
                          <span>Sair do Sistema</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <nav className="pb-4 space-y-1">
            {visibleMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-purple-300 hover:text-purple-100 hover:bg-gray-800 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}