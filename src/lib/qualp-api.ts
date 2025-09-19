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
  freightTableData?: Record<string, unknown> // dados da tabela de frete
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
  vehicleType?: 'truck' | 'car'
  vehicleAxis?: string | number
  topSpeed?: string | number | null
  costPerKm?: number
  fuelPrice?: number
  fuelConsumption?: number // km/l
  tollPreference?: 'avoid' | 'allow' | 'prefer'
  showTolls?: boolean
  showFreightTable?: boolean
  showPolyline?: boolean
}

// Interface para resposta da API QUALP real
export interface QualPApiResponse {
  distancia: {
    texto: string
    valor: number
  }
  distancia_nao_pavimentada: {
    texto: string
    valor: number
    percentual_texto: string
    percentual_valor: number
  }
  duracao: {
    texto: string
    valor: number
  }
  endereco_inicio: string
  endereco_fim: string
  coordenada_inicio: string
  coordenada_fim: string
  pedagios: unknown[]
  tabela_frete: Record<string, unknown>
  balancas: unknown[]
  polilinha_codificada: string
  link_site_qualp: string
  locais: string[]
  id_transacao: number
  roteador_selecionado: string
  calcular_volta: boolean
  otimizar_rota: boolean
  meta_data: string
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
   * Extrai coordenadas de uma string de coordenadas do QUALP
   */
  private parseCoordinates(coordString: string): { latitude: number, longitude: number } {
    const [lat, lng] = coordString.split(',').map(coord => parseFloat(coord.trim()))
    return { latitude: lat, longitude: lng }
  }

