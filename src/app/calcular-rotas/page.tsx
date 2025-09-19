'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import nextDynamic from 'next/dynamic'
import { Layout } from '@/components/layout'
import ApiDebugPanel from '@/components/ApiDebugPanel'

// Dynamically import the Google Maps component to avoid SSR issues
const GoogleRouteMap = nextDynamic(() => import('@/components/GoogleRouteMap'), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-gray-200 rounded-lg flex items-center justify-center">Carregando mapa...</div>
})

interface RouteOption {
  route: {
    id: string
    distance: number
    duration: number
    estimatedCost: number
    efficiency: string
    geometry?: string
    routeImageUrl?: string
    points?: Array<{
      latitude: number
      longitude: number
      address?: string
    }>
    freightTableData?: Record<string, unknown>
    tollCost?: number
    tollStations?: Array<{
      name: string
      cost: number
      location: {
        latitude: number
        longitude: number
        address?: string
      }
      vehicleClass?: string
      concessionaire?: string
      roadway?: string
      tariff?: Record<string, number>
    }>
    weighStations?: Array<{
      id: number
      name: string
      location: {
        latitude: number
        longitude: number
        address?: string
      }
      roadway: string
      km: string
      direction: string
      concessionaire: string
      concessionaireId: number
      logo: string
      uf: string
    }>
  }
  costBreakdown: {
    fuelCost: number
    maintenanceCost: number
    driverCost: number
    tollCost: number
    operationalCost: number
    freightTableCost?: number
    totalCost: number
    profitMargin: number
    finalPrice: number
  }
  vehicleSpecs: {
    tipo: string
  }
  tag?: string
  recommendation?: string
  savings?: number
  timeSaved?: number
  efficiencyScore?: number
}

interface RouteResult {
  routes: {
    cheapest: RouteOption
    fastest: RouteOption
    mostEfficient: RouteOption
  }
  comparison: Array<{
    routeId: string
    distance: number
    duration: number
    cost: number
    savings: number
    timeDifference: number
    efficiencyScore: number
    costBreakdown: RouteOption['costBreakdown']
  }>
  statistics?: {
    totalTrips: number
    averageCost: number
    averageDistance: number
    averageDuration: number
    costTrend: 'increasing' | 'decreasing' | 'stable'
    commonIssues: { issue: string; frequency: number }[]
  }
  metadata: {
    origin: string
    destination: string
    vehicleType: string
    fuelPrice: number
    profitMargin: number
  }
}

