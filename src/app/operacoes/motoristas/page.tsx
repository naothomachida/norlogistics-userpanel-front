'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'

interface Motorista {
  id: string
  usuarioId: string
  transportadorId: string
  tipo: string
  cnh: string
  valorPorKm?: number
  usuario: {
    id: string
    nome: string
    email: string
    telefone: string
  }
  transportador: {
    usuario: {
      nome: string
    }
  }
  _count: {
    solicitacoes: number
    viagens: number
  }
}

interface Usuario {
  id: string
  nome: string
  email: string
  telefone: string
  role: string
}

export default function MotoristasPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingMotorista, setEditingMotorista] = useState<Motorista | null>(null)
  const [formData, setFormData] = useState({
    usuarioId: '',
    tipo: 'PROPRIO',
    cnh: '',
    valorPorKm: ''
  })

  const fetchData = useCallback(async () => {
    try {
      const [motoristasRes, usuariosRes] = await Promise.all([
        fetch(`/api/motoristas?transportadorId=${user?.id}`),
        fetch('/api/usuarios?role=MOTORISTA')
      ])

      if (motoristasRes.ok) {
        const motoristasData = await motoristasRes.json()
        setMotoristas(motoristasData)
      }

      if (usuariosRes.ok) {
        const usuariosData = await usuariosRes.json()
        // Filtrar usuários que ainda não são motoristas deste transportador
        const usuariosSemMotorista = usuariosData.filter((u: any) => 
          !u.motorista || u.motorista.transportadorId !== user?.id
        )
        setUsuarios(usuariosSemMotorista)
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
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
    if (!formData.usuarioId || !formData.cnh) {
      alert('Usuário e CNH são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const url = editingMotorista ? `/api/motoristas/${editingMotorista.id}` : '/api/motoristas'
      const method = editingMotorista ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          transportadorId: user?.id,
          valorPorKm: formData.valorPorKm ? parseFloat(formData.valorPorKm) : null
        })
      })

      if (response.ok) {
        alert(editingMotorista ? 'Motorista atualizado com sucesso!' : 'Motorista cadastrado com sucesso!')
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

  const handleEdit = (motorista: Motorista) => {
    setEditingMotorista(motorista)
    setFormData({
      usuarioId: motorista.usuarioId,
      tipo: motorista.tipo,
      cnh: motorista.cnh,
      valorPorKm: motorista.valorPorKm?.toString() || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este motorista?')) return

    try {
      const response = await fetch(`/api/motoristas/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Motorista excluído com sucesso!')
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
      usuarioId: '',
      tipo: 'PROPRIO',
      cnh: '',
      valorPorKm: ''
    })
    setEditingMotorista(null)
    setShowModal(false)
  }

  // Show loading while auth is being checked or if not authenticated yet
  if (authLoading || (!isAuthenticated && !user)) {
    return <div>Carregando...</div>
  }

  return (
    <Layout
      title="Gerenciar Motoristas"
      description="Cadastre e gerencie os motoristas da sua frota"
    >
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Header com botão de adicionar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Motoristas</h1>
            <p className="text-gray-500">Total: {motoristas.length} motoristas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Adicionar Motorista
          </button>
        </div>

        {/* Lista de motoristas */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="p-6 text-center">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : motoristas.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-500">Nenhum motorista cadastrado</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Motorista
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CNH
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor/Km
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
                  {motoristas.map((motorista) => (
                    <tr key={motorista.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {motorista.usuario.nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {motorista.usuario.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {motorista.usuario.telefone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {motorista.cnh}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          motorista.tipo === 'PROPRIO' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {motorista.tipo === 'PROPRIO' ? 'Próprio' : 'Terceiro'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {motorista.valorPorKm ? `R$ ${motorista.valorPorKm.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{motorista._count.solicitacoes} solicitações</div>
                        <div>{motorista._count.viagens} viagens</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(motorista)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(motorista.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
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
                  {editingMotorista ? 'Editar Motorista' : 'Novo Motorista'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Usuário *
                    </label>
                    <select
                      value={formData.usuarioId}
                      onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      disabled={!!editingMotorista}
                    >
                      <option value="">Selecione um usuário</option>
                      {editingMotorista ? (
                        <option value={editingMotorista.usuarioId}>
                          {editingMotorista.usuario.nome}
                        </option>
                      ) : (
                        usuarios.map((usuario) => (
                          <option key={usuario.id} value={usuario.id}>
                            {usuario.nome} ({usuario.email})
                          </option>
                        ))
                      )}
                    </select>
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
                      <option value="PROPRIO">Próprio</option>
                      <option value="TERCEIRO">Terceiro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CNH *
                    </label>
                    <input
                      type="text"
                      value={formData.cnh}
                      onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Número da CNH"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Valor por Km (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valorPorKm}
                      onChange={(e) => setFormData({ ...formData, valorPorKm: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 2.50"
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
                      {saving ? 'Salvando...' : editingMotorista ? 'Atualizar' : 'Cadastrar'}
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