'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Layout } from '@/components/layout'
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
  const [showHoraColeta, setShowHoraColeta] = useState(false)
  const [showHoraEntrega, setShowHoraEntrega] = useState(false)
  const [showPontoRetorno, setShowPontoRetorno] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Inicializar solicitação com dados do usuário
    if (user && !currentSolicitacao?.solicitanteId) {
      console.log('User data:', user)
      // Obter dados reais do perfil do usuário solicitante
      const solicitanteData = user.solicitante
      console.log('Solicitante data:', solicitanteData)
      
      if (solicitanteData) {
        const clienteId = solicitanteData.cliente?.id
        const centroCustoId = solicitanteData.centroCusto?.id  
        const gestorId = solicitanteData.gestor?.id
        
        console.log('IDs:', { 
          solicitanteId: solicitanteData.id,
          clienteId, 
          centroCustoId, 
          gestorId 
        })
        
        if (clienteId && centroCustoId && gestorId) {
          dispatch(setSolicitacao({
            solicitanteId: solicitanteData.id, // Use solicitante.id, not user.id
            clienteId,
            centroCustoId,
            gestorId
          }))
        } else {
          console.error('Missing IDs:', { clienteId, centroCustoId, gestorId })
          setError('Perfil do usuário incompleto. Entre em contato com o administrador.')
        }
      } else {
        console.error('User is not a solicitante')
        setError('Usuário não é um solicitante válido.')
      }
    }
  }, [isAuthenticated, user, router, dispatch, currentSolicitacao])

  const handleInputChange = (field: string, value: unknown) => {
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
        router.push('/dashboard')
      } else {
        setError(data.error || 'Erro ao criar solicitação')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div>Carregando...</div>
  }

  // Function to render summary based on current step and filled data
  const renderSummary = () => {
    return (
      <div className="bg-white shadow-lg rounded-lg h-fit sticky top-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Resumo da Solicitação</h3>
          <p className="text-sm text-gray-600 mt-1">Acompanhe o que já foi preenchido</p>
        </div>
        
        <div className="px-6 py-4 space-y-6">
          {/* Etapa 1: Solicitante */}
          <div className={`pb-4 ${currentStep >= 1 ? 'border-b border-gray-200' : ''}`}>
            <div className="flex items-center mb-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <h4 className="ml-2 font-medium text-gray-900">Solicitante</h4>
            </div>
            {currentStep >= 1 && (
              <div className="ml-8 space-y-2 text-sm">
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Nome:</span>
                  <span className="ml-1 text-gray-700">{user?.nome || 'N/A'}</span>
                </div>
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Email:</span>
                  <span className="ml-1 text-gray-700">{user?.email || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Etapa 2: Coleta/Entrega */}
          <div className={`pb-4 ${currentStep >= 2 ? 'border-b border-gray-200' : ''}`}>
            <div className="flex items-center mb-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <h4 className="ml-2 font-medium text-gray-900">Coleta/Entrega</h4>
            </div>
            {currentStep >= 2 && (
              <div className="ml-8 space-y-2 text-sm">
                {currentSolicitacao?.pontoColeta && (
                  <div className="flex items-start text-green-600">
                    <svg className="w-4 h-4 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="font-medium">Coleta:</span>
                      <span className="ml-1 text-gray-700 block">{currentSolicitacao.pontoColeta}</span>
                      {currentSolicitacao?.dataColeta && (
                        <span className="text-gray-500 text-xs">Data: {currentSolicitacao.dataColeta} {currentSolicitacao?.horaColeta || '(hora a definir)'}</span>
                      )}
                    </div>
                  </div>
                )}
                {currentSolicitacao?.pontoEntrega && (
                  <div className="flex items-start text-green-600">
                    <svg className="w-4 h-4 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="font-medium">Entrega:</span>
                      <span className="ml-1 text-gray-700 block">{currentSolicitacao.pontoEntrega}</span>
                      {currentSolicitacao?.dataEntrega && (
                        <span className="text-gray-500 text-xs">Data: {currentSolicitacao.dataEntrega} {currentSolicitacao?.horaEntrega || '(hora a definir)'}</span>
                      )}
                    </div>
                  </div>
                )}
                {currentSolicitacao?.pontoRetorno && (
                  <div className="flex items-start text-green-600">
                    <svg className="w-4 h-4 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="font-medium">Retorno:</span>
                      <span className="ml-1 text-gray-700 block">{currentSolicitacao.pontoRetorno}</span>
                    </div>
                  </div>
                )}
                {currentStep >= 2 && !currentSolicitacao?.pontoColeta && !currentSolicitacao?.pontoEntrega && (
                  <div className="text-gray-500 text-sm ml-6">Aguardando preenchimento...</div>
                )}
              </div>
            )}
          </div>

          {/* Etapa 3: Material */}
          <div className={`pb-4 ${currentStep >= 3 ? 'border-b border-gray-200' : ''}`}>
            <div className="flex items-center mb-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <h4 className="ml-2 font-medium text-gray-900">Material</h4>
            </div>
            {currentStep >= 3 && (
              <div className="ml-8 space-y-2 text-sm">
                {currentSolicitacao?.descricaoMaterial && (
                  <div className="flex items-start text-green-600">
                    <svg className="w-4 h-4 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="font-medium">Descrição:</span>
                      <span className="ml-1 text-gray-700 block">{currentSolicitacao.descricaoMaterial}</span>
                    </div>
                  </div>
                )}
                {currentSolicitacao?.tipoVeiculo && (
                  <div className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Veículo:</span>
                    <span className="ml-1 text-gray-700">{TIPOS_VEICULO.find(t => t.value === currentSolicitacao.tipoVeiculo)?.label}</span>
                  </div>
                )}
                {currentSolicitacao?.quantidadeVolumes && (
                  <div className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Volumes:</span>
                    <span className="ml-1 text-gray-700">{currentSolicitacao.quantidadeVolumes}</span>
                  </div>
                )}
                {currentSolicitacao?.pesoTotal && (
                  <div className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Peso:</span>
                    <span className="ml-1 text-gray-700">{currentSolicitacao.pesoTotal} kg</span>
                  </div>
                )}
                {currentStep >= 3 && !currentSolicitacao?.descricaoMaterial && (
                  <div className="text-gray-500 text-sm ml-6">Aguardando preenchimento...</div>
                )}
              </div>
            )}
          </div>

          {/* Etapa 4: Confirmação */}
          <div>
            <div className="flex items-center mb-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep >= 4 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                4
              </div>
              <h4 className="ml-2 font-medium text-gray-900">Confirmação</h4>
            </div>
            {currentStep >= 4 && (
              <div className="ml-8 space-y-2 text-sm">
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="font-medium text-blue-900 mb-2">Valor Estimado</div>
                  <div className="text-blue-800 text-lg font-semibold">
                    R$ {(250 + (currentSolicitacao?.valorPedagio || 0)).toFixed(2)}
                  </div>
                  <div className="text-blue-600 text-xs mt-1">
                    Valor sujeito a confirmação
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout
      title="Nova Solicitação de Coleta"
      description="Crie uma nova solicitação de coleta seguindo os passos abaixo"
    >
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              {renderSummary()}
            </div>
            
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  {/* Progress Steps */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      {[1, 2, 3, 4].map((step, index) => (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center w-full">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                step <= currentStep
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}
                            >
                              {step}
                            </div>
                            <div className="mt-2 text-xs text-gray-600 text-center">
                              {step === 1 && 'Solicitante'}
                              {step === 2 && 'Coleta/Entrega'}
                              {step === 3 && 'Material'}
                              {step === 4 && 'Confirmação'}
                            </div>
                          </div>
                          {step < 4 && (
                            <div
                              className={`flex-1 h-1 mx-4 ${
                                step < currentStep ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                            />
                          )}
                        </div>
                      ))}
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome do Solicitante</label>
                    <input
                      type="text"
                      value={user?.nome || ''}
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input
                      type="tel"
                      value="Telefone não configurado"
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Centro de Custo</label>
                    <input
                      type="text"
                      value="Centro de custo não configurado"
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gestor Responsável</label>
                    <input
                      type="text"
                      value="Gestor não configurado"
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900"
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço da Coleta *</label>
                    <input
                      type="text"
                      value={currentSolicitacao?.enderecoColeta || ''}
                      onChange={(e) => handleInputChange('enderecoColeta', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data da Coleta *</label>
                    <input
                      type="date"
                      value={currentSolicitacao?.dataColeta || ''}
                      onChange={(e) => handleInputChange('dataColeta', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    {!showHoraColeta ? (
                      <button
                        type="button"
                        onClick={() => setShowHoraColeta(true)}
                        className="mt-1 inline-flex items-center px-2 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded border-0 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        + informar horário
                      </button>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora da Coleta</label>
                        <div className="mt-1 flex gap-2">
                          <input
                            type="time"
                            value={currentSolicitacao?.horaColeta || ''}
                            onChange={(e) => handleInputChange('horaColeta', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowHoraColeta(false)
                              handleInputChange('horaColeta', '')
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ponto de Entrega *</label>
                    <input
                      type="text"
                      value={currentSolicitacao?.pontoEntrega || ''}
                      onChange={(e) => handleInputChange('pontoEntrega', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço da Entrega *</label>
                    <input
                      type="text"
                      value={currentSolicitacao?.enderecoEntrega || ''}
                      onChange={(e) => handleInputChange('enderecoEntrega', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data da Entrega *</label>
                    <input
                      type="date"
                      value={currentSolicitacao?.dataEntrega || ''}
                      onChange={(e) => handleInputChange('dataEntrega', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    {!showHoraEntrega ? (
                      <button
                        type="button"
                        onClick={() => setShowHoraEntrega(true)}
                        className="mt-1 inline-flex items-center px-2 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded border-0 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        + informar horário
                      </button>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora da Entrega</label>
                        <div className="mt-1 flex gap-2">
                          <input
                            type="time"
                            value={currentSolicitacao?.horaEntrega || ''}
                            onChange={(e) => handleInputChange('horaEntrega', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowHoraEntrega(false)
                              handleInputChange('horaEntrega', '')
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  {!showPontoRetorno ? (
                    <button
                      type="button"
                      onClick={() => setShowPontoRetorno(true)}
                      className="inline-flex items-center px-2 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded border-0 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      + adicionar ponto de retorno
                    </button>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Ponto de Retorno (Opcional)</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPontoRetorno(false)
                            handleInputChange('pontoRetorno', '')
                            handleInputChange('enderecoRetorno', '')
                          }}
                          className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          × remover
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Ponto de Retorno</label>
                          <input
                            type="text"
                            value={currentSolicitacao?.pontoRetorno || ''}
                            onChange={(e) => handleInputChange('pontoRetorno', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Endereço do Retorno</label>
                          <input
                            type="text"
                            value={currentSolicitacao?.enderecoRetorno || ''}
                            onChange={(e) => handleInputChange('enderecoRetorno', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantidade de Volumes *</label>
                    <input
                      type="number"
                      value={currentSolicitacao?.quantidadeVolumes || ''}
                      onChange={(e) => handleInputChange('quantidadeVolumes', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dimensões *</label>
                    <input
                      type="text"
                      placeholder="Ex: 100x50x30 cm"
                      value={currentSolicitacao?.dimensoes || ''}
                      onChange={(e) => handleInputChange('dimensoes', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Embalagem *</label>
                    <input
                      type="text"
                      placeholder="Ex: Caixa, Pallet, etc."
                      value={currentSolicitacao?.tipoEmbalagem || ''}
                      onChange={(e) => handleInputChange('tipoEmbalagem', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Peso Total (kg) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentSolicitacao?.pesoTotal || ''}
                      onChange={(e) => handleInputChange('pesoTotal', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número da DANFE</label>
                    <input
                      type="text"
                      value={currentSolicitacao?.numeroDanfe || ''}
                      onChange={(e) => handleInputChange('numeroDanfe', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor da DANFE (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentSolicitacao?.valorDanfe || ''}
                      onChange={(e) => handleInputChange('valorDanfe', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Veículo Sugerido *</label>
                    <select
                      value={currentSolicitacao?.tipoVeiculo || ''}
                      onChange={(e) => handleInputChange('tipoVeiculo', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-black">
                    <div><strong>Cliente:</strong> Cliente não configurado</div>
                    <div><strong>Solicitante:</strong> {user?.nome}</div>
                    <div><strong>Coleta:</strong> {currentSolicitacao?.pontoColeta}</div>
                    <div><strong>Entrega:</strong> {currentSolicitacao?.pontoEntrega}</div>
                    <div><strong>Material:</strong> {currentSolicitacao?.descricaoMaterial}</div>
                    <div><strong>Tipo de Veículo:</strong> {TIPOS_VEICULO.find(t => t.value === currentSolicitacao?.tipoVeiculo)?.label}</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Cálculos do Serviço</h4>
                  <div className="space-y-1 text-sm text-black">
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-black"
                  />
                </div>
              </div>
            )}
            </div>

                {/* Navigation Buttons */}
                <div className="px-6 py-4 bg-gray-50 flex justify-between">
                  {currentStep > 1 && (
                    <button
                      onClick={handlePrev}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Voltar
                    </button>
                  )}
                  
                  {currentStep < 4 && (
                    <button
                      onClick={handleNext}
                      className="ml-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
                    >
                      Avançar
                    </button>
                  )}
                  
                  {currentStep === 4 && (
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
        </div>
      </div>
    </Layout>
  )
}

