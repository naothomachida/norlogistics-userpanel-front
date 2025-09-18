'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSolicitacoes } from '@/hooks/useApi'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import { Solicitacao } from '@/lib/api-types'
import { Layout } from '@/components/layout'
import { StatCard, ActionCard, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { SolicitacaoCard } from '@/components/business'
import { APP_TEXT } from '@/lib/text-constants'

interface SolicitacaoExtended extends Solicitacao {
  solicitante?: {
    usuario?: {
      nome: string
      email: string
    }
    cliente?: {
      nomeEmpresa: string
    }
  }
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { data: solicitacoesPendentesRaw, loading, refetch } = useSolicitacoes({ status: 'PENDENTE' })
  const solicitacoesPendentes = solicitacoesPendentesRaw as SolicitacaoExtended[]
  const [processando, setProcessando] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.role !== 'GESTOR') {
      router.push('/')
      return
    }
  }, [isAuthenticated, user, router])

  const handleAprovacao = async (solicitacaoId: string, aprovada: boolean, observacao?: string) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado')
      return
    }

    setProcessando(solicitacaoId)

    try {
      const result = await apiClient.aprovarSolicitacao(solicitacaoId, aprovada, user.id, observacao)

      if (result.error) {
        alert(`Erro: ${result.error}`)
      } else {
        alert(aprovada ? APP_TEXT.MESSAGES.SUCCESS.APPROVED : APP_TEXT.MESSAGES.SUCCESS.REJECTED)
        refetch()
      }
    } catch (error) {
      alert(APP_TEXT.MESSAGES.ERROR.CONNECTION)
    } finally {
      setProcessando(null)
    }
  }

  const handleAprovar = (solicitacaoId: string) => {
    if (confirm(APP_TEXT.MESSAGES.CONFIRMATION.APPROVE)) {
      handleAprovacao(solicitacaoId, true)
    }
  }

  const handleReprovar = (solicitacaoId: string) => {
    const observacao = prompt('Motivo da reprovação (opcional):')
    if (observacao !== null) {
      handleAprovacao(solicitacaoId, false, observacao || undefined)
    }
  }

  if (!isAuthenticated || user?.role !== 'GESTOR') {
    return <div>{APP_TEXT.DASHBOARD.PENDING_REQUESTS.LOADING}</div>
  }

  const quickActions = [
    {
      title: APP_TEXT.DASHBOARD.QUICK_ACTIONS.MANAGE_USERS.TITLE,
      description: APP_TEXT.DASHBOARD.QUICK_ACTIONS.MANAGE_USERS.DESCRIPTION,
      href: '/admin/usuarios',
      icon: '👥',
      iconColor: 'bg-purple-500'
    },
    {
      title: APP_TEXT.DASHBOARD.QUICK_ACTIONS.MANAGE_CLIENTS.TITLE,
      description: APP_TEXT.DASHBOARD.QUICK_ACTIONS.MANAGE_CLIENTS.DESCRIPTION,
      href: '/admin/clientes',
      icon: '🏢',
      iconColor: 'bg-orange-500'
    },
    {
      title: APP_TEXT.DASHBOARD.QUICK_ACTIONS.REPORTS.TITLE,
      description: APP_TEXT.DASHBOARD.QUICK_ACTIONS.REPORTS.DESCRIPTION,
      href: '/dashboard/relatorios',
      icon: '📊',
      iconColor: 'bg-green-500'
    },
    {
      title: APP_TEXT.DASHBOARD.QUICK_ACTIONS.ROUTE_CALCULATOR.TITLE,
      description: APP_TEXT.DASHBOARD.QUICK_ACTIONS.ROUTE_CALCULATOR.DESCRIPTION,
      href: '/calcular-rotas',
      icon: '🗺️',
      iconColor: 'bg-blue-500'
    }
  ]

  return (
    <Layout
      title={APP_TEXT.DASHBOARD.TITLE}
      description={APP_TEXT.DASHBOARD.WELCOME(user.nome) + ' ' + APP_TEXT.DASHBOARD.DESCRIPTION}
    >
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={APP_TEXT.DASHBOARD.STATS.PENDING_APPROVALS}
            value={solicitacoesPendentes?.length || 0}
            icon="⏳"
            iconColor="yellow"
          />
          <StatCard
            title={APP_TEXT.DASHBOARD.STATS.APPROVED_TODAY}
            value={0}
            icon="✓"
            iconColor="green"
          />
          <StatCard
            title={APP_TEXT.DASHBOARD.STATS.REJECTED_TODAY}
            value={0}
            icon="✗"
            iconColor="red"
          />
          <StatCard
            title={APP_TEXT.DASHBOARD.STATS.TOTAL_USERS}
            value="-"
            icon="👥"
            iconColor="blue"
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {APP_TEXT.DASHBOARD.QUICK_ACTIONS.TITLE}
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

        {/* Pending Requests */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{APP_TEXT.DASHBOARD.PENDING_REQUESTS.TITLE}</CardTitle>
              <CardDescription>
                {APP_TEXT.DASHBOARD.PENDING_REQUESTS.DESCRIPTION(solicitacoesPendentes?.length || 0)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="px-6 py-8 text-center">
                  <div className="text-gray-500">{APP_TEXT.DASHBOARD.PENDING_REQUESTS.LOADING}</div>
                </div>
              ) : !solicitacoesPendentes || solicitacoesPendentes.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <div className="text-gray-500">{APP_TEXT.DASHBOARD.PENDING_REQUESTS.NO_REQUESTS}</div>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  {solicitacoesPendentes.map((solicitacao) => (
                    <SolicitacaoCard
                      key={solicitacao.id}
                      solicitacao={solicitacao}
                      onApprove={handleAprovar}
                      onReject={handleReprovar}
                      processing={processando === solicitacao.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}