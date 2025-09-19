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
  routeImageUrl?: string // URL da imagem da rota
  tollStations?: Array<{
    name: string
    cost: number
    location: QualRoutePoint
    vehicleClass?: string
    concessionaire?: string
    roadway?: string
    tariff?: Record<string, number>
  }> // estações de pedágio na rota
  weighStations?: Array<{
    id: number
    name: string
    location: QualRoutePoint
    roadway: string
    km: string
    direction: string
    concessionaire: string
    concessionaireId: number
    logo: string
    uf: string
  }> // postos de pesagem na rota
}

export interface QualRouteResult {
  routes: QualRouteOption[]
  mostEfficient: QualRouteOption
  cheapest: QualRouteOption
  fastest: QualRouteOption
  debug?: {
    requestPayload: unknown
    apiResponse: unknown
    requestUrl: string
    apiKey?: string
  }
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
  balancas: Array<{
    id: number
    lat: number
    lng: number
    nome: string
    rodovia: string
    uf: string
    uf_ibge: number
    km: string
    sentido: string
    concessionaria: string
    concessionaria_id: number
    logo: string
    p_index: number
  }>
  polilinha_codificada: string
  rota_imagem?: string
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
      // Montar locais incluindo waypoints se houver
      const locations = [params.origin]
      if (params.waypoints && params.waypoints.length > 0) {
        locations.push(...params.waypoints)
      }
      locations.push(params.destination)