export default function CalcularRotasPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    waypoints: [''],
    vehicleType: 'caminhao_medio',
    fuelPrice: 5.5,
    profitMargin: 20,
    useHistoricalData: true,
    // Configurações QUALP
    freightCategory: 'A',
    cargoType: 'geral',
    vehicleQualPType: 'truck',
    vehicleAxis: 'all',
    topSpeed: '',
    fuelConsumption: '',
    showTolls: true,
    showFreightTable: true,
    showPolyline: true,
    forceUpdate: false  // Nova opção para forçar atualização
  })
  
  const [result, setResult] = useState<RouteResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState('')
  const [selectedRouteKey, setSelectedRouteKey] = useState<string | null>(null)
  const [showRouteImageModal, setShowRouteImageModal] = useState(false)
  const [routeImageUrl, setRouteImageUrl] = useState<string | null>(null)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [selectedFreightCategory, setSelectedFreightCategory] = useState('A')
  const [selectedFreightAxis, setSelectedFreightAxis] = useState('2')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [showApiConfigurations, setShowApiConfigurations] = useState(false)

  // Debug state
  const [debugInfo, setDebugInfo] = useState<{
    payload?: unknown
    response?: unknown
    error?: string
    url?: string
    qualpPayload?: unknown
    qualpResponse?: unknown
    qualpUrl?: string
    cache?: {
      fromCache?: boolean
      cacheEntry?: {
        totalConsultas?: number
        ultimaConsulta?: string
      }
    } | null
  }>({})

  useEffect(() => {
    // Dar tempo para a autenticação ser verificada
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push('/login')
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [isAuthenticated, router])


  const handleCalculate = async () => {
    if (!formData.origin.trim() || !formData.destination.trim()) {
      setError('Origem e destino são obrigatórios')
      return
    }

    setCalculating(true)
    setError('')
    setDebugInfo({}) // Reset debug info

    try {
      const requestPayload = {
        ...formData,
        waypoints: formData.waypoints.filter(w => w.trim() !== ''),
        vehicleType: formData.vehicleQualPType,
        vehicleAxis: formData.vehicleAxis,
        topSpeed: formData.topSpeed,
        fuelConsumption: formData.fuelConsumption
      }

      // Store payload for debugging
      setDebugInfo(prev => ({
        ...prev,
        payload: requestPayload,
        url: '/api/routes/calculate'
      }))

      const response = await fetch('/api/routes/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })

      const data = await response.json()

      // Store response for debugging
      console.log('Cache info from API:', data.debug?.cache)
      setDebugInfo(prev => ({
        ...prev,
        response: data,
        error: undefined,
        // Incluir informações do cache
        cache: data.debug?.cache || null,
        // Também incluir info da API QUALP se disponível
        ...(data.debug?.qualp && {
          qualpPayload: data.debug.qualp.requestPayload,
          qualpResponse: data.debug.qualp.apiResponse,
          qualpUrl: data.debug.qualp.requestUrl
        })
      }))

      if (!response.ok) {
        const errorMsg = data.error || 'Erro ao calcular rotas'
        setDebugInfo(prev => ({
          ...prev,
          error: `${response.status}: ${errorMsg}. Details: ${data.details || 'N/A'}`
        }))
        throw new Error(errorMsg)
      }

      setResult(data)
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(errorMsg)
      setDebugInfo(prev => ({
        ...prev,
        error: errorMsg
      }))
    } finally {
      setCalculating(false)
    }
  }

  const addWaypoint = () => {
    setFormData({
      ...formData,
      waypoints: [...formData.waypoints, '']
    })
  }

  const removeWaypoint = (index: number) => {
    const newWaypoints = formData.waypoints.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      waypoints: newWaypoints.length === 0 ? [''] : newWaypoints
    })
  }

  const updateWaypoint = (index: number, value: string) => {
    const newWaypoints = [...formData.waypoints]
    newWaypoints[index] = value
    setFormData({
      ...formData,
      waypoints: newWaypoints
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`
    }
    return `${remainingMinutes}min`
  }

  const openRouteImageModal = (imageUrl: string) => {
    setRouteImageUrl(imageUrl)
    setImageLoadError(false)
    setShowRouteImageModal(true)
  }

  const closeRouteImageModal = () => {
    setShowRouteImageModal(false)
    setRouteImageUrl(null)
    setImageLoadError(false)
  }

  // Fechar modal com tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showRouteImageModal) {
        closeRouteImageModal()
      }
    }

    if (showRouteImageModal) {
      document.addEventListener('keydown', handleEscape)
      // Prevenir scroll do body quando modal estiver aberto
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [showRouteImageModal])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  const routeOptions = result ? [
    { key: 'cheapest', ...result.routes.cheapest },
    { key: 'fastest', ...result.routes.fastest },
    { key: 'mostEfficient', ...result.routes.mostEfficient }
  ] : []

  const selectedRoute = selectedRouteKey ? routeOptions.find(option => option.key === selectedRouteKey) : null

  return (
    <Layout
      title="Calculadora de Rotas"
      description="Compare rotas e custos para suas operações logísticas"
      className="lg:ml-0"
      contentClassName="lg:ml-0"
    >
      <div className="max-w-none mx-0 py-6 px-4 sm:px-6 lg:px-8">

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Formulário de Cálculo */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Parâmetros da Rota
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Origem *
                  </label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({...formData, origin: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Destino *
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Ex: Rio de Janeiro, RJ"
                  />
                </div>

                {/* Pontos de Parada */}
                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Pontos de Parada
                    </label>
                    <button
                      type="button"
                      onClick={addWaypoint}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Adicionar
                    </button>
                  </div>
                  
                  {formData.waypoints.map((waypoint, index) => (
                    <div key={index} className="mt-2 flex">
                      <input
                        type="text"
                        value={waypoint}
                        onChange={(e) => updateWaypoint(index, e.target.value)}
                        className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ponto de parada opcional"
                      />
                      {formData.waypoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWaypoint(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>


                {/* Botão Calcular Rotas */}
                <div className="space-y-3">
                  <button
                    onClick={handleCalculate}
                    disabled={calculating}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {calculating ? 'Calculando...' : 'Calcular Rotas'}
                  </button>
                </div>

                {/* Configurações QUALP */}
                <div className="border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApiConfigurations(!showApiConfigurations)}
                    className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <span>Configurações da API</span>
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${
                        showApiConfigurations ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Seção Colapsável - Configurações da API */}
                  {showApiConfigurations && (
                    <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Categoria de Veículo
                      </label>
                      <select
                        value={formData.vehicleQualPType}
                        onChange={(e) => setFormData({...formData, vehicleQualPType: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      >
                        <option value="truck">truck (Caminhão)</option>
                        <option value="car">car (Carro)</option>
                        <option value="motorcycle">motorcycle (Moto)</option>
                        <option value="bus">bus (Ônibus)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Categoria de Frete
                      </label>
                      <select
                        value={formData.freightCategory}
                        onChange={(e) => setFormData({...formData, freightCategory: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Carga
                      </label>
                      <select
                        value={formData.cargoType}
                        onChange={(e) => setFormData({...formData, cargoType: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      >
                        <option value="all">all (Todas)</option>
                        <option value="granel_solido">granel_solido (Granel Sólido)</option>
                        <option value="granel_liquido">granel_liquido (Granel Líquido)</option>
                        <option value="frigorificada">frigorificada (Frigorificada)</option>
                        <option value="conteineirizada">conteineirizada (Conteineirizada)</option>
                        <option value="geral">geral (Geral)</option>
                        <option value="neogranel">neogranel (Neogranel)</option>
                        <option value="perigosa_granel_solido">perigosa_granel_solido (Perigosa Granel Sólido)</option>
                        <option value="perigosa_granel_liquido">perigosa_granel_liquido (Perigosa Granel Líquido)</option>
                        <option value="perigosa_frigorificada">perigosa_frigorificada (Perigosa Frigorificada)</option>
                        <option value="perigosa_conteineirizada">perigosa_conteineirizada (Perigosa Conteineirizada)</option>
                        <option value="perigosa_geral">perigosa_geral (Perigosa Geral)</option>
                        <option value="granel_pressurizada">granel_pressurizada (Granel Pressurizada)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Número de Eixos
                      </label>
                      <select
                        value={formData.vehicleAxis}
                        onChange={(e) => setFormData({...formData, vehicleAxis: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      >
                        <option value="all">all (Todos)</option>
                        <option value="2">2 eixos</option>
                        <option value="3">3 eixos</option>
                        <option value="4">4 eixos</option>
                        <option value="5">5 eixos</option>
                        <option value="6">6 eixos</option>
                        <option value="7">7 eixos</option>
                        <option value="8">8 eixos</option>
                        <option value="9">9 eixos</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Velocidade Máxima
                        </label>
                        <input
                          type="number"
                          placeholder="Opcional"
                          value={formData.topSpeed}
                          onChange={(e) => setFormData({...formData, topSpeed: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Consumo (km/L)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Opcional"
                          value={formData.fuelConsumption}
                          onChange={(e) => setFormData({...formData, fuelConsumption: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="show-tolls"
                          type="checkbox"
                          checked={formData.showTolls}
                          onChange={(e) => setFormData({...formData, showTolls: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="show-tolls" className="ml-2 block text-sm text-gray-900">
                          Mostrar pedágios
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="show-freight"
                          type="checkbox"
                          checked={formData.showFreightTable}
                          onChange={(e) => setFormData({...formData, showFreightTable: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="show-freight" className="ml-2 block text-sm text-gray-900">
                          Mostrar tabela de frete
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="show-polyline"
                          type="checkbox"
                          checked={formData.showPolyline}
                          onChange={(e) => setFormData({...formData, showPolyline: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="show-polyline" className="ml-2 block text-sm text-gray-900">
                          Mostrar rota no mapa
                        </label>
                      </div>
                    </div>
                    </div>
                  )}
                {/* Botão para mostrar/ocultar opções avançadas */}
                <div className="border-t pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <span>Opções Avançadas</span>
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${
                          showAdvancedOptions ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Seção Colapsável - Opções Avançadas */}
                {showAdvancedOptions && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">

                {/* Tipo de Veículo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Veículo
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="van">Van</option>
                    <option value="caminhao_pequeno">Caminhão Pequeno</option>
                    <option value="caminhao_medio">Caminhão Médio</option>
                    <option value="caminhao_grande">Caminhão Grande</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Preço Combustível (R$/L)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fuelPrice}
                      onChange={(e) => setFormData({...formData, fuelPrice: parseFloat(e.target.value) || 0})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Margem Lucro (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={formData.profitMargin}
                      onChange={(e) => setFormData({...formData, profitMargin: parseInt(e.target.value) || 0})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="historical-data"
                      type="checkbox"
                      checked={formData.useHistoricalData}
                      onChange={(e) => setFormData({...formData, useHistoricalData: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="historical-data" className="ml-2 block text-sm text-gray-900">
                      Usar dados históricos para ajustar cálculo
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="force-update"
                      type="checkbox"
                      checked={formData.forceUpdate}
                      onChange={(e) => setFormData({...formData, forceUpdate: e.target.checked})}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="force-update" className="ml-2 block text-sm text-gray-900">
                      <span className="flex items-center">
                        <span className="mr-2">🌐</span>
                        <span>Fazer consulta direta no Qualp</span>
                      </span>
                      <span className="text-xs text-gray-500 block ml-6">
                        Se desmarcado, usa dados salvos do banco quando disponível
                      </span>
                    </label>
                  </div>
                </div>

                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-2">
            {result && (
              <div className="space-y-6">
                {/* Indicador da fonte dos dados */}
                <div className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {debugInfo.cache?.fromCache ? (
                        <>
                          <div>
                            <h3 className="text-sm font-medium text-green-800">
                              Dados do Cache Local
                            </h3>
                            <p className="text-xs text-green-600">
                              {debugInfo.cache?.cacheEntry?.totalConsultas ?
                                `Consultado ${debugInfo.cache.cacheEntry.totalConsultas} vez(es)` :
                                'Primeira consulta'
                              } • Última atualização: {
                                debugInfo.cache?.cacheEntry?.ultimaConsulta ?
                                  new Date(debugInfo.cache.cacheEntry.ultimaConsulta).toLocaleString('pt-BR') :
                                  'Agora'
                              }
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <h3 className="text-sm font-medium text-blue-800">
                              Dados Atualizados da API Qualp
                            </h3>
                            <p className="text-xs text-blue-600">
                              Consulta realizada em tempo real • {new Date().toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {debugInfo.cache?.fromCache && (
                      <div className="text-right">
                        <button
                          onClick={() => {
                            setFormData({...formData, forceUpdate: true})
                            handleCalculate()
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          🔄 Atualizar do Qualp
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cards das 3 melhores rotas */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {routeOptions.map((option) => (
                    <div
                      key={option.key}
                      className={`overflow-hidden shadow rounded-lg cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                        selectedRouteKey === option.key
                          ? 'bg-blue-50 ring-2 ring-blue-500 border-blue-500'
                          : 'bg-white hover:shadow-lg border border-gray-200'
                      }`}
                      onClick={() => setSelectedRouteKey(option.key)}
                    >
                      <div className="p-5 relative">
                        {selectedRouteKey === option.key && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center">
                          <div className="ml-0 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                {option.tag}
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {formatCurrency(option.costBreakdown.finalPrice)}
                              </dd>
                            </dl>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Distância:</span>
                              <span>{option.route.distance.toFixed(1)} km</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tempo:</span>
                              <span>{formatTime(option.route.duration)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Eficiência:</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                option.route.efficiency === 'alta' ? 'bg-green-100 text-green-800' :
                                option.route.efficiency === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {option.route.efficiency}
                              </span>
                            </div>
                          </div>
                          
                          <p className="mt-2 text-xs text-gray-500">
                            {option.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detalhamento da rota selecionada */}
                {selectedRouteKey && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Detalhamento - {selectedRoute?.tag}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Informações da Rota */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Informações da Rota
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Origem:</span>
                            <span className="text-gray-900">{result.metadata.origin}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Destino:</span>
                            <span className="text-gray-900">{result.metadata.destination}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Distância:</span>
                            <span className="text-gray-900">{selectedRoute?.route.distance.toFixed(1)} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tempo estimado:</span>
                            <span className="text-gray-900">{formatTime(selectedRoute?.route.duration || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Veículo:</span>
                            <span className="text-gray-900">{selectedRoute?.vehicleSpecs.tipo}</span>
                          </div>
                        </div>

                        {/* Botão para ver imagem da rota */}
                        {selectedRoute?.route.routeImageUrl ? (
                          <div className="mt-4">
                            <button
                              onClick={() => openRouteImageModal(selectedRoute.route.routeImageUrl!)}
                              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 transition-colors flex items-center justify-center space-x-2"
                            >
                              <span>🗺️</span>
                              <span>Ver Imagem da Rota</span>
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <div className="w-full bg-gray-50 text-gray-500 px-4 py-2 rounded-lg border border-gray-200 text-center text-sm">
                              {selectedRoute?.route ? 'Imagem da rota não disponível para esta consulta' : 'Nenhuma rota selecionada'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Breakdown de Custos */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Breakdown de Custos
                        </h4>
                        <div className="space-y-3">
                          {/* Seção 1: Custos Operacionais Estimados */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                              SEUS CUSTOS OPERACIONAIS (Estimativa)
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">• Combustível:</span>
                                <span className="text-gray-600">{formatCurrency(selectedRoute?.costBreakdown.fuelCost || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">• Manutenção:</span>
                                <span className="text-gray-600">{formatCurrency(selectedRoute?.costBreakdown.maintenanceCost || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">• Motorista:</span>
                                <span className="text-gray-600">{formatCurrency(selectedRoute?.costBreakdown.driverCost || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">• Operacional:</span>
                                <span className="text-gray-600">{formatCurrency(selectedRoute?.costBreakdown.operationalCost || 0)}</span>
                              </div>
                              <div className="border-t border-gray-300 pt-1 flex justify-between font-medium text-xs">
                                <span className="text-gray-600">Total Estimado:</span>
                                <span className="text-gray-700">
                                  {formatCurrency(
                                    (selectedRoute?.costBreakdown.fuelCost || 0) +
                                    (selectedRoute?.costBreakdown.maintenanceCost || 0) +
                                    (selectedRoute?.costBreakdown.driverCost || 0) +
                                    (selectedRoute?.costBreakdown.operationalCost || 0)
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Seção 2: Base de Cobrança Oficial */}
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div className="text-xs font-medium text-blue-800 mb-2 uppercase tracking-wide">
                              BASE DE COBRANÇA OFICIAL ANTT
                            </div>
                            <div className="space-y-1 text-sm">
                              {selectedRoute?.costBreakdown.freightTableCost && (
                                <div className="flex justify-between">
                                  <span className="text-blue-700">Tabela de Frete ANTT</span>
                                  <span className="text-blue-900 font-semibold">{formatCurrency(selectedRoute.costBreakdown.freightTableCost)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-blue-700">Pedágios:</span>
                                <span className="text-blue-900">{formatCurrency(selectedRoute?.costBreakdown.tollCost || 0)}</span>
                              </div>
                              <div className="border-t border-blue-300 pt-1 flex justify-between font-bold">
                                <span className="text-blue-800">Valor Base Oficial:</span>
                                <span className="text-blue-900">{formatCurrency(selectedRoute?.costBreakdown.totalCost || 0)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Seção 3: Cobrança Final */}
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <div className="text-xs font-medium text-green-800 mb-2 uppercase tracking-wide">
                              SUA COBRANÇA AO CLIENTE
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-green-700">Valor Base (ANTT):</span>
                                <span className="text-green-900">{formatCurrency(selectedRoute?.costBreakdown.totalCost || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-700">Sua Margem ({result.metadata.profitMargin}%):</span>
                                <span className="text-green-900">{formatCurrency(selectedRoute?.costBreakdown.profitMargin || 0)}</span>
                              </div>
                              <div className="border-t border-green-300 pt-2 flex justify-between font-bold text-lg">
                                <span className="text-green-800">Preço Final:</span>
                                <span className="text-green-900 bg-green-100 px-2 py-1 rounded">{formatCurrency(selectedRoute?.costBreakdown.finalPrice || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 1. Tabela de Pedágios */}
                    {selectedRoute?.route.tollStations && selectedRoute.route.tollStations.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Pedágios na Rota
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nome
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Localização
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Concessionária
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {selectedRoute.route.tollStations.map((toll, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-sm text-gray-900">
                                      {toll.name}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                      {toll.location.address}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                      {toll.concessionaire}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium">
                                      {formatCurrency(toll.cost)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-100">
                                <tr>
                                  <td colSpan={3} className="px-3 py-2 text-sm font-medium text-gray-900">
                                    Total de Pedágios:
                                  </td>
                                  <td className="px-3 py-2 text-sm font-bold text-gray-900 text-right">
                                    {formatCurrency(selectedRoute.route.tollStations.reduce((sum, toll) => sum + toll.cost, 0))}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. Postos de Pesagem (Balanças) */}
                    {selectedRoute?.route.weighStations && selectedRoute.route.weighStations.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Postos de Pesagem na Rota
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nome
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Localização
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rodovia
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sentido
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Concessionária
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {selectedRoute.route.weighStations.map((weighStation, index) => (
                                  <tr key={weighStation.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-sm text-gray-900">
                                      {weighStation.name}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                      {weighStation.location.address}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                      {weighStation.roadway} KM {weighStation.km}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                      {weighStation.direction}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                      {weighStation.concessionaire}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-100">
                                <tr>
                                  <td colSpan={5} className="px-3 py-2 text-sm font-medium text-gray-900">
                                    Total de Postos de Pesagem: {selectedRoute.route.weighStations.length}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. Dados da Tabela de Frete ANTT */}
                    {selectedRoute?.route.freightTableData && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Dados da Tabela de Frete ANTT
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">

                          {/* Controles de Navegação */}
                          <div className="bg-white p-4 rounded-lg border">
                            <h5 className="text-sm font-medium text-gray-900 mb-3">
                              Explorar Tabela de Frete
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                              {/* Seletor de Categoria */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Categoria ANTT:
                                </label>
                                <select
                                  value={selectedFreightCategory}
                                  onChange={(e) => setSelectedFreightCategory(e.target.value)}
                                  className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {(() => {
                                    const dados = (selectedRoute.route.freightTableData as any)?.dados
                                    if (!dados) return <option value="A">A</option>

                                    return Object.keys(dados).map(categoria => (
                                      <option key={categoria} value={categoria}>
                                        Categoria {categoria}
                                      </option>
                                    ))
                                  })()}
                                </select>
                              </div>

                              {/* Seletor de Eixos */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Número de Eixos:
                                </label>
                                <select
                                  value={selectedFreightAxis}
                                  onChange={(e) => setSelectedFreightAxis(e.target.value)}
                                  className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {(() => {
                                    const dados = (selectedRoute.route.freightTableData as any)?.dados
                                    if (!dados || !dados[selectedFreightCategory]) return <option value="2">2 eixos</option>

                                    return Object.keys(dados[selectedFreightCategory]).map(eixos => (
                                      <option key={eixos} value={eixos}>
                                        {eixos} eixo{eixos !== '1' ? 's' : ''}
                                      </option>
                                    ))
                                  })()}
                                </select>
                              </div>
                            </div>

                            {/* Indicador da Consulta Atual */}
                            <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                              <p className="text-xs text-blue-700">
                                <span className="font-medium">Consulta atual:</span> Categoria {formData.freightCategory} • {formData.cargoType.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>

                          {/* Tabela de Valores */}
                          {selectedRoute?.route.freightTableData && 'dados' in selectedRoute.route.freightTableData && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">
                                Valores para Categoria {selectedFreightCategory} - {selectedFreightAxis} eixo{selectedFreightAxis !== '1' ? 's' : ''}
                              </h5>
                              <div className="bg-white rounded-lg border overflow-hidden">
                                {(() => {
                                  const dados = (selectedRoute.route.freightTableData as any).dados

                                  if (!dados || !dados[selectedFreightCategory] || !dados[selectedFreightCategory][selectedFreightAxis]) {
                                    return (
                                      <div className="p-4 text-center text-gray-500">
                                        <p className="text-sm">Dados não disponíveis para esta combinação</p>
                                        <p className="text-xs">Categoria {selectedFreightCategory} • {selectedFreightAxis} eixo{selectedFreightAxis !== '1' ? 's' : ''}</p>
                                      </div>
                                    )
                                  }

                                  const valores = dados[selectedFreightCategory][selectedFreightAxis]
                                  const tiposCarga = Object.keys(valores).filter(tipo => valores[tipo] > 0)

                                  if (tiposCarga.length === 0) {
                                    return (
                                      <div className="p-4 text-center text-gray-500">
                                        <p className="text-sm">Nenhum valor disponível para esta categoria/eixo</p>
                                      </div>
                                    )
                                  }

                                  return (
                                    <div className="divide-y divide-gray-200">
                                      {tiposCarga.map(tipo => (
                                        <div
                                          key={tipo}
                                          className={`p-3 flex justify-between items-center ${
                                            tipo === formData.cargoType && selectedFreightCategory === formData.freightCategory
                                              ? 'bg-blue-50 border-l-4 border-blue-400'
                                              : 'hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className="flex items-center">
                                            <span className="text-sm text-gray-900 capitalize font-medium">
                                              {tipo.replace(/_/g, ' ')}
                                            </span>
                                            {tipo === formData.cargoType && selectedFreightCategory === formData.freightCategory && (
                                              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                Selecionado
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-sm font-bold text-gray-900">
                                            {formatCurrency(valores[tipo])}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )
                                })()}
                              </div>
                            </div>
                          )}

                          {/* Resolução ANTT */}
                          {selectedRoute?.route.freightTableData && 'antt_resolucao' in selectedRoute.route.freightTableData && (
                            <div className="border-t border-gray-200 pt-4">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">
                                Legislação
                              </h5>
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-blue-700 font-medium">Resolução:</span>
                                    <span className="text-blue-900">
                                      {String((selectedRoute.route.freightTableData.antt_resolucao as any)?.nome || '')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-blue-700 font-medium">Data:</span>
                                    <span className="text-blue-900">
                                      {String((selectedRoute.route.freightTableData.antt_resolucao as any)?.data || '')}
                                    </span>
                                  </div>
                                  {(selectedRoute.route.freightTableData.antt_resolucao as any)?.url && (
                                    <div className="mt-3">
                                      <a
                                        href={String((selectedRoute.route.freightTableData.antt_resolucao as any).url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 underline"
                                      >
                                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Ver Resolução Completa
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Estatísticas Históricas */}
                {result.statistics && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Dados Históricos desta Rota
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {result.statistics.totalTrips}
                        </div>
                        <div className="text-sm text-gray-500">Viagens</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(result.statistics.averageCost)}
                        </div>
                        <div className="text-sm text-gray-500">Custo Médio</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {result.statistics.averageDistance.toFixed(1)} km
                        </div>
                        <div className="text-sm text-gray-500">Distância Média</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          result.statistics.costTrend === 'increasing' ? 'text-red-600' :
                          result.statistics.costTrend === 'decreasing' ? 'text-green-600' :
                          'text-gray-600'
                        }`}>
                          {result.statistics.costTrend === 'increasing' ? '📈' :
                           result.statistics.costTrend === 'decreasing' ? '📉' : '➖'}
                        </div>
                        <div className="text-sm text-gray-500">Tendência</div>
                      </div>
                    </div>
                    
                    {result.statistics.commonIssues.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Problemas Comuns:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.statistics.commonIssues.slice(0, 3).map((issue, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full"
                            >
                              {issue.issue} ({issue.frequency}x)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Debug Panel - Movido para baixo e em linha separada */}
        {(debugInfo.payload || debugInfo.response || debugInfo.error) && (
          <div className="mt-8 space-y-6">
            <ApiDebugPanel
              payload={debugInfo.payload}
              response={debugInfo.response}
              error={debugInfo.error}
              isLoading={calculating}
              url={debugInfo.url}
              qualpPayload={debugInfo.qualpPayload}
              qualpResponse={debugInfo.qualpResponse}
              qualpUrl={debugInfo.qualpUrl}
            />

            {/* Mapa da Rota Principal - Expandido */}
            {result && selectedRoute && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Visualização da Rota - {selectedRoute?.tag}
                </h3>

                <GoogleRouteMap
                  polyline={selectedRoute?.route.geometry}
                  originAddress={result.metadata.origin}
                  destinationAddress={result.metadata.destination}
                  originCoords={selectedRoute?.route.points?.[0] ? [selectedRoute?.route.points[0].latitude, selectedRoute?.route.points[0].longitude] : undefined}
                  destCoords={selectedRoute?.route.points?.[1] ? [selectedRoute?.route.points[1].latitude, selectedRoute?.route.points[1].longitude] : undefined}
                  className="h-[500px] w-full rounded-lg"
                />

                <div className="mt-4 text-xs text-gray-500">
                  Mapa fornecido por Google Maps<br/> Dados da rota: API Lets
                </div>
              </div>
            )}

          </div>
        )}

        {/* Modal da Imagem da Rota */}
        {showRouteImageModal && routeImageUrl && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50">
            {/* Overlay - clicking outside closes modal */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={closeRouteImageModal}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Imagem da Rota
                </h3>
                <button
                  onClick={closeRouteImageModal}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Image Content */}
              <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
                <div className="text-center">

                  {!imageLoadError ? (
                    <img
                      src={routeImageUrl}
                      alt="Imagem da rota"
                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      onError={(e) => {
                        setImageLoadError(true)
                      }}
                      onLoad={() => {
                        // Imagem carregada com sucesso
                      }}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 bg-red-50 border-2 border-dashed border-red-300 rounded-lg">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.684-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-red-900">Erro ao carregar imagem</h3>
                          <p className="mt-1 text-sm text-red-600">
                            A imagem da rota não pôde ser carregada diretamente.
                            Isso geralmente é devido a restrições de CORS da API Qualp.
                          </p>
                          <p className="mt-2 text-xs text-red-500">
                            Use o botão "Abrir em Nova Aba" abaixo para ver a imagem diretamente no site da Qualp.
                          </p>
                        </div>
                      </div>

                      {/* Tentar iframe como alternativa */}
                      <div className="border rounded-lg overflow-hidden">
                        <iframe
                          src={routeImageUrl}
                          title="Imagem da rota"
                          className="w-full h-96"
                          onError={() => {
                            // Iframe falhou ao carregar
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center p-4 border-t border-gray-200 bg-gray-50">
                <a
                  href={routeImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir em Nova Aba
                </a>
                <button
                  onClick={closeRouteImageModal}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}