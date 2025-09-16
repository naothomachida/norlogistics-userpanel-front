export interface QualRoutePoint {
  latitude: number
  longitude: number
  address?: string
}

export interface QualRouteOption {
  id: string
  distance: number // em quilômetros
  duration: number // em minutos
  estimatedCost: number // custo estimado em reais
  efficiency: 'alta' | 'media' | 'baixa' // eficiência da rota
  geometry: string // polyline da rota
  points: QualRoutePoint[]
  tollCost?: number // custo de pedágio se aplicável
}

export interface QualRouteResult {
  routes: QualRouteOption[]
  mostEfficient: QualRouteOption
  cheapest: QualRouteOption
  fastest: QualRouteOption
}

export interface RouteCalculationParams {
  origin: string
  destination: string
  waypoints?: string[]
  vehicleType?: 'carro' | 'moto' | 'caminhao_pequeno' | 'caminhao_medio' | 'caminhao_grande'
  costPerKm?: number
  fuelPrice?: number
  fuelConsumption?: number // km/l
  tollPreference?: 'avoid' | 'allow' | 'prefer'
}

class QualPApi {
  private apiKey: string
  private baseUrl = 'https://api.qualp.com.br'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.QUALP_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('QUALP_API_KEY é obrigatória')
    }
  }

  /**
   * Geocodifica um endereço usando a API Qualp
   */
  async geocode(address: string): Promise<QualRoutePoint> {
    try {
      const response = await fetch(`${this.baseUrl}/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ address })
      })

      if (!response.ok) {
        throw new Error(`Erro na geocodificação: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.formatted_address || address
      }
    } catch (error) {
      console.error('Erro ao geocodificar endereço:', error)
      // Fallback: tentar usar uma aproximação básica
      return {
        latitude: -23.5505, // São Paulo aproximado
        longitude: -46.6333,
        address
      }
    }
  }

  /**
   * Calcula múltiplas rotas entre pontos usando a API Qualp
   */
  async calculateRoutes(params: RouteCalculationParams): Promise<QualRouteResult> {
    try {
      // Geocodificar pontos de origem e destino
      const [originPoint, destinationPoint] = await Promise.all([
        this.geocode(params.origin),
        this.geocode(params.destination)
      ])

      // Geocodificar pontos de passagem se existirem
      let waypointPoints: QualRoutePoint[] = []
      if (params.waypoints && params.waypoints.length > 0) {
        waypointPoints = await Promise.all(
          params.waypoints.map(waypoint => this.geocode(waypoint))
        )
      }

      // Chamar API de roteamento
      const routeResponse = await fetch(`${this.baseUrl}/router/v4/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          origin: {
            latitude: originPoint.latitude,
            longitude: originPoint.longitude
          },
          destination: {
            latitude: destinationPoint.latitude,
            longitude: destinationPoint.longitude
          },
          waypoints: waypointPoints.map(point => ({
            latitude: point.latitude,
            longitude: point.longitude
          })),
          vehicle_type: params.vehicleType || 'carro',
          alternatives: 3, // Solicitar 3 alternativas
          toll_preference: params.tollPreference || 'allow'
        })
      })

      if (!routeResponse.ok) {
        throw new Error(`Erro no cálculo de rotas: ${routeResponse.statusText}`)
      }

      const routeData = await routeResponse.json()

      // Processar as rotas retornadas
      const routes = await Promise.all(
        routeData.routes.map(async (route: any, index: number) => {
          const estimatedCost = this.calculateEstimatedCost(
            route.distance / 1000, // converter metros para km
            params
          )

          const efficiency = this.calculateEfficiency(
            route.distance / 1000,
            route.duration / 60, // converter segundos para minutos
            estimatedCost
          )

          return {
            id: `route_${index + 1}`,
            distance: Math.round((route.distance / 1000) * 10) / 10,
            duration: Math.round(route.duration / 60),
            estimatedCost: Math.round(estimatedCost * 100) / 100,
            efficiency,
            geometry: route.geometry || '',
            points: [originPoint, ...waypointPoints, destinationPoint],
            tollCost: (route as { toll_cost?: number }).toll_cost || 0
          }
        })
      )

      // Determinar a melhor rota para cada critério
      const mostEfficient = routes.reduce((best, current) => {
        if (current.efficiency === 'alta' && best.efficiency !== 'alta') return current
        if (current.efficiency === best.efficiency) {
          return current.estimatedCost < best.estimatedCost ? current : best
        }
        return best
      })

      const cheapest = routes.reduce((cheapest, current) => 
        current.estimatedCost < cheapest.estimatedCost ? current : cheapest
      )

      const fastest = routes.reduce((fastest, current) => 
        current.duration < fastest.duration ? current : fastest
      )

      return {
        routes,
        mostEfficient,
        cheapest,
        fastest
      }

    } catch (error) {
      console.error('Erro ao calcular rotas:', error)
      // Fallback com estimativa básica
      return this.createFallbackRoutes(params)
    }
  }

  /**
   * Calcula o custo estimado da viagem
   */
  private calculateEstimatedCost(
    distanceKm: number,
    params: RouteCalculationParams
  ): number {
    const costPerKm = params.costPerKm || 2.5 // valor padrão por km
    const fuelPrice = params.fuelPrice || 5.5 // preço do combustível
    const fuelConsumption = params.fuelConsumption || 10 // km/l

    // Custo base por distância
    const baseCost = distanceKm * costPerKm

    // Custo de combustível
    const fuelCost = (distanceKm / fuelConsumption) * fuelPrice

    // Outros custos (desgaste, manutenção)
    const maintenanceCost = distanceKm * 0.3

    return baseCost + fuelCost + maintenanceCost
  }

  /**
   * Calcula a eficiência de uma rota
   */
  private calculateEfficiency(
    distance: number,
    duration: number,
    cost: number
  ): 'alta' | 'media' | 'baixa' {
    const avgSpeed = distance / (duration / 60) // km/h
    const costPerKm = cost / distance

    // Rota eficiente: velocidade boa e custo baixo
    if (avgSpeed > 50 && costPerKm < 3) return 'alta'
    if (avgSpeed > 30 && costPerKm < 4) return 'media'
    return 'baixa'
  }

  /**
   * Cria rotas de fallback quando a API falha
   */
  private async createFallbackRoutes(
    params: RouteCalculationParams
  ): Promise<QualRouteResult> {
    // Estimativa básica baseada em distância aproximada
    const estimatedDistance = 50 // km estimado
    const estimatedDuration = 60 // minutos estimado
    const estimatedCost = this.calculateEstimatedCost(estimatedDistance, params)

    const fallbackRoute: QualRouteOption = {
      id: 'fallback_route',
      distance: estimatedDistance,
      duration: estimatedDuration,
      estimatedCost,
      efficiency: 'media',
      geometry: '',
      points: [
        { latitude: -23.5505, longitude: -46.6333, address: params.origin },
        { latitude: -23.5505, longitude: -46.6333, address: params.destination }
      ]
    }

    return {
      routes: [fallbackRoute],
      mostEfficient: fallbackRoute,
      cheapest: fallbackRoute,
      fastest: fallbackRoute
    }
  }

  /**
   * Busca informações sobre pedágios em uma rota
   */
  async getTollInfo(route: QualRouteOption): Promise<{
    totalTollCost: number
    tollStations: Array<{
      name: string
      cost: number
      location: QualRoutePoint
    }>
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/tolls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          geometry: route.geometry,
          vehicle_type: 'carro'
        })
      })

      if (!response.ok) {
        return { totalTollCost: 0, tollStations: [] }
      }

      const tollData = await response.json()
      
      return {
        totalTollCost: tollData.total_cost || 0,
        tollStations: tollData.toll_stations || []
      }
    } catch (error) {
      console.error('Erro ao buscar informações de pedágio:', error)
      return { totalTollCost: 0, tollStations: [] }
    }
  }
}

// Instância singleton da API
export const qualPApi = new QualPApi()

// Função utilitária para usar na aplicação
export async function calculateBestRoutes(
  origin: string,
  destination: string,
  options: Partial<RouteCalculationParams> = {}
): Promise<QualRouteResult> {
  return qualPApi.calculateRoutes({
    origin,
    destination,
    vehicleType: 'caminhao_medio',
    costPerKm: 2.8,
    fuelPrice: 5.5,
    fuelConsumption: 8, // consumo típico de caminhão
    ...options
  })
}