  /**
   * Calcula múltiplas rotas entre pontos usando a API Qualp real
   */
  async calculateRoutes(params: RouteCalculationParams): Promise<QualRouteResult> {
    try {
      // Montar locais incluindo waypoints se houver - como string separada por quebras de linha
      const locations = [params.origin]
      if (params.waypoints && params.waypoints.length > 0) {
        locations.push(...params.waypoints)
      }
      locations.push(params.destination)

      // Criar string de locais separada por quebras de linha
      const locaisString = locations.join('\n')

      // Payload conforme documentação QUALP v4 - baseado no PDF
      const requestData = {
        "locais": locaisString,
        "config": {
          "route": {
            "optimized_route": false,
            "optimized_route_destination": "last",
            "calculate_return": false,
            "alternative_routes": "0",
            "avoid_locations": true,
            "avoid_locations_key": "",
            "type_route": "efficient"
          },
          "vehicle": {
            "type": params.vehicleType || "truck",
            "axis": params.vehicleAxis || "all",
            "top_speed": params.topSpeed || null
          },
          "tolls": {
            "retroactive_date": ""
          },
          "freight_table": {
            "category": "all",
            "freight_load": "all",
            "axis": "all"
          },
          "fuel_consumption": {
            "fuel_price": params.fuelPrice?.toString() || "0.00",
            "km_fuel": params.fuelConsumption?.toString() || ""
          },
          "private_places": {
            "max_distance_from_location_to_route": "1000",
            "categories": true,
            "areas": true,
            "contacts": true,
            "products": true,
            "services": true
          }
        },
        "show": {
          "tolls": params.showTolls ?? true,
          "freight_table": params.showFreightTable ?? true,
          "maneuvers": false,
          "truck_scales": true,
          "static_image": false,
          "link_to_qualp": true,
          "private_places": false,
          "polyline": params.showPolyline ?? true,
          "simplified_polyline": false,
          "ufs": false,
          "fuel_consumption": false,
          "link_to_qualp_report": false,
          "segments_information": false
        },
        "format": "JSON",
        "exception_key": ""
      }

      console.log('Enviando para QUALP API:', JSON.stringify(requestData, null, 2))

      // Fazer requisição conforme documentação QUALP v4
      const response = await fetch(`${this.baseUrl}/rotas/v4`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Token': this.apiKey
        },
        body: JSON.stringify({
          params: {
            json: JSON.stringify(requestData)
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro na resposta da API QUALP:', response.status, errorText)
        console.error('URL da requisição:', `${this.baseUrl}/rotas/v4`)
        console.error('Headers enviados:', {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Token': this.apiKey ? '[DEFINIDA]' : '[NÃO DEFINIDA]'
        })
        throw new Error(`Erro na API QUALP: ${response.status} - ${response.statusText}. Detalhes: ${errorText}`)
      }

      const apiResponse: QualPApiResponse = await response.json()
      console.log('Resposta da QUALP API:', JSON.stringify(apiResponse, null, 2))

      // Processar resposta real da API
      const routes = this.processQualPApiResponse(apiResponse, params)

      // Como a API retorna apenas uma rota, usamos ela para todos os critérios
      const singleRoute = routes[0]

      return {
        routes,
        mostEfficient: singleRoute,
        cheapest: singleRoute,
        fastest: singleRoute
      }

    } catch (error) {
      console.error('Erro ao calcular rotas com API QUALP:', error)
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
   * Processa a resposta real da API QUALP v4
   */
  private processQualPApiResponse(
    apiResponse: QualPApiResponse,
    params: RouteCalculationParams
  ): QualRouteOption[] {
    if (!apiResponse || !apiResponse.distancia) {
      console.error('Resposta QUALP inválida:', apiResponse)
      throw new Error('Resposta inválida da API QUALP - campo distancia não encontrado')
    }

    const distanceKm = apiResponse.distancia.valor
    const durationSeconds = apiResponse.duracao.valor
    const durationMin = Math.round(durationSeconds / 60)

    // Log para debug da polilinha
    console.log('Polilinha recebida da API:', {
      polilinha_codificada: apiResponse.polilinha_codificada,
      comprimento: apiResponse.polilinha_codificada?.length || 0,
      showPolyline: params.showPolyline
    })

    // Extrair coordenadas de início e fim
    const originCoords = this.parseCoordinates(apiResponse.coordenada_inicio)
    const destCoords = this.parseCoordinates(apiResponse.coordenada_fim)

    // Pontos da rota
    const points: QualRoutePoint[] = [
      { ...originCoords, address: apiResponse.endereco_inicio },
      { ...destCoords, address: apiResponse.endereco_fim }
    ]

    // Extrair custos de pedágio dos dados reais
    const tollCost = this.extractTollCostFromQualPResponse(apiResponse)

    // Calcular custo estimado básico
    const estimatedCost = this.calculateEstimatedCost(distanceKm, params)

    // Calcular eficiência
    const efficiency = this.calculateEfficiency(distanceKm, durationMin, estimatedCost)

    // Validar se polilinha foi retornada quando solicitada
    if (params.showPolyline && !apiResponse.polilinha_codificada) {
      console.warn('Polilinha foi solicitada mas não foi retornada pela API QUALP')
    }

    return [{
      id: `qualp_route_${apiResponse.id_transacao}`,
      distance: Math.round(distanceKm * 10) / 10,
      duration: durationMin,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      efficiency,
      geometry: apiResponse.polilinha_codificada || '',
      points,
      tollCost: Math.round(tollCost * 100) / 100,
      freightTableData: apiResponse.tabela_frete
    }]
  }

  /**
   * Extrai custos de pedágio da resposta real da API QUALP
   */
  private extractTollCostFromQualPResponse(apiResponse: QualPApiResponse): number {
    if (!apiResponse.pedagios || !Array.isArray(apiResponse.pedagios)) {
      return 0
    }

    return apiResponse.pedagios.reduce((total: number, pedagio: Record<string, unknown>) => {
      // A estrutura dos pedágios pode variar, vamos tentar diferentes campos
      const cost = pedagio.valor || pedagio.cost || pedagio.price || 0
      return total + (parseFloat(cost.toString()) || 0)
    }, 0)
  }

  /**
   * Busca informações detalhadas sobre pedágios usando dados da resposta QUALP
   */
  extractTollDetails(apiResponse: QualPApiResponse): {
    totalTollCost: number
    tollStations: Array<{
      name: string
      cost: number
      location: QualRoutePoint
    }>
  } {
    if (!apiResponse.pedagios || !Array.isArray(apiResponse.pedagios)) {
      return { totalTollCost: 0, tollStations: [] }
    }

    const tollStations = apiResponse.pedagios.map((toll: Record<string, unknown>) => ({
      name: toll.nome || toll.name || 'Pedágio',
      cost: parseFloat(toll.valor || toll.cost || toll.price || '0'),
      location: {
        latitude: toll.lat || toll.latitude || 0,
        longitude: toll.lng || toll.longitude || 0,
        address: toll.endereco || toll.address || toll.nome || ''
      }
    }))

    const totalTollCost = tollStations.reduce((sum, station) => sum + station.cost, 0)

    return {
      totalTollCost,
      tollStations
    }
  }

  /**
   * Obtém dados da tabela de frete da resposta QUALP
   */
  getFreightTableData(apiResponse: QualPApiResponse, category: string = 'A', axis: number = 3, cargoType: string = 'geral'): number {
    try {
      const freightTable = apiResponse.tabela_frete?.dados
      if (!freightTable || !freightTable[category] || !freightTable[category][axis.toString()]) {
        return 0
      }

      return freightTable[category][axis.toString()][cargoType] || 0
    } catch (error) {
      console.error('Erro ao extrair dados da tabela de frete:', error)
      return 0
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
    vehicleType: 'truck',
    costPerKm: 2.8,
    fuelPrice: 5.5,
    fuelConsumption: 8,
    showTolls: true,
    showFreightTable: true,
    showPolyline: true,
    ...options
  })
}