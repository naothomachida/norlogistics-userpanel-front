'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSolicitacoes } from '@/hooks/useApi'
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import { Solicitacao } from '@/lib/api-types'
import { Layout } from '@/components/layout'
import { StatCard, ActionCard, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { SolicitacaoCard } from '@/components/business'
import { ValueChart, QuantityChart } from '@/components/charts'
import { RequestsCard, PeriodFilter } from '@/components/dashboard'
import { APP_TEXT } from '@/lib/text-constants'

interface SolicitacaoExtended extends Solicitacao {
  solicitante?: {
    usuario?: {
      nome: string
      email: string
    }
    cliente?: {
      id: string
      nomeEmpresa: string
    }
    centroCusto?: {
      id: string
      nome: string
      codigo: string
    }
  }
}

export default function DashboardClient() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { data: solicitacoesPendentesRaw, loading, refetch } = useSolicitacoes({ status: 'PENDENTE' })
  const solicitacoesPendentes = solicitacoesPendentesRaw as SolicitacaoExtended[]
  const [processando, setProcessando] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'month' | 'year'>('month')

  // Hook para dados de analytics
  const {
    data: analyticsData,
    loading: analyticsLoading,
    error: analyticsError
  } = useDashboardAnalytics(
    selectedPeriod,
    user?.role === 'GESTOR' ? user?.gestor?.id : undefined,
    user?.role === 'SOLICITANTE' ? user?.solicitante?.id : undefined
  )

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleApprovar = async (solicitacaoId: string) => {
    setProcessando(solicitacaoId)
    try {
      const response = await apiClient.updateSolicitacao(solicitacaoId, { status: 'APROVADA' })
      if (response.data) {
        await refetch()
      }
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error)
    } finally {
      setProcessando(null)
    }
  }

  const handleReprovar = async (solicitacaoId: string) => {
    setProcessando(solicitacaoId)
    try {
      const response = await apiClient.updateSolicitacao(solicitacaoId, { status: 'REPROVADA' })
      if (response.data) {
        await refetch()
      }
    } catch (error) {
      console.error('Erro ao reprovar solicitação:', error)
    } finally {
      setProcessando(null)
    }
  }

  if (!isAuthenticated) {
    return <div>Carregando...</div>
  }

  const getDashboardContent = () => {
    if (user?.role === 'GESTOR') {
      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      }

      const pendentesStats = analyticsData?.currentPeriodStats.find(s => s.status === 'PENDENTE')
      const aprovadasStats = analyticsData?.currentPeriodStats.find(s => s.status === 'APROVADA')
      const totalValue = analyticsData?.summary.totalValue || 0
      const totalCount = analyticsData?.summary.totalCount || 0

      return (
        <div className="space-y-6">
          {/* Filtro de Período */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h2>
            <PeriodFilter
              currentPeriod={selectedPeriod}
              onChange={setSelectedPeriod}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Solicitações Pendentes"
              value={pendentesStats?.count || 0}
              icon="📋"
              description={analyticsLoading ? 'Carregando...' : `${formatCurrency(pendentesStats?.value || 0)} em valores`}
              color="yellow"
            />
            <StatCard
              title="Aprovadas no Período"
              value={aprovadasStats?.count || 0}
              icon="✅"
              description={formatCurrency(aprovadasStats?.value || 0)}
              color="green"
            />
            <StatCard
              title="Total Solicitações"
              value={totalCount}
              icon="📊"
              description={`${formatCurrency(totalValue)} no período`}
              color="blue"
            />
            <StatCard
              title="Em Andamento"
              value={analyticsData?.inProgressRequests?.length || 0}
              icon="🚛"
              description="Solicitações em execução"
              color="purple"
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ValueChart
              data={analyticsData?.chartData || []}
              period={selectedPeriod}
              type="bar"
              title={`Valores das Solicitações - ${selectedPeriod === 'day' ? 'Hoje' : selectedPeriod === 'month' ? 'Este Mês' : 'Este Ano'}`}
            />
            <QuantityChart
              data={analyticsData?.chartData || []}
              period={selectedPeriod}
              type="line"
              title={`Quantidade de Solicitações - ${selectedPeriod === 'day' ? 'Hoje' : selectedPeriod === 'month' ? 'Este Mês' : 'Este Ano'}`}
            />
          </div>

          {/* Gráfico de Pizza - Apenas para mês e ano */}
          {selectedPeriod !== 'day' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <QuantityChart
                data={analyticsData?.chartData || []}
                period={selectedPeriod}
                type="pie"
                title="Distribuição por Status"
              />
              <div className="lg:col-span-2">
                <ValueChart
                  data={analyticsData?.chartData || []}
                  period={selectedPeriod}
                  type="line"
                  title="Evolução dos Valores"
                />
              </div>
            </div>
          )}

          {/* Cards de Solicitações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RequestsCard
              title="Solicitações Pendentes"
              requests={analyticsData?.pendingRequests || []}
              type="pending"
            />
            <RequestsCard
              title="Solicitações em Andamento"
              requests={analyticsData?.inProgressRequests || []}
              type="inProgress"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              title="Aprovar Solicitações"
              description="Gerencie solicitações pendentes"
              icon="📋"
              href="/operacoes"
            />
            <ActionCard
              title="Relatórios"
              description="Visualize relatórios de transporte"
              icon="📊"
              href="/relatorios"
            />
            <ActionCard
              title="Configurações"
              description="Gerencie usuários e configurações"
              icon="⚙️"
              href="/admin"
            />
          </div>
        </div>
      )
    }

    // Dashboard para outros tipos de usuário (SOLICITANTE, etc.)
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }

    const pendentesStats = analyticsData?.currentPeriodStats.find(s => s.status === 'PENDENTE')
    const aprovadasStats = analyticsData?.currentPeriodStats.find(s => s.status === 'APROVADA')
    const totalValue = analyticsData?.summary.totalValue || 0
    const totalCount = analyticsData?.summary.totalCount || 0

    return (
      <div className="space-y-6">
        {/* Filtro de Período */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Minhas Estatísticas</h2>
          <PeriodFilter
            currentPeriod={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Minhas Solicitações"
            value={totalCount}
            icon="📋"
            description={`${formatCurrency(totalValue)} no período`}
            color="blue"
          />
          <StatCard
            title="Pendentes"
            value={pendentesStats?.count || 0}
            icon="⏳"
            description={formatCurrency(pendentesStats?.value || 0)}
            color="yellow"
          />
          <StatCard
            title="Aprovadas"
            value={aprovadasStats?.count || 0}
            icon="✅"
            description={formatCurrency(aprovadasStats?.value || 0)}
            color="green"
          />
          <StatCard
            title="Em Andamento"
            value={analyticsData?.inProgressRequests?.length || 0}
            icon="🚛"
            description="Solicitações em execução"
            color="purple"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            title="Nova Solicitação"
            description="Solicite um novo transporte"
            icon="🚛"
            href="/solicitar-coleta"
          />
          <ActionCard
            title="Minhas Solicitações"
            description="Acompanhe suas solicitações"
            icon="📋"
            href="/minhas-solicitacoes"
          />
          <ActionCard
            title="Calculadora de Rotas"
            description="Calcule custos de transporte"
            icon="🗺️"
            href="/calcular-rotas"
          />
        </div>

        {/* Gráficos Simplificados */}
        {analyticsData && analyticsData.chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ValueChart
              data={analyticsData.chartData}
              period={selectedPeriod}
              type="bar"
              title="Valores das Minhas Solicitações"
            />
            <QuantityChart
              data={analyticsData.chartData}
              period={selectedPeriod}
              type="pie"
              title="Status das Solicitações"
            />
          </div>
        )}

        {/* Cards de Solicitações */}
        {analyticsData && (analyticsData.pendingRequests.length > 0 || analyticsData.inProgressRequests.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analyticsData.pendingRequests.length > 0 && (
              <RequestsCard
                title="Minhas Solicitações Pendentes"
                requests={analyticsData.pendingRequests}
                type="pending"
                maxItems={3}
              />
            )}
            {analyticsData.inProgressRequests.length > 0 && (
              <RequestsCard
                title="Minhas Solicitações em Andamento"
                requests={analyticsData.inProgressRequests}
                type="inProgress"
                maxItems={3}
              />
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Layout
      title={APP_TEXT.DASHBOARD.TITLE}
      description={APP_TEXT.DASHBOARD.DESCRIPTION}
    >
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {getDashboardContent()}
      </div>
    </Layout>
  )
}