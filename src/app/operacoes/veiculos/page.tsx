'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'

interface Veiculo {
  id: string
  placa: string
  modelo: string
  tipo: string
  capacidade: number
  transportadorId: string
  ativo: boolean
  transportador: {
    usuario: {
      nome: string
    }
  }
  _count: {
    solicitacoes: number
    viagens: number
    manutencoes: number
  }
}

export default function VeiculosPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null)
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    tipo: 'VAN',
    capacidade: ''
  })

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/veiculos?transportadorId=${user?.id}`)

      if (response.ok) {
        const veiculosData = await response.json()
        setVeiculos(veiculosData)
      }
    } catch (error) {
      console.error('Erro ao buscar veículos:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    // Only redirect if auth loading is complete and user is definitely not authenticated
    if (!authLoading && !isAuthenticated && !user) {
      router.push('/login')
      return
    }

    // Only fetch data if we have a confirmed authenticated user
    if (!authLoading && isAuthenticated && user) {
      fetchData()
    }
  }, [isAuthenticated, user, router, authLoading, fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.placa || !formData.modelo || !formData.capacidade) {
      alert('Placa, modelo e capacidade são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const url = editingVeiculo ? `/api/veiculos/${editingVeiculo.id}` : '/api/veiculos'
      const method = editingVeiculo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          transportadorId: user?.id,
          capacidade: parseInt(formData.capacidade)
        })
      })

      if (response.ok) {
        alert(editingVeiculo ? 'Veículo atualizado com sucesso!' : 'Veículo cadastrado com sucesso!')
        resetForm()
        fetchData()
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      alert('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (veiculo: Veiculo) => {
    setEditingVeiculo(veiculo)
    setFormData({
      placa: veiculo.placa,
      modelo: veiculo.modelo,
      tipo: veiculo.tipo,
      capacidade: veiculo.capacidade.toString()
    })
    setShowModal(true)
  }

  const handleToggleStatus = async (id: string, ativo: boolean) => {
    try {
      const response = await fetch(`/api/veiculos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativo })
      })

      if (response.ok) {
        alert(`Veículo ${!ativo ? 'ativado' : 'desativado'} com sucesso!`)
        fetchData()
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      alert('Erro de conexão')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')) return

    try {
      const response = await fetch(`/api/veiculos/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Veículo excluído com sucesso!')
        fetchData()
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      alert('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      placa: '',
      modelo: '',
      tipo: 'VAN',
      capacidade: ''
    })
    setEditingVeiculo(null)
    setShowModal(false)
  }

  const formatPlaca = (placa: string) => {
    // Remove todos os caracteres não alfanuméricos
    const cleaned = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    
    // Formato antigo (AAA-9999) ou novo (AAA9A99)
    if (cleaned.length <= 7) {
      if (cleaned.length >= 4) {
        return cleaned.slice(0, 3) + '-' + cleaned.slice(3)
      }
      return cleaned
    }
    return cleaned.slice(0, 7)
  }

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlaca(e.target.value)
    setFormData({ ...formData, placa: formatted })
  }

  // Show loading while auth is being checked or if not authenticated yet
  if (authLoading || (!isAuthenticated && !user)) {
    return <div>Carregando...</div>
  }

  const veiculosAtivos = veiculos.filter(v => v.ativo)
  const veiculosInativos = veiculos.filter(v => !v.ativo)

  return (
    <Layout
      title="Gerenciar Veículos"
      description="Cadastre e gerencie os veículos da sua frota"
    >
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Header com estatísticas e botão de adicionar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Veículos</h1>
            <div className="flex space-x-4 text-sm text-gray-500">
              <span>Total: {veiculos.length}</span>
              <span>Ativos: {veiculosAtivos.length}</span>
              <span>Inativos: {veiculosInativos.length}</span>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Adicionar Veículo
          </button>
        </div>

        {/* Lista de veículos */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="p-6 text-center">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : veiculos.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-500">Nenhum veículo cadastrado</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Veículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Atividades
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {veiculos.map((veiculo) => (
                    <tr key={veiculo.id} className={!veiculo.ativo ? 'opacity-60' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {veiculo.placa}
                          </div>
                          <div className="text-sm text-gray-500">
                            {veiculo.modelo}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          veiculo.tipo === 'VAN' 
                            ? 'bg-blue-100 text-blue-800' 
                            : veiculo.tipo === 'CAMINHAO'
                            ? 'bg-green-100 text-green-800'
                            : veiculo.tipo === 'CARRETA'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {veiculo.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {veiculo.capacidade} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          veiculo.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {veiculo.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{veiculo._count.solicitacoes} solicitações</div>
                        <div>{veiculo._count.viagens} viagens</div>
                        <div>{veiculo._count.manutencoes} manutenções</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(veiculo)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleStatus(veiculo.id, veiculo.ativo)}
                            className={`${
                              veiculo.ativo 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {veiculo.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                          <button
                            onClick={() => handleDelete(veiculo.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de cadastro/edição */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingVeiculo ? 'Editar Veículo' : 'Novo Veículo'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Placa *
                    </label>
                    <input
                      type="text"
                      value={formData.placa}
                      onChange={handlePlacaChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ABC-1234 ou ABC1D23"
                      disabled={!!editingVeiculo}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Modelo *
                    </label>
                    <input
                      type="text"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Ford Transit, Mercedes Sprinter"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo *
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="VAN">Van</option>
                      <option value="CAMINHAO">Caminhão</option>
                      <option value="CARRETA">Carreta</option>
                      <option value="MOTO">Moto</option>
                      <option value="CARRO">Carro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Capacidade (kg) *
                    </label>
                    <input
                      type="number"
                      value={formData.capacidade}
                      onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 1000"
                      min="0"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Salvando...' : editingVeiculo ? 'Atualizar' : 'Cadastrar'}
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