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
      return (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Solicitações Pendentes"
              value={solicitacoesPendentes?.length || 0}
              icon="📋"
              description={loading ? 'Carregando...' : `${solicitacoesPendentes?.length || 0} aguardando aprovação`}
              color="yellow"
            />
            <StatCard
              title="Aprovadas Hoje"
              value={0}
              icon="✅"
              description="0 aprovações realizadas"
              color="green"
            />
            <StatCard
              title="Total Solicitações"
              value="..."
              icon="📊"
              description="Este mês"
              color="blue"
            />
            <StatCard
              title="Economia Estimada"
              value="R$ ..."
              icon="💰"
              description="Comparado ao mês anterior"
              color="purple"
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

          {/* Solicitações Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Pendentes de Aprovação</CardTitle>
              <CardDescription>
                Analise e aprove/reprove as solicitações de transporte
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Carregando solicitações...</div>
              ) : solicitacoesPendentes?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Não há solicitações pendentes
                </div>
              ) : (
                <div className="space-y-4">
                  {solicitacoesPendentes?.map((solicitacao) => (
                    <SolicitacaoCard
                      key={solicitacao.id}
                      solicitacao={solicitacao}
                      onApprove={() => handleApprovar(solicitacao.id)}
                      onReject={() => handleReprovar(solicitacao.id)}
                      processing={processando === solicitacao.id}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    // Dashboard padrão para outros tipos de usuário
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            title="Nova Solicitação"
            description="Solicite um novo transporte"
            icon="🚛"
            href="/nova-solicitacao"
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