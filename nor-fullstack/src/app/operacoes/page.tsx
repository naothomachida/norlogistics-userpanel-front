'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface Solicitacao {
  id: string
  numeroOrdem: string
  solicitante: {
    usuario: {
      nome: string
    }
    cliente: {
      nomeEmpresa: string
    }
  }
  pontoColeta: string
  pontoEntrega: string
  valorTotal: number
  status: string
  motorista?: {
    usuario: {
      nome: string
    }
  }
  veiculo?: {
    placa: string
    modelo: string
  }
  createdAt: string
}

interface Motorista {
  id: string
  usuario: {
    id: string
    nome: string
  }
  tipo: string
}

interface Veiculo {
  id: string
  placa: string
  modelo: string
  tipo: string
}

export default function OperacoesPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [atribuindo, setAtribuindo] = useState<string | null>(null)
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    motoristaId: '',
    veiculoId: '',
    numeroCte: '',
    valorMotorista: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.role !== 'TRANSPORTADOR') {
      router.push('/')
      return
    }

    fetchData()
  }, [isAuthenticated, user, router])

  const fetchData = async () => {
    try {
      const [solicitacoesRes, motoristasRes, veiculosRes] = await Promise.all([
        fetch('/api/solicitacoes?status=APROVADA'),
        fetch(`/api/motoristas?transportadorId=${user?.id}`),
        fetch(`/api/veiculos?transportadorId=${user?.id}`)
      ])

      if (solicitacoesRes.ok) {
        const solicitacoesData = await solicitacoesRes.json()
        setSolicitacoes(solicitacoesData)
      }

      if (motoristasRes.ok) {
        const motoristasData = await motoristasRes.json()
        setMotoristas(motoristasData)
      }

      if (veiculosRes.ok) {
        const veiculosData = await veiculosRes.json()
        setVeiculos(veiculosData)
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAtribuir = async (solicitacaoId: string) => {
    if (!formData.motoristaId || !formData.veiculoId) {
      alert('Selecione motorista e veículo')
      return
    }

    setAtribuindo(solicitacaoId)

    try {
      const response = await fetch(`/api/solicitacoes/${solicitacaoId}/atribuir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transportadorId: user?.id,
          motoristaId: formData.motoristaId,
          veiculoId: formData.veiculoId,
          numeroCte: formData.numeroCte,
          valorMotorista: formData.valorMotorista ? parseFloat(formData.valorMotorista) : null
        }),
      })

      if (response.ok) {
        alert('Solicitação atribuída com sucesso!')
        setSelectedSolicitacao(null)
        setFormData({
          motoristaId: '',
          veiculoId: '',
          numeroCte: '',
          valorMotorista: ''
        })
        fetchData() // Recarregar dados
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      alert('Erro de conexão')
    } finally {
      setAtribuindo(null)
    }
  }

  if (!isAuthenticated || user?.role !== 'TRANSPORTADOR') {
    return <div>Carregando...</div>
  }

  const solicitacoesAprovadas = solicitacoes.filter(s => s.status === 'APROVADA')
  const solicitacoesEmExecucao = solicitacoes.filter(s => s.status === 'EM_EXECUCAO')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Portal do Transportador
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Bem-vindo, {user.nome}! Gerencie suas operações logísticas.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                      Aprovadas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {solicitacoesAprovadas.length}
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
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">👨‍💼</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Motoristas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {motoristas.length}
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
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">🚐</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Veículos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {veiculos.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/operacoes/motoristas"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">👨‍💼</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Gerenciar Motoristas</p>
                <p className="text-sm text-gray-500">Cadastrar e gerenciar motoristas</p>
              </div>
            </a>

            <a
              href="/operacoes/veiculos"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">🚐</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Gerenciar Veículos</p>
                <p className="text-sm text-gray-500">Cadastrar e gerenciar frota</p>
              </div>
            </a>

            <a
              href="/operacoes/financeiro"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">💰</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Financeiro</p>
                <p className="text-sm text-gray-500">Fluxo de caixa e pagamentos</p>
              </div>
            </a>
          </div>
        </div>

        {/* Solicitações Aprovadas */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Solicitações Aprovadas - Aguardando Atribuição
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {solicitacoesAprovadas.length} solicitação(ões) aprovadas para atribuição
              </p>
            </div>

            {loading ? (
              <div className="px-4 py-5 text-center">
                <div className="text-gray-500">Carregando...</div>
              </div>
            ) : solicitacoesAprovadas.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <div className="text-gray-500">Nenhuma solicitação aprovada aguardando atribuição</div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {solicitacoesAprovadas.map((solicitacao) => (
                    <li key={solicitacao.id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {solicitacao.numeroOrdem}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {solicitacao.solicitante.cliente.nomeEmpresa}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                Solicitante: {solicitacao.solicitante.usuario.nome}
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
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedSolicitacao(solicitacao.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Atribuir
                          </button>
                        </div>
                      </div>

                      {/* Modal de Atribuição */}
                      {selectedSolicitacao === solicitacao.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Atribuir Motorista e Veículo
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Motorista *
                              </label>
                              <select
                                value={formData.motoristaId}
                                onChange={(e) => setFormData({...formData, motoristaId: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Selecione um motorista</option>
                                {motoristas.map((motorista) => (
                                  <option key={motorista.id} value={motorista.id}>
                                    {motorista.usuario.nome} ({motorista.tipo})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Veículo *
                              </label>
                              <select
                                value={formData.veiculoId}
                                onChange={(e) => setFormData({...formData, veiculoId: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Selecione um veículo</option>
                                {veiculos.map((veiculo) => (
                                  <option key={veiculo.id} value={veiculo.id}>
                                    {veiculo.placa} - {veiculo.modelo} ({veiculo.tipo})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Número do CTE
                              </label>
                              <input
                                type="text"
                                value={formData.numeroCte}
                                onChange={(e) => setFormData({...formData, numeroCte: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Valor para Motorista (R$)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.valorMotorista}
                                onChange={(e) => setFormData({...formData, valorMotorista: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end space-x-2">
                            <button
                              onClick={() => setSelectedSolicitacao(null)}
                              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleAtribuir(solicitacao.id)}
                              disabled={atribuindo === solicitacao.id}
                              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              {atribuindo === solicitacao.id ? 'Atribuindo...' : 'Confirmar Atribuição'}
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Solicitações Em Execução */}
        {solicitacoesEmExecucao.length > 0 && (
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Solicitações Em Execução
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {solicitacoesEmExecucao.length} solicitação(ões) em andamento
                </p>
              </div>

              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {solicitacoesEmExecucao.map((solicitacao) => (
                    <li key={solicitacao.id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {solicitacao.numeroOrdem}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {solicitacao.solicitante.cliente.nomeEmpresa}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                Motorista: {solicitacao.motorista?.usuario.nome}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                Veículo: {solicitacao.veiculo?.placa} - {solicitacao.veiculo?.modelo}
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
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Em Execução
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}