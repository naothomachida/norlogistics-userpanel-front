'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUsuarios, useClientes } from '@/hooks/useApi'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'

const ROLES = [
  { value: 'SOLICITANTE', label: 'Solicitante' },
  { value: 'GESTOR', label: 'Gestor' },
  { value: 'TRANSPORTADOR', label: 'Transportador' },
  { value: 'MOTORISTA', label: 'Motorista' }
]

interface UserFormData {
  nome: string
  email: string
  telefone: string
  senha: string
  role: 'SOLICITANTE' | 'GESTOR' | 'TRANSPORTADOR' | 'MOTORISTA'
  // Campos específicos por role
  clienteId?: string
  centroCustoId?: string
  gestorId?: string
  limiteValor?: number
  nomeEmpresa?: string
  cnpj?: string
  transportadorId?: string
  tipo?: string
  cnh?: string
  valorPorKm?: number
}

export default function UsuariosPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { data: usuarios, loading, error, refetch } = useUsuarios()
  const { data: clientes } = useClientes()
  
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('')
  
  const [formData, setFormData] = useState<UserFormData>({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    role: 'SOLICITANTE'
  })

  if (!isAuthenticated || user?.role !== 'GESTOR') {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let result
      if (editingUser) {
        result = await apiClient.updateUsuario(editingUser, formData)
      } else {
        result = await apiClient.createUsuario(formData)
      }

      if (result.error) {
        alert(`Erro: ${result.error}`)
      } else {
        alert(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!')
        setShowModal(false)
        resetForm()
        refetch()
      }
    } catch (error) {
      alert('Erro de conexão')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (usuario: any) => {
    setEditingUser(usuario.id)
    setSelectedRole(usuario.role)
    setFormData({
      nome: usuario.nome || '',
      email: usuario.email || '',
      telefone: usuario.telefone || '',
      senha: '', // Não carregar senha
      role: usuario.role || '',
      clienteId: usuario.solicitante?.clienteId || '',
      centroCustoId: usuario.solicitante?.centroCustoId || '',
      gestorId: usuario.solicitante?.gestorId || '',
      limiteValor: usuario.solicitante?.limiteValor || 0,
      nomeEmpresa: usuario.transportador?.nomeEmpresa || '',
      cnpj: usuario.transportador?.cnpj || '',
      transportadorId: usuario.motorista?.transportadorId || '',
      tipo: usuario.motorista?.tipo || '',
      cnh: usuario.motorista?.cnh || '',
      valorPorKm: usuario.motorista?.valorPorKm || 0
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return

    const result = await apiClient.deleteUsuario(id)
    if (result.error) {
      alert(`Erro: ${result.error}`)
    } else {
      alert('Usuário removido com sucesso!')
      refetch()
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      senha: '',
      role: 'SOLICITANTE'
    })
    setEditingUser(null)
    setSelectedRole('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleRoleChange = (role: 'SOLICITANTE' | 'GESTOR' | 'TRANSPORTADOR' | 'MOTORISTA') => {
    setSelectedRole(role)
    setFormData({ ...formData, role })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Carregando usuários...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Gerenciar Usuários
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Cadastre e gerencie usuários do sistema
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => setShowModal(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Novo Usuário
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Lista de Usuários
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {usuarios.length} usuário(s) cadastrado(s)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario: any) => (
                  <tr key={usuario.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {usuario.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        usuario.role === 'GESTOR' ? 'bg-purple-100 text-purple-800' :
                        usuario.role === 'SOLICITANTE' ? 'bg-blue-100 text-blue-800' :
                        usuario.role === 'TRANSPORTADOR' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ROLES.find(r => r.value === usuario.role)?.label || usuario.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.telefone || 'Não informado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Senha {!editingUser && '*'}
                      </label>
                      <input
                        type="password"
                        required={!editingUser}
                        value={formData.senha}
                        onChange={(e) => setFormData({...formData, senha: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder={editingUser ? 'Deixe em branco para não alterar' : ''}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Role *
                      </label>
                      <select
                        required
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e.target.value as 'SOLICITANTE' | 'GESTOR' | 'TRANSPORTADOR' | 'MOTORISTA')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        {ROLES.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Campos específicos por role */}
                  {selectedRole === 'SOLICITANTE' && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Dados do Solicitante</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Cliente
                          </label>
                          <select
                            value={formData.clienteId || ''}
                            onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Selecione um cliente</option>
                            {clientes.map(cliente => (
                              <option key={cliente.id} value={cliente.id}>
                                {cliente.nomeEmpresa}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Limite de Valor (R$)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.limiteValor || ''}
                            onChange={(e) => setFormData({...formData, limiteValor: parseFloat(e.target.value)})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRole === 'TRANSPORTADOR' && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Dados do Transportador</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Nome da Empresa
                          </label>
                          <input
                            type="text"
                            value={formData.nomeEmpresa || ''}
                            onChange={(e) => setFormData({...formData, nomeEmpresa: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            CNPJ
                          </label>
                          <input
                            type="text"
                            value={formData.cnpj || ''}
                            onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRole === 'MOTORISTA' && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Dados do Motorista</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Tipo
                          </label>
                          <select
                            value={formData.tipo || ''}
                            onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Selecione</option>
                            <option value="PROPRIO">Próprio</option>
                            <option value="TERCEIRO">Terceiro</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            CNH
                          </label>
                          <input
                            type="text"
                            value={formData.cnh || ''}
                            onChange={(e) => setFormData({...formData, cnh: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Valor por KM (R$)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.valorPorKm || ''}
                            onChange={(e) => setFormData({...formData, valorPorKm: parseFloat(e.target.value)})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Criar')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}