'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Layout from '@/components/Layout'

// Dynamically import the map component to avoid SSR issues
const RouteMap = dynamic(() => import('@/components/RouteMap'), {
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
    points?: Array<{
      latitude: number
      longitude: number
      address?: string
    }>
    freightTableData?: any
    tollCost?: number
  }
  costBreakdown: {
    fuelCost: number
    maintenanceCost: number
    driverCost: number
    tollCost: number
    operationalCost: number
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
    showPolyline: true
  })
  
  const [result, setResult] = useState<RouteResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState('')
  const [selectedRouteKey, setSelectedRouteKey] = useState<string | null>(null)

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
    
    try {
      const response = await fetch('/api/routes/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          waypoints: formData.waypoints.filter(w => w.trim() !== ''),
          vehicleType: formData.vehicleQualPType,
          vehicleAxis: formData.vehicleAxis,
          topSpeed: formData.topSpeed,
          fuelConsumption: formData.fuelConsumption
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao calcular rotas')
      }

      setResult(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
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
    >
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
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

                {/* Configurações QUALP */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Configurações QUALP
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Categoria de Veículo QUALP
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

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCalculate}
                  disabled={calculating}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {calculating ? 'Calculando...' : 'Calcular Rotas'}
                </button>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-2">
            {result && (
              <div className="space-y-6">
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
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                              option.key === 'cheapest' ? 'bg-green-500' :
                              option.key === 'fastest' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}>
                              <span className="text-white text-sm">
                                {option.key === 'cheapest' ? '💰' :
                                 option.key === 'fastest' ? '⚡' : '⚖️'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
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
                      </div>

                      {/* Breakdown de Custos */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Breakdown de Custos
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Combustível:</span>
                            <span className="text-gray-900">{formatCurrency(selectedRoute?.costBreakdown.fuelCost || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Manutenção:</span>
                            <span className="text-gray-900">{formatCurrency(selectedRoute?.costBreakdown.maintenanceCost || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Motorista:</span>
                            <span className="text-gray-900">{formatCurrency(selectedRoute?.costBreakdown.driverCost || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pedágios:</span>
                            <span className="text-gray-900">{formatCurrency(selectedRoute?.costBreakdown.tollCost || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Operacional:</span>
                            <span className="text-gray-900">{formatCurrency(selectedRoute?.costBreakdown.operationalCost || 0)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-medium">
                            <span className="text-gray-900">Custo Total:</span>
                            <span className="text-gray-900">{formatCurrency(selectedRoute?.costBreakdown.totalCost || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Margem ({result.metadata.profitMargin}%):</span>
                            <span className="text-gray-900">{formatCurrency(selectedRoute?.costBreakdown.profitMargin || 0)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-bold text-lg">
                            <span className="text-gray-900">Preço Final:</span>
                            <span className="text-blue-600">{formatCurrency(selectedRoute?.costBreakdown.finalPrice || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dados da Tabela de Frete QUALP */}
                    {selectedRoute?.route.freightTableData && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Dados da Tabela de Frete QUALP
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Categoria:</span>
                              <span className="text-gray-900 ml-2">{formData.freightCategory}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Tipo de Carga:</span>
                              <span className="text-gray-900 ml-2">{formData.cargoType}</span>
                            </div>
                          </div>

                          {selectedRoute?.route.freightTableData?.antt_resolucao && (
                            <div className="mt-3 text-xs text-gray-600">
                              <strong>Resolução ANTT:</strong> {selectedRoute?.route.freightTableData?.antt_resolucao?.nome}<br/>
                              <strong>Data:</strong> {selectedRoute?.route.freightTableData?.antt_resolucao?.data}
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

          {/* Mapa da Rota */}
          {result && selectedRoute && (
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Visualização da Rota
                </h3>

                <RouteMap
                  polyline={selectedRoute?.route.geometry}
                  originAddress={result.metadata.origin}
                  destinationAddress={result.metadata.destination}
                  originCoords={selectedRoute?.route.points?.[0] ? [selectedRoute?.route.points[0].latitude, selectedRoute?.route.points[0].longitude] : undefined}
                  destCoords={selectedRoute?.route.points?.[1] ? [selectedRoute?.route.points[1].latitude, selectedRoute?.route.points[1].longitude] : undefined}
                  className="h-96 w-full rounded-lg"
                />

                <div className="mt-4 text-xs text-gray-500">
                  Mapa fornecido por OpenStreetMap • Dados da rota: QUALP API
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}