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
    // Coordenadas básicas para cidades principais
    const cityCoordinates: Record<string, [number, number]> = {
      'sorocaba': [-23.5018, -47.4581],
      'itu': [-23.2640, -47.2996],
      'sao paulo': [-23.5505, -46.6333],
      'campinas': [-22.9056, -47.0608],
      'jundiai': [-23.1864, -46.8842],
      'santos': [-23.9608, -46.3331]
    }

    const cityKey = address.toLowerCase().replace(/\s+/g, '').replace(',', '')

    if (cityCoordinates[cityKey]) {
      const [lat, lng] = cityCoordinates[cityKey]
      return { latitude: lat, longitude: lng, address }
    }

    throw new Error(`Cidade não encontrada: ${address}`)
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

      // Chamar API de roteamento v4 do Qualp
      const coordinates = [
        [originPoint.longitude, originPoint.latitude],
        ...waypointPoints.map(point => [point.longitude, point.latitude]),
        [destinationPoint.longitude, destinationPoint.latitude]
      ]

      // Request body baseado na documentação oficial
      const requestBody = {
        "locations": [
          `${originPoint.address}`,
          `${destinationPoint.address}`
        ],
        "config": {
          "route": {
            "calculate_return": false,
            "alternative_routes": true,
            "optimized_route": false,
            "optimized_route_destination": false,
            "avoid_locations": false,
            "avoid_locations_key": "",
            "type_route": "efficient",
            "vehicle": {
              "type": "truck",
              "axis": "all",
              "top_speed": null
            },
            "tolls": {
              "interactive_date": new Date().toLocaleDateString('pt-BR')
            },
            "freight_table": {
              "category": "all",
              "freight_load": "all",
              "axis": "all"
            },
            "fuel_consumption": {
              "fuel_price": params.fuelPrice || 5.5,
              "fuel_liters": 0.0
            },
            "private_places": {
              "areas": false,
              "categorias": false,
              "constants": false,
              "products": false,
              "services": false,
              "max_distance_from_location_in_route": 1000
            },
            "show": {
              "tolls": true,
              "manoeuver": false,
              "static_image": false,
              "polylines": true,
              "url": false,
              "exception_key": false
            },
            "format": "JSON"
          }
        }
      }

      const routeResponse = await fetch(`${this.baseUrl}/rotas/v4`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Token': this.apiKey
        },
        body: JSON.stringify(requestBody)
      })

      if (!routeResponse.ok) {
        throw new Error(`Erro no cálculo de rotas: ${routeResponse.statusText}`)
      }

      const routeData = await routeResponse.json()

      // Processar as rotas retornadas do Qualp v4
      const routes = this.processQualPResponse(routeData, originPoint, destinationPoint, waypointPoints, params)

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
      throw new Error(`Falha no cálculo de rotas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
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
   * Mapeia tipos de veículos para perfis do Qualp
   */
  private mapVehicleTypeToProfile(vehicleType: string): string {
    const profileMap: Record<string, string> = {
      'carro': 'car',
      'moto': 'car', // Usar car como fallback
      'caminhao_pequeno': 'truck',
      'caminhao_medio': 'truck',
      'caminhao_grande': 'truck'
    }

    return profileMap[vehicleType] || 'car'
  }

  /**
   * Processa a resposta da API Qualp v4
   */
  private processQualPResponse(
    routeData: any,
    originPoint: QualRoutePoint,
    destinationPoint: QualRoutePoint,
    waypointPoints: QualRoutePoint[],
    params: RouteCalculationParams
  ): QualRouteOption[] {
    if (!routeData || !routeData.distancia) {
      throw new Error('Resposta inválida da API Qualp')
    }

    // Baseado na documentação, a resposta contém:
    // - distancia: { texto, valor }
    // - duracao: { texto, valor }
    // - distancia_nao_pavimentada: { texto, valor }
    // - endereco_inicio, endereco_fim
    // - coordenada_inicio, coordenada_fim
    // - pedagios: []

    const distanceKm = parseFloat(routeData.distancia.valor) || 0
    const durationMin = parseFloat(routeData.duracao.valor) || 0

    // Extrair geometria da rota (polyline)
    const geometry = routeData.polyline || routeData.geometry || ''

    // Extrair custos de pedágio
    const tollCost = this.extractTollCostFromQualPResponse(routeData)

    // Calcular custo estimado
    const estimatedCost = this.calculateEstimatedCost(distanceKm, params)

    // Calcular eficiência
    const efficiency = this.calculateEfficiency(distanceKm, durationMin, estimatedCost)

    // Por enquanto retornamos uma única rota, mas a API pode retornar múltiplas
    return [{
      id: `qualp_route_1`,
      distance: Math.round(distanceKm * 10) / 10,
      duration: Math.round(durationMin),
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      efficiency,
      geometry,
      points: [originPoint, ...waypointPoints, destinationPoint],
      tollCost: Math.round(tollCost * 100) / 100
    }]
  }

  /**
   * Extrai custos de pedágio da resposta Qualp v4
   */
  private extractTollCostFromQualPResponse(routeData: any): number {
    if (!routeData.pedagios || !Array.isArray(routeData.pedagios)) {
      return 0
    }

    return routeData.pedagios.reduce((total: number, pedagio: any) => {
      // Baseado na documentação, os pedágios têm estrutura específica
      return total + (parseFloat(pedagio.valor) || 0)
    }, 0)
  }

  /**
   * Extrai custos de pedágio dos segmentos da rota
   */
  private extractTollCost(segments: any[]): number {
    if (!segments || !Array.isArray(segments)) return 0

    return segments.reduce((total, segment) => {
      // Procurar por informações de pedágio nos segmentos
      if (segment.toll_cost || segment.tollCost) {
        return total + (segment.toll_cost || segment.tollCost)
      }
      return total
    }, 0)
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
      const response = await fetch(`${this.baseUrl}/pedagios/v1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': this.apiKey
        },
        body: JSON.stringify({
          polyline: route.geometry,
          vehicle: {
            type: 'truck',
            axis: 'all'
          }
        })
      })

      if (!response.ok) {
        return { totalTollCost: 0, tollStations: [] }
      }

      const tollData = await response.json()

      const tollStations = (tollData.data?.tolls || []).map((toll: any) => ({
        name: toll.name || toll.station_name || 'Pedágio',
        cost: toll.cost || toll.price || 0,
        location: {
          latitude: toll.latitude || toll.lat || 0,
          longitude: toll.longitude || toll.lng || 0,
          address: toll.address || toll.name || ''
        }
      }))

      const totalTollCost = tollStations.reduce((sum: number, station: any) => sum + station.cost, 0)

      return {
        totalTollCost,
        tollStations
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