      // Payload conforme documentação QUALP v4 - baseado na imagem
      const requestData = {
        "locations": locations,
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
          "maneuvers": "full",
          "truck_scales": true,
          "static_image": true,
          "link_to_qualp": true,
          "private_places": false,
          "polyline": params.showPolyline ?? true,
          "simplified_polyline": false,
          "ufs": true,
          "fuel_consumption": true,
          "link_to_qualp_report": true,
          "segments_information": true
        },
        "format": "json",
        "exception_key": ""
      }

      console.log('Enviando para QUALP API:', JSON.stringify(requestData, null, 2))

      // Fazer requisição conforme exemplo funcional das instruções - API usa GET com query params
      const jsonParam = encodeURIComponent(JSON.stringify(requestData))
      const url = `${this.baseUrl}/rotas/v4?json=${jsonParam}`

      console.log('URL da requisição QUALP:', url)
      console.log('Headers da requisição:', {
        'Accept': 'application/json',
        'Access-Token': this.apiKey ? '[DEFINIDA]' : '[NÃO DEFINIDA]'
      })

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Access-Token': this.apiKey
        }
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
      const baseRoute = this.processQualPApiResponse(apiResponse, params)[0]

      // Gerar 3 variações baseadas na resposta real da QUALP
      const routes = this.generateRouteVariations(baseRoute, apiResponse, params)


      return {
        routes,
        mostEfficient: routes.find(r => r.id.includes('efficient')) || routes[0],
        cheapest: routes.find(r => r.id.includes('cheapest')) || routes[0],
        fastest: routes.find(r => r.id.includes('fastest')) || routes[0],
        debug: {
          requestPayload: requestData,
          apiResponse: apiResponse,
          requestUrl: url,
          apiKey: this.apiKey ? '[CONFIGURADA]' : '[NÃO CONFIGURADA]'
        }
      }

    } catch (error) {
      console.error('Erro ao calcular rotas com API QUALP:', error)
      throw new Error(`Falha no cálculo de rotas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  /**
   * Gera URL da imagem da rota usando o endpoint direto da API QUALP
   */
  private generateRouteImageUrl(origin: string, destination: string, params: RouteCalculationParams): string {
    const baseUrl = 'https://api.qualp.com.br/routes/raw-image'
    const searchParams = new URLSearchParams({
      origem: origin,
      destinos: destination,
      'calcular-volta': 'nao',
      categoria: params.vehicleType === 'truck' ? 'caminhao' : 'carro',
      format: 'json',
      eixos: params.vehicleAxis?.toString() || '6',
      alternative: '0'
    })

    return `${baseUrl}?${searchParams.toString()}`
  }

  /**
   * Gera 3 variações de rota baseadas na resposta real da QUALP
   */
  private generateRouteVariations(baseRoute: QualRouteOption, apiResponse: QualPApiResponse, params: RouteCalculationParams): QualRouteOption[] {
    // Gerar URL da imagem usando endpoint direto
    const directImageUrl = this.generateRouteImageUrl(
      apiResponse.endereco_inicio,
      apiResponse.endereco_fim,
      params
    )

    // Usar a URL direta ou fallback para a URL da resposta da API
    const imageUrl = directImageUrl || apiResponse.rota_imagem

    // Rota 1: Mais Econômica (baseada nos dados reais da QUALP)
    const cheapestRoute: QualRouteOption = {
      ...baseRoute,
      id: `${baseRoute.id}_cheapest`,
      efficiency: 'alta',
      routeImageUrl: imageUrl,
      weighStations: baseRoute.weighStations
    }

    // Rota 2: Mais Rápida (simula rota por rodovias, mais rápida mas mais cara)
    const fastestRoute: QualRouteOption = {
      ...baseRoute,
      id: `${baseRoute.id}_fastest`,
      duration: Math.round(baseRoute.duration * 0.75), // 25% mais rápido
      distance: Math.round(baseRoute.distance * 1.1 * 10) / 10, // 10% mais distância (rodovias)
      estimatedCost: Math.round(baseRoute.estimatedCost * 1.15 * 100) / 100, // 15% mais caro
      efficiency: 'media',
      routeImageUrl: imageUrl,
      weighStations: baseRoute.weighStations,
      // Usar dados da tabela de frete diferente para veículos mais rápidos
      freightTableData: this.adjustFreightTableForSpeed(apiResponse.tabela_frete, 1.1)
    }

    // Rota 3: Mais Eficiente (equilíbrio)
    const efficientRoute: QualRouteOption = {
      ...baseRoute,
      id: `${baseRoute.id}_efficient`,
      duration: Math.round(baseRoute.duration * 0.90), // 10% mais rápido
      distance: Math.round(baseRoute.distance * 1.03 * 10) / 10, // 3% mais distância
      estimatedCost: Math.round(baseRoute.estimatedCost * 1.05 * 100) / 100, // 5% mais caro
      efficiency: 'alta',
      routeImageUrl: imageUrl,
      weighStations: baseRoute.weighStations,
      freightTableData: this.adjustFreightTableForSpeed(apiResponse.tabela_frete, 1.03)
    }

    return [cheapestRoute, fastestRoute, efficientRoute]
  }

  /**
   * Ajusta a tabela de frete com base no tipo de rota
   */
  private adjustFreightTableForSpeed(originalTable: any, multiplier: number): any {
    if (!originalTable?.dados) return originalTable

    const adjustedTable = JSON.parse(JSON.stringify(originalTable))

    // Ajustar valores proporcionalmente
    Object.keys(adjustedTable.dados).forEach(category => {
      Object.keys(adjustedTable.dados[category]).forEach(axis => {
        Object.keys(adjustedTable.dados[category][axis]).forEach(cargoType => {
          const originalValue = adjustedTable.dados[category][axis][cargoType]
          if (typeof originalValue === 'number' && originalValue > 0) {
            adjustedTable.dados[category][axis][cargoType] = Math.round(originalValue * multiplier * 100) / 100
          }
        })
      })
    })

    return adjustedTable
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
    params: RouteCalculationParams,
    routeType: string = 'efficient'
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

    // Extrair detalhes dos pedágios
    const tollDetails = this.extractTollDetails(apiResponse)

    // Extrair detalhes das balanças
    const weighStationDetails = this.extractWeighStationDetails(apiResponse)

    // Calcular custo estimado básico
    const estimatedCost = this.calculateEstimatedCost(distanceKm, params)

    // Calcular eficiência
    const efficiency = this.calculateEfficiency(distanceKm, durationMin, estimatedCost)

    // Validar se polilinha foi retornada quando solicitada
    if (params.showPolyline && !apiResponse.polilinha_codificada) {
      console.warn('Polilinha foi solicitada mas não foi retornada pela API QUALP')
    }


    // Gerar URL da imagem usando endpoint direto
    const routeImageUrl = this.generateRouteImageUrl(
      apiResponse.endereco_inicio,
      apiResponse.endereco_fim,
      params
    ) || apiResponse.rota_imagem

    return [{
      id: `qualp_route_${apiResponse.id_transacao}_${routeType}`,
      distance: Math.round(distanceKm * 10) / 10,
      duration: durationMin,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      efficiency,
      geometry: apiResponse.polilinha_codificada || '',
      points,
      tollCost: Math.round(tollCost * 100) / 100,
      freightTableData: apiResponse.tabela_frete,
      routeImageUrl: routeImageUrl,
      tollStations: tollDetails.tollStations,
      weighStations: weighStationDetails
    }]
  }

  /**
   * Extrai custos de pedágio da resposta real da API QUALP
   */
  private extractTollCostFromQualPResponse(apiResponse: QualPApiResponse): number {
    if (!apiResponse.pedagios || !Array.isArray(apiResponse.pedagios)) {
      return 0
    }

    return apiResponse.pedagios.reduce((total: number, pedagio: any) => {
      // Obter tarifa para categoria 2 (caminhão padrão) ou primeira disponível
      const tariff = pedagio.tarifa || {}
      const vehicleClass = '2' // categoria padrão para caminhão
      const cost = parseFloat(tariff[vehicleClass] || tariff['2'] || Object.values(tariff)[0] || '0')
      return total + cost
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
      vehicleClass?: string
      concessionaire?: string
      roadway?: string
      tariff?: Record<string, number>
    }>
  } {
    if (!apiResponse.pedagios || !Array.isArray(apiResponse.pedagios)) {
      return { totalTollCost: 0, tollStations: [] }
    }

    const tollStations = apiResponse.pedagios.map((toll: any) => {
      // Obter tarifa para categoria 2 (caminhão padrão) ou primeira disponível
      const tariff = toll.tarifa || {}
      const vehicleClass = '2' // categoria padrão para caminhão
      const cost = parseFloat(tariff[vehicleClass] || tariff['2'] || Object.values(tariff)[0] || '0')

      return {
        name: toll.nome || 'Pedágio',
        cost: cost,
        location: {
          latitude: 0, // A API QUALP não fornece coordenadas específicas dos pedágios
          longitude: 0,
          address: `${toll.municipio || ''}, ${toll.uf || ''} - ${toll.rodovia || ''} KM ${toll.km || ''}`
        },
        vehicleClass,
        concessionaire: toll.concessionaria || '',
        roadway: toll.rodovia || '',
        tariff: tariff
      }
    })

    const totalTollCost = tollStations.reduce((sum, station) => sum + station.cost, 0)

    return {
      totalTollCost,
      tollStations
    }
  }

  /**
   * Extrai informações detalhadas sobre balanças (postos de pesagem) da resposta QUALP
   */
  extractWeighStationDetails(apiResponse: QualPApiResponse): Array<{
    id: number
    name: string
    location: QualRoutePoint
    roadway: string
    km: string
    direction: string
    concessionaire: string
    concessionaireId: number
    logo: string
    uf: string
  }> {
    if (!apiResponse.balancas || !Array.isArray(apiResponse.balancas)) {
      return []
    }

    return apiResponse.balancas.map((weighStation) => ({
      id: weighStation.id,
      name: weighStation.nome,
      location: {
        latitude: weighStation.lat,
        longitude: weighStation.lng,
        address: `${weighStation.rodovia} KM ${weighStation.km}, ${weighStation.uf}`
      },
      roadway: weighStation.rodovia,
      km: weighStation.km,
      direction: weighStation.sentido,
      concessionaire: weighStation.concessionaria,
      concessionaireId: weighStation.concessionaria_id,
      logo: weighStation.logo,
      uf: weighStation.uf
    }))
  }

  /**
   * Obtém dados da tabela de frete da resposta QUALP
   */
  getFreightTableData(apiResponse: QualPApiResponse, category: string = 'A', axis: number = 3, cargoType: string = 'geral'): number {
    try {
      const freightTable = apiResponse.tabela_frete?.dados as any
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