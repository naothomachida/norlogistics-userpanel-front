'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSolicitacao, nextStep, prevStep, clearSolicitacao } from '@/store/slices/solicitacaoSlice'

const TIPOS_VEICULO = [
  { value: 'VAN', label: 'Van' },
  { value: 'CAMINHONETE', label: 'Caminhonete' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'CARRETA', label: 'Carreta' },
  { value: 'BITRUCK', label: 'Bitruck' }
]

export default function SolicitarColetaPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { currentSolicitacao, currentStep } = useAppSelector((state) => state.solicitacao)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.role !== 'SOLICITANTE') {
      router.push('/')
      return
    }

    // Inicializar solicitação com dados do usuário
    if (user && !currentSolicitacao?.solicitanteId) {
      dispatch(setSolicitacao({
        solicitanteId: user.id,
        // Note: Em um cenário real, precisaríamos buscar os dados do solicitante
        // Por enquanto, vamos usar valores padrão
        clienteId: '',
        centroCustoId: ''
      }))
    }
  }, [isAuthenticated, user, router, dispatch, currentSolicitacao])

  const handleInputChange = (field: string, value: any) => {
    dispatch(setSolicitacao({ [field]: value }))
  }

  const handleNext = () => {
    // Validação básica antes de avançar
    if (currentStep === 1) {
      // Dados já preenchidos automaticamente do usuário
    } else if (currentStep === 2) {
      if (!currentSolicitacao?.pontoColeta || !currentSolicitacao?.pontoEntrega) {
        setError('Preencha todos os campos obrigatórios')
        return
      }
    } else if (currentStep === 3) {
      if (!currentSolicitacao?.descricaoMaterial || !currentSolicitacao?.tipoVeiculo) {
        setError('Preencha todos os campos obrigatórios')
        return
      }
    }
    
    setError('')
    dispatch(nextStep())
  }

  const handlePrev = () => {
    dispatch(prevStep())
  }

  const calculateValues = () => {
    // Cálculo simplificado - em produção seria mais complexo
    const kmTotal = 100 // Seria calculado via API de mapas
    const valorPorKm = 2.5
    const valorServico = kmTotal * valorPorKm
    const valorPedagio = currentSolicitacao?.valorPedagio || 0
    const valorTotal = valorServico + valorPedagio

    dispatch(setSolicitacao({
      kmTotal,
      valorServico,
      valorTotal
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Calcular valores antes de submeter
      calculateValues()

      const response = await fetch('/api/solicitacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentSolicitacao),
      })

      const data = await response.json()

      if (response.ok) {
        dispatch(clearSolicitacao())
        alert(`Solicitação criada com sucesso! Número da ordem: ${data.numeroOrdem}`)
        router.push('/')
      } else {
        setError(data.error || 'Erro ao criar solicitação')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || user?.role !== 'SOLICITANTE') {
    return <div>Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Nova Solicitação de Coleta</h1>
            
            {/* Progress Steps */}
            <div className="mt-4">
              <div className="flex items-center">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`w-16 h-1 ${
                          step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Solicitante</span>
                <span>Coleta/Entrega</span>
                <span>Material</span>
                <span>Confirmação</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Step 1: Informações do Solicitante */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Passo 1: Informações do Solicitante</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cliente (Empresa)</label>
                    <input
                      type="text"
                      value="Cliente não configurado"
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome do Solicitante</label>
                    <input
                      type="text"
                      value={user.nome}
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input
                      type="tel"
                      value="Telefone não configurado"
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Centro de Custo</label>
                    <input
                      type="text"
                      value="Centro de custo não configurado"
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gestor Responsável</label>
                    <input
                      type="text"
                      value="Gestor não configurado"
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Informações da Coleta e Entrega */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Passo 2: Informações da Coleta e Entrega</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ponto de Coleta *</label>
                    <input
                      type="text"
                      value={currentSolicitacao?.pontoColeta || ''}
                      onChange={(e) => handleInputChange('pontoColeta', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço da Coleta *</label>
                    <input
                      type="text"
                      value={currentSolicitacao?.enderecoColeta || ''}
                      onChange={(e) => handleInputChange('enderecoColeta', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data da Coleta *</label>
                    <input
                      type="date"
                      value={currentSolicitacao?.dataColeta || ''}
                      onChange={(e) => handleInputChange('dataColeta', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hora da Coleta *</label>
                    <input
                      type="time"
                      value={currentSolicitacao?.horaColeta || ''}
                      onChange={(e) => handleInputChange('horaColeta', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ponto de Entrega *</label>
                    <input
                      type="text"
                      value={currentSolicitacao?.pontoEntrega || ''}
                      onChange={(e) => handleInputChange('pontoEntrega', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço da Entrega *</label>
                    <input
                      type="text"
                      value={currentSolicitacao?.enderecoEntrega || ''}
                      onChange={(e) => handleInputChange('enderecoEntrega', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data da Entrega *</label>
                    <input
                      type="date"
                      value={currentSolicitacao?.dataEntrega || ''}
                      onChange={(e) => handleInputChange('dataEntrega', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hora da Entrega *</label>
                    <input
                      type="time"
                      value={currentSolicitacao?.horaEntrega || ''}
                      onChange={(e) => handleInputChange('horaEntrega', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Ponto de Retorno (Opcional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ponto de Retorno</label>
                      <input
                        type="text"
                        value={currentSolicitacao?.pontoRetorno || ''}
                        onChange={(e) => handleInputChange('pontoRetorno', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Endereço do Retorno</label>
                      <input
                        type="text"
                        value={currentSolicitacao?.enderecoRetorno || ''}
                        onChange={(e) => handleInputChange('enderecoRetorno', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Informações do Material */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Passo 3: Informações do Material</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Descrição do Material *</label>
                    <textarea
                      value={currentSolicitacao?.descricaoMaterial || ''}
                      onChange={(e) => handleInputChange('descricaoMaterial', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantidade de Volumes *</label>
                    <input
                      type="number"
                      value={currentSolicitacao?.quantidadeVolumes || ''}
                      onChange={(e) => handleInputChange('quantidadeVolumes', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dimensões *</label>
                    <input
                      type="text"
                      placeholder="Ex: 100x50x30 cm"
                      value={currentSolicitacao?.dimensoes || ''}
                      onChange={(e) => handleInputChange('dimensoes', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Embalagem *</label>
                    <input
                      type="text"
                      placeholder="Ex: Caixa, Pallet, etc."
                      value={currentSolicitacao?.tipoEmbalagem || ''}
                      onChange={(e) => handleInputChange('tipoEmbalagem', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Peso Total (kg) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentSolicitacao?.pesoTotal || ''}
                      onChange={(e) => handleInputChange('pesoTotal', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número da DANFE</label>
                    <input
                      type="text"
                      value={currentSolicitacao?.numeroDanfe || ''}
                      onChange={(e) => handleInputChange('numeroDanfe', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor da DANFE (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentSolicitacao?.valorDanfe || ''}
                      onChange={(e) => handleInputChange('valorDanfe', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Veículo Sugerido *</label>
                    <select
                      value={currentSolicitacao?.tipoVeiculo || ''}
                      onChange={(e) => handleInputChange('tipoVeiculo', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione o tipo</option>
                      {TIPOS_VEICULO.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Observações</label>
                    <textarea
                      value={currentSolicitacao?.observacoes || ''}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmação */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Passo 4: Confirmação e Submissão</h3>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Resumo da Solicitação</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><strong>Cliente:</strong> Cliente não configurado</div>
                    <div><strong>Solicitante:</strong> {user.nome}</div>
                    <div><strong>Coleta:</strong> {currentSolicitacao?.pontoColeta}</div>
                    <div><strong>Entrega:</strong> {currentSolicitacao?.pontoEntrega}</div>
                    <div><strong>Material:</strong> {currentSolicitacao?.descricaoMaterial}</div>
                    <div><strong>Tipo de Veículo:</strong> {TIPOS_VEICULO.find(t => t.value === currentSolicitacao?.tipoVeiculo)?.label}</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Cálculos do Serviço</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>KM Total (estimado):</span>
                      <span>100 km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor do Pedágio:</span>
                      <span>R$ {(currentSolicitacao?.valorPedagio || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor do Serviço:</span>
                      <span>R$ 250,00</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>Valor Total:</span>
                      <span>R$ {(250 + (currentSolicitacao?.valorPedagio || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Valor do Pedágio (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentSolicitacao?.valorPedagio || ''}
                    onChange={(e) => handleInputChange('valorPedagio', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Voltar
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}