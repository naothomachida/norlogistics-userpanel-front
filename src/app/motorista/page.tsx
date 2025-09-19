'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSolicitacoes } from '@/hooks/useApi'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import { Layout } from '@/components/layout'
import { Solicitacao } from '@/lib/api-types'

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

interface CustoExtraForm {
  tipo: string
  valor: string
  observacao: string
}

export default function MotoristaPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState('todas')
  
  // Buscar solicitações do motorista
  const { data: solicitacoes, loading, error, refetch } = useSolicitacoes({
    motoristaId: user?.id
  })

  const [showCustoModal, setShowCustoModal] = useState(false)
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<string | null>(null)
  const [submittingCusto, setSubmittingCusto] = useState(false)
  const [custoForm, setCustoForm] = useState<CustoExtraForm>({
    tipo: '',
    valor: '',
    observacao: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, user, router])

  const handleAdicionarCusto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSolicitacao) return

    setSubmittingCusto(true)

    try {
      const result = await apiClient.createCustoExtra({
        solicitacaoId: selectedSolicitacao,
        tipo: custoForm.tipo,
        valor: parseFloat(custoForm.valor),
        observacao: custoForm.observacao
      })

      if (result.error) {
        alert(`Erro: ${result.error}`)
      } else {
        alert('Custo extra adicionado com sucesso!')
        setShowCustoModal(false)
        setCustoForm({ tipo: '', valor: '', observacao: '' })
        setSelectedSolicitacao(null)
        refetch()
      }
    } catch (error) {
      alert('Erro de conexão')
    } finally {
      setSubmittingCusto(false)
    }
  }

  if (!isAuthenticated) {
    return <div>Carregando...</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Carregando suas viagens...</div>
      </div>
    )
  }

  const filteredSolicitacoes = solicitacoes.filter(s => {
    if (selectedFilter === 'em-execucao') return s.status === 'EM_EXECUCAO'
    if (selectedFilter === 'finalizadas') return s.status === 'FINALIZADA'
    return true
  })

  const solicitacoesEmExecucao = solicitacoes.filter(s => s.status === 'EM_EXECUCAO')
  const solicitacoesFinalizadas = solicitacoes.filter(s => s.status === 'FINALIZADA')

  return (
    <Layout
      title="Dashboard do Motorista"
      description={`Bem-vindo, ${user?.nome || 'Motorista'}! Gerencie suas viagens e custos.`}
    >
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">🚛</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Em Execução
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {solicitacoesEmExecucao.length}
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
                      Finalizadas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {solicitacoesFinalizadas.length}
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
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">📍</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Viagens
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {solicitacoes.length}
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
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">🛣️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      KM Rodados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {solicitacoes.reduce((acc, s) => acc + s.kmTotal, 0)} km
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => setSelectedFilter('todas')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              selectedFilter === 'todas'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Todas as Viagens
          </button>
          <button
            onClick={() => setSelectedFilter('em-execucao')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              selectedFilter === 'em-execucao'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Em Execução ({solicitacoesEmExecucao.length})
          </button>
          <button
            onClick={() => setSelectedFilter('finalizadas')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              selectedFilter === 'finalizadas'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Finalizadas ({solicitacoesFinalizadas.length})
          </button>
        </div>

        {/* Lista de Viagens */}
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Suas Viagens
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {filteredSolicitacoes.length} viagem(ens) encontrada(s)
            </p>
          </div>

          {filteredSolicitacoes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Nenhuma viagem encontrada</div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {filteredSolicitacoes.map((solicitacao: SolicitacaoExtended) => (
                  <li key={solicitacao.id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              solicitacao.status === 'EM_EXECUCAO' 
                                ? 'bg-blue-100 text-blue-800'
                                : solicitacao.status === 'FINALIZADA'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {solicitacao.numeroOrdem}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {solicitacao.solicitante?.cliente?.nomeEmpresa || 'Cliente não identificado'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              Solicitante: {solicitacao.solicitante?.usuario?.nome || 'Não informado'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="flex-shrink-0 mr-2">📍</span>
                            <span className="truncate">
                              {solicitacao.pontoColeta} → {solicitacao.pontoEntrega}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span className="flex-shrink-0 mr-2">🛣️</span>
                            <span>{solicitacao.kmTotal} km</span>
                            <span className="mx-2">•</span>
                            <span className="flex-shrink-0 mr-1">💰</span>
                            <span>R$ {solicitacao.valorTotal.toFixed(2)}</span>
                            {solicitacao.valorMotorista && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-green-600">Seu valor: R$ {solicitacao.valorMotorista.toFixed(2)}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span className="flex-shrink-0 mr-2">📅</span>
                            <span>
                              Coleta: {new Date(solicitacao.dataColeta).toLocaleDateString('pt-BR')} às {solicitacao.horaColeta}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          solicitacao.status === 'EM_EXECUCAO' 
                            ? 'bg-blue-100 text-blue-800'
                            : solicitacao.status === 'FINALIZADA'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {solicitacao.status === 'EM_EXECUCAO' ? 'Em Execução' : 
                           solicitacao.status === 'FINALIZADA' ? 'Finalizada' : solicitacao.status}
                        </span>
                        {solicitacao.status === 'EM_EXECUCAO' && (
                          <button
                            onClick={() => {
                              setSelectedSolicitacao(solicitacao.id)
                              setShowCustoModal(true)
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                          >
                            + Custo Extra
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Detalhes do Material */}
                    <div className="mt-3 bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Detalhes da Carga:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Material:</span> {solicitacao.descricaoMaterial}
                        </div>
                        <div>
                          <span className="font-medium">Volumes:</span> {solicitacao.quantidadeVolumes}
                        </div>
                        <div>
                          <span className="font-medium">Peso:</span> {solicitacao.pesoTotal} kg
                        </div>
                        <div>
                          <span className="font-medium">Veículo:</span> {solicitacao.tipoVeiculo}
                        </div>
                      </div>
                      {solicitacao.observacoes && (
                        <div className="mt-2">
                          <span className="font-medium text-sm text-gray-900">Observações:</span>
                          <p className="text-sm text-gray-600">{solicitacao.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Custo Extra */}
        {showCustoModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Adicionar Custo Extra
                </h3>

                <form onSubmit={handleAdicionarCusto} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Custo *
                    </label>
                    <select
                      required
                      value={custoForm.tipo}
                      onChange={(e) => setCustoForm({...custoForm, tipo: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="ESPERA">Hora de Espera</option>
                      <option value="PERNOITE">Pernoite (Adicional Noturno)</option>
                      <option value="ESTACIONAMENTO">Estacionamento</option>
                      <option value="ABASTECIMENTO">Abastecimento</option>
                      <option value="MANUTENCAO">Manutenção</option>
                      <option value="OUTROS">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Valor (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={custoForm.valor}
                      onChange={(e) => setCustoForm({...custoForm, valor: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Observação
                    </label>
                    <textarea
                      rows={3}
                      value={custoForm.observacao}
                      onChange={(e) => setCustoForm({...custoForm, observacao: e.target.value})}
                      placeholder="Detalhe o motivo do custo extra..."
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustoModal(false)
                        setCustoForm({ tipo: '', valor: '', observacao: '' })
                        setSelectedSolicitacao(null)
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCusto}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50"
                    >
                      {submittingCusto ? 'Adicionando...' : 'Adicionar Custo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}