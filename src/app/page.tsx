'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Layout } from '@/components/layout'
import { StatCard, ActionCard } from '@/components/ui'

export default function Home() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return <div>Redirecionando para login...</div>
  }

  // Quick actions based on user role
  const getQuickActions = () => {
    const actions = []

    if (user?.role === 'GESTOR') {
      actions.push(
        {
          title: 'Dashboard Gestor',
          description: 'Aprovações e relatórios',
          href: '/dashboard',
          icon: '📈',
          iconColor: 'bg-blue-500'
        },
        {
          title: 'Gerenciar Usuários',
          description: 'Cadastrar e editar usuários',
          href: '/admin/usuarios',
          icon: '👥',
          iconColor: 'bg-purple-500'
        },
        {
          title: 'Gerenciar Clientes',
          description: 'Cadastrar e editar clientes',
          href: '/admin/clientes',
          icon: '🏢',
          iconColor: 'bg-orange-500'
        },
        {
          title: 'Calcular Rotas',
          description: 'Calculadora de rotas e custos',
          href: '/calcular-rotas',
          icon: '🗺️',
          iconColor: 'bg-green-500'
        }
      )
    }

    if (user?.role === 'SOLICITANTE') {
      actions.push(
        {
          title: 'Solicitar Coleta',
          description: 'Nova solicitação de coleta',
          href: '/solicitar-coleta',
          icon: '📎',
          iconColor: 'bg-blue-500'
        }
      )
    }

    if (user?.role === 'TRANSPORTADOR') {
      actions.push(
        {
          title: 'Operações',
          description: 'Gerenciar fretes e atribuições',
          href: '/operacoes',
          icon: '🚛',
          iconColor: 'bg-orange-500'
        },
        {
          title: 'Calcular Rotas',
          description: 'Calculadora de rotas e custos',
          href: '/calcular-rotas',
          icon: '🗺️',
          iconColor: 'bg-green-500'
        },
        {
          title: 'Registrar Viagem',
          description: 'Registrar dados de viagens realizadas',
          href: '/registrar-viagem',
          icon: '📝',
          iconColor: 'bg-indigo-500'
        }
      )
    }

    if (user?.role === 'MOTORISTA') {
      actions.push(
        {
          title: 'Minhas Viagens',
          description: 'Gerenciar viagens e custos',
          href: '/motorista',
          icon: '🗺️',
          iconColor: 'bg-red-500'
        },
        {
          title: 'Registrar Viagem',
          description: 'Registrar dados de viagens realizadas',
          href: '/registrar-viagem',
          icon: '📝',
          iconColor: 'bg-indigo-500'
        }
      )
    }

    return actions
  }

  const quickActions = getQuickActions()

  return (
    <Layout
      title={`Bem-vindo, ${user?.nome}!`}
      description="Painel principal do sistema de logística"
    >
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* User Role Badge */}
        <div className="mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {user?.role === 'GESTOR' && '📈 Gestor'}
            {user?.role === 'SOLICITANTE' && '📋 Solicitante'}
            {user?.role === 'TRANSPORTADOR' && '🚛 Transportador'}
            {user?.role === 'MOTORISTA' && '🚗 Motorista'}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Status"
            value="Ativo"
            icon="✓"
            iconColor="green"
          />
          <StatCard
            title="Sessão"
            value="Conectado"
            icon="🔗"
            iconColor="blue"
          />
          <StatCard
            title="Perfil"
            value={user?.role || 'N/A'}
            icon="👤"
            iconColor="purple"
          />
          <StatCard
            title="Sistema"
            value="Online"
            icon="🟢"
            iconColor="green"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <ActionCard
                key={action.href}
                title={action.title}
                description={action.description}
                href={action.href}
                icon={action.icon}
                iconColor={action.iconColor}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
