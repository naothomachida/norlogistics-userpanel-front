'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { SolicitacaoCard } from '@/components/business/solicitacao-card'
import { Badge } from '@/components/ui/badge'
import { APP_TEXT } from '@/lib/text-constants'
import { Package, AlertCircle } from 'lucide-react'

interface SolicitacaoExtended {
  id: string
  numeroOrdem: string
  pontoColeta: string
  pontoEntrega: string
  valorTotal: number
  createdAt: string
  status: string
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

export default function MinhasSolicitacoesPage() {
  const { user } = useAuth()
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoExtended[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      try {
        if (!user?.solicitanteId) {
          setError('Usuário não é um solicitante')
          return
        }

        const response = await fetch(`/api/solicitacoes?solicitanteId=${user.solicitanteId}`)
        if (!response.ok) {
          throw new Error('Erro ao carregar solicitações')
        }

        const data = await response.json()
        setSolicitacoes(data)
      } catch (err) {
        console.error('Erro ao buscar solicitações:', err)
        setError('Erro ao carregar suas solicitações')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchSolicitacoes()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando suas solicitações...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Group solicitations by status
  const groupedSolicitacoes = solicitacoes.reduce((acc, solicitacao) => {
    const status = solicitacao.status || 'PENDENTE'
    if (!acc[status]) {
      acc[status] = []
    }
    acc[status].push(solicitacao)
    return acc
  }, {} as Record<string, SolicitacaoExtended[]>)

  const statusOrder = ['PENDENTE', 'APROVADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'REPROVADA']
  const sortedStatuses = statusOrder.filter(status => groupedSolicitacoes[status]?.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Package className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Minhas Solicitações</h1>
          </div>
          <p className="text-gray-600">
            Acompanhe o status de todas as suas solicitações de coleta
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{solicitacoes.length}</div>
            <div className="text-sm text-gray-600">Total de Solicitações</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {groupedSolicitacoes['PENDENTE']?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {groupedSolicitacoes['APROVADA']?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Aprovadas</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {groupedSolicitacoes['EM_ANDAMENTO']?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Em Andamento</div>
          </div>
        </div>

        {/* Solicitations by Status */}
        {sortedStatuses.length > 0 ? (
          <div className="space-y-8">
            {sortedStatuses.map(status => (
              <div key={status} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={status.toLowerCase() as "pending" | "approved" | "rejected"}
                      size="sm"
                    >
                      {APP_TEXT.STATUS[status as keyof typeof APP_TEXT.STATUS] || status}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {groupedSolicitacoes[status].length} solicitação(ões)
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {groupedSolicitacoes[status].map(solicitacao => (
                    <SolicitacaoCard
                      key={solicitacao.id}
                      solicitacao={solicitacao}
                      showActions={false}
                      className="border border-gray-100"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma solicitação encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Você ainda não fez nenhuma solicitação de coleta.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}