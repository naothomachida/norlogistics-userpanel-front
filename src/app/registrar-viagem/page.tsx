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
}

export default function RegistrarViagemPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distance: '',
    actualCost: '',
    fuelConsumed: '',
    duration: '',
    vehicleId: '',
    driverNotes: '',
    issues: [] as string[]
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [availableIssues] = useState([
    'Trânsito intenso',
    'Estrada em obras',
    'Problemas mecânicos',
    'Atraso na carga/descarga',
    'Condições climáticas adversas',
    'Pedágios não previstos',
    'Combustível mais caro',
    'Desvios na rota'
  ])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchVeiculos()
  }, [isAuthenticated, router])

  const fetchVeiculos = useCallback(async () => {
    try {
      const response = await fetch(`/api/veiculos?transportadorId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setVeiculos(data)
      }
    } catch (error) {
      console.error('Erro ao buscar veículos:', error)
    }
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.origin.trim() || !formData.destination.trim() || 
        !formData.distance || !formData.actualCost || !formData.vehicleId) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch('/api/routes/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: formData.origin.trim(),
          destination: formData.destination.trim(),
          distance: parseFloat(formData.distance),
          actualCost: parseFloat(formData.actualCost),
          fuelConsumed: formData.fuelConsumed ? parseFloat(formData.fuelConsumed) : undefined,
          duration: formData.duration ? parseInt(formData.duration) : undefined,
          vehicleId: formData.vehicleId,
          issues: formData.issues,
          notes: formData.driverNotes
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar viagem')
      }

      setSuccess('Viagem registrada com sucesso! Os dados serão usados para melhorar futuras estimativas.')
      
      // Limpar formulário
      setFormData({
        origin: '',
        destination: '',
        distance: '',
        actualCost: '',
        fuelConsumed: '',
        duration: '',
        vehicleId: '',
        driverNotes: '',
        issues: []
      })
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const toggleIssue = (issue: string) => {
    const newIssues = formData.issues.includes(issue)
      ? formData.issues.filter(i => i !== issue)
      : [...formData.issues, issue]
    
    setFormData({ ...formData, issues: newIssues })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (!isAuthenticated) {
    return <div>Carregando...</div>
  }

  const costPerKm = formData.distance && formData.actualCost 
    ? (parseFloat(formData.actualCost) / parseFloat(formData.distance)).toFixed(2)
    : '0.00'

  return (
    <Layout
      title="Registrar Viagem Realizada"
      description="Registre os dados reais da viagem para melhorar nossos cálculos futuros"
    >
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informações da Rota */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informações da Rota
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Origem *
                    </label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: São Paulo, SP"
                      required
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Rio de Janeiro, RJ"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dados da Viagem */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Dados Reais da Viagem
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Distância Percorrida (km) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.distance}
                      onChange={(e) => setFormData({...formData, distance: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 450.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Custo Total Real (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.actualCost}
                      onChange={(e) => setFormData({...formData, actualCost: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 1250.75"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Combustível Consumido (L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.fuelConsumed}
                      onChange={(e) => setFormData({...formData, fuelConsumed: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 75.5"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tempo Total (minutos)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 360"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Veículo Utilizado *
                    </label>
                    <select
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione um veículo</option>
                      {veiculos.map((veiculo) => (
                        <option key={veiculo.id} value={veiculo.id}>
                          {veiculo.placa} - {veiculo.modelo} ({veiculo.tipo})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Indicadores Calculados */}
                {formData.distance && formData.actualCost && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Indicadores Calculados
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Custo por KM:</span>
                        <span className="ml-2 font-medium">{formatCurrency(parseFloat(costPerKm))}</span>
                      </div>
                      {formData.fuelConsumed && formData.distance && (
                        <div>
                          <span className="text-blue-600">Consumo:</span>
                          <span className="ml-2 font-medium">
                            {(parseFloat(formData.distance) / parseFloat(formData.fuelConsumed)).toFixed(1)} km/l
                          </span>
                        </div>
                      )}
                      {formData.duration && formData.distance && (
                        <div>
                          <span className="text-blue-600">Velocidade Média:</span>
                          <span className="ml-2 font-medium">
                            {((parseFloat(formData.distance) / parseInt(formData.duration)) * 60).toFixed(1)} km/h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Problemas Encontrados */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Problemas Encontrados na Rota
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableIssues.map((issue) => (
                    <label
                      key={issue}
                      className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                        formData.issues.includes(issue)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.issues.includes(issue)}
                        onChange={() => toggleIssue(issue)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">{issue}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Observações Adicionais
                </label>
                <textarea
                  value={formData.driverNotes}
                  onChange={(e) => setFormData({...formData, driverNotes: e.target.value})}
                  rows={4}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva qualquer observação importante sobre a viagem..."
                />
              </div>

              {/* Mensagens */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="text-sm text-red-600">{error}</div>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-sm text-green-600">{success}</div>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Registrar Viagem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}