'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSolicitacoes } from '@/hooks/useApi'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import { Solicitacao } from '@/lib/api-types'
import Layout from '@/components/Layout'

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
        alert(aprovada ? 'Solicitação aprovada com sucesso!' : 'Solicitação reprovada com sucesso!')
        refetch() // Refresh the list
      }
    } catch (error) {
      alert('Erro de conexão')
    } finally {
      setProcessando(null)
    }
  }

  const handleAprovar = (solicitacaoId: string) => {
    if (confirm('Tem certeza que deseja aprovar esta solicitação?')) {
      handleAprovacao(solicitacaoId, true)
    }
  }

  const handleReprovar = (solicitacaoId: string) => {
    const observacao = prompt('Motivo da reprovação (opcional):')
    if (observacao !== null) { // null significa que cancelou
      handleAprovacao(solicitacaoId, false, observacao || undefined)
    }
  }

  if (!isAuthenticated || user?.role !== 'GESTOR') {
    return <div>Carregando...</div>
  }

  return (
    <Layout
      title="Dashboard"
      description={`Bem-vindo, ${user.nome}! Gerencie aprovações e usuários.`}
    >
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">⏳</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pendentes de Aprovação
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {solicitacoesPendentes.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Aprovadas Hoje
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">✗</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Reprovadas Hoje
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Usuários
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      -
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/admin/usuarios"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">👥</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Gerenciar Usuários</p>
                <p className="text-sm text-gray-500">Cadastrar e editar usuários</p>
              </div>
            </a>

            <a
              href="/admin/clientes"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">🏢</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Gerenciar Clientes</p>
                <p className="text-sm text-gray-500">Cadastrar empresas e centros de custo</p>
              </div>
            </a>

            <a
              href="/dashboard/relatorios"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">📊</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Relatórios</p>
                <p className="text-sm text-gray-500">Visualizar relatórios e estatísticas</p>
              </div>
            </a>

            <a
              href="/calcular-rotas"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">🗺️</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Calculadora de Rotas</p>
                <p className="text-sm text-gray-500">Compare rotas e custos logísticos</p>
              </div>
            </a>
          </div>
        </div>

        {/* Solicitações Pendentes */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Solicitações Pendentes de Aprovação
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {solicitacoesPendentes.length} solicitação(ões) aguardando sua aprovação
              </p>
            </div>

            {loading ? (
              <div className="px-4 py-5 text-center">
                <div className="text-gray-500">Carregando...</div>
              </div>
            ) : solicitacoesPendentes.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <div className="text-gray-500">Nenhuma solicitação pendente</div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {solicitacoesPendentes.map((solicitacao) => (
                    <li key={solicitacao.id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {solicitacao.numeroOrdem}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {solicitacao.solicitante?.cliente?.nomeEmpresa || 'Cliente não informado'}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                Solicitante: {solicitacao.solicitante?.usuario?.nome || 'Não informado'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex text-sm text-gray-500">
                              <span className="flex-shrink-0 mr-2">📍</span>
                              <span className="truncate">
                                {solicitacao.pontoColeta} → {solicitacao.pontoEntrega}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <span className="flex-shrink-0 mr-2">💰</span>
                              <span>R$ {solicitacao.valorTotal.toFixed(2)}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAprovar(solicitacao.id)}
                            disabled={processando === solicitacao.id}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            {processando === solicitacao.id ? '...' : 'Aprovar'}
                          </button>
                          <button
                            onClick={() => handleReprovar(solicitacao.id)}
                            disabled={processando === solicitacao.id}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            {processando === solicitacao.id ? '...' : 'Reprovar'}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}