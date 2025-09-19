import { QualRouteOption } from './qualp-api'

export interface VehicleSpecs {
  id: string
  tipo: string
  fuelConsumption: number // km/l
  maintenanceCostPerKm: number // R$/km
  driverCostPerHour?: number // R$/hora
  tollMultiplier?: number // multiplicador para pedágio
}

export interface CostBreakdown {
  fuelCost: number
  maintenanceCost: number
  driverCost: number
  tollCost: number
  operationalCost: number
  freightTableCost?: number // Valor da tabela de frete QUALP
  totalCost: number
  profitMargin: number
  finalPrice: number
}

export interface RouteCosting {
  route: QualRouteOption
  costBreakdown: CostBreakdown
  vehicleSpecs: VehicleSpecs
  kmRegistered: number
  actualCostPerKm: number
}

export interface HistoricalRouteData {
  origin: string
  destination: string
  distance: number
  actualCost: number
  fuelConsumed: number
  duration: number
  date: Date
  vehicleId: string
  issues?: string[] // problemas encontrados na rota
}

export class RouteCostCalculator {
  private fuelPricePerLiter: number
  private historicalData: Map<string, HistoricalRouteData[]> = new Map()

  constructor(fuelPrice: number = 5.5) {
    this.fuelPricePerLiter = fuelPrice
  }

  /**
   * Calcula o custo detalhado de uma rota usando dados reais da tabela de frete QUALP
   */
  calculateRouteCost(
    route: QualRouteOption,
    vehicleSpecs: VehicleSpecs,
    profitMarginPercent: number = 20,
    freightCategory: string = 'A',
    cargoType: string = 'geral'
  ): RouteCosting {
    const distance = route.distance
    const durationHours = route.duration / 60

    // Custo de combustível
    const fuelCost = (distance / vehicleSpecs.fuelConsumption) * this.fuelPricePerLiter

    // Custo de manutenção
    const maintenanceCost = distance * vehicleSpecs.maintenanceCostPerKm

    // Custo do motorista
    const driverCost = durationHours * (vehicleSpecs.driverCostPerHour || 25)

    // Custo de pedágio real da API QUALP (já calculado para a categoria correta)
    const tollCost = route.tollCost || 0

    // Custos operacionais (seguro, documentação, etc.)
    const operationalCost = distance * 0.5 // R$ 0.50 por km

    // Custo base da tabela de frete QUALP (se disponível)
    let freightTableCost = 0
    if (route.freightTableData?.dados) {
      const axisKey = this.getVehicleAxis(vehicleSpecs.tipo)
      try {
        freightTableCost = route.freightTableData.dados[freightCategory]?.[axisKey]?.[cargoType] || 0
      } catch (error) {
        console.warn('Erro ao extrair custo da tabela de frete:', error)
      }
    }

    // Se temos dados da tabela de frete QUALP, usar como custo base
    let totalCost: number
    let adjustedFuelCost = fuelCost
    let adjustedMaintenanceCost = maintenanceCost
    let adjustedDriverCost = driverCost
    let adjustedOperationalCost = operationalCost

    if (freightTableCost > 0) {
      // Usar a tabela de frete já ajustada que vem da rota
      // As rotas já têm tabelas de frete ajustadas conforme o tipo
      totalCost = freightTableCost + tollCost

      // Ajustar apenas os custos de referência para mostrar diferenças
      if (route.id.includes('_fastest')) {
        // Rota mais rápida: mais combustível devido à velocidade
        adjustedFuelCost = fuelCost * 1.25
        adjustedMaintenanceCost = maintenanceCost * 1.15
      } else if (route.id.includes('_efficient')) {
        // Rota mais eficiente: custos ligeiramente maiores
        adjustedFuelCost = fuelCost * 1.10
        adjustedMaintenanceCost = maintenanceCost * 1.05
      }
      // Rota mais econômica (_cheapest) mantém valores base
    } else {
      // Cálculo tradicional quando não temos tabela de frete
      totalCost = fuelCost + maintenanceCost + driverCost + tollCost + operationalCost
    }

    // Margem de lucro
    const profitMargin = totalCost * (profitMarginPercent / 100)

    // Preço final
    const finalPrice = totalCost + profitMargin

    const costBreakdown: CostBreakdown = {
      fuelCost: Math.round(adjustedFuelCost * 100) / 100,
      maintenanceCost: Math.round(adjustedMaintenanceCost * 100) / 100,
      driverCost: Math.round(adjustedDriverCost * 100) / 100,
      tollCost: Math.round(tollCost * 100) / 100,
      operationalCost: Math.round(adjustedOperationalCost * 100) / 100,
      freightTableCost: freightTableCost > 0 ? Math.round(freightTableCost * 100) / 100 : undefined,
      totalCost: Math.round(totalCost * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100
    }

    return {
      route,
      costBreakdown,
      vehicleSpecs,
      kmRegistered: distance,
      actualCostPerKm: Math.round((totalCost / distance) * 100) / 100
    }
  }

  /**
   * Registra dados históricos de uma rota realizada
   */
  registerRouteData(data: HistoricalRouteData): void {
    const routeKey = `${data.origin}_${data.destination}`.toLowerCase()
    
    if (!this.historicalData.has(routeKey)) {
      this.historicalData.set(routeKey, [])
    }
    
    this.historicalData.get(routeKey)!.push(data)
  }

  /**
   * Obtém dados históricos de uma rota
   */
  getHistoricalData(origin: string, destination: string): HistoricalRouteData[] {
    const routeKey = `${origin}_${destination}`.toLowerCase()
    return this.historicalData.get(routeKey) || []
  }

  /**
   * Calcula a média de custo real baseado no histórico
   */
  getAverageCostFromHistory(
    origin: string,
    destination: string,
    vehicleId?: string
  ): {
    averageCostPerKm: number
    averageDistance: number
    averageDuration: number
    dataPoints: number
  } | null {
    let historicalData = this.getHistoricalData(origin, destination)
    
    if (vehicleId) {
      historicalData = historicalData.filter(data => data.vehicleId === vehicleId)
    }

    if (historicalData.length === 0) {
      return null
    }

    const totalCost = historicalData.reduce((sum, data) => sum + data.actualCost, 0)
    const totalDistance = historicalData.reduce((sum, data) => sum + data.distance, 0)
    const totalDuration = historicalData.reduce((sum, data) => sum + data.duration, 0)

    return {
      averageCostPerKm: Math.round((totalCost / totalDistance) * 100) / 100,
      averageDistance: Math.round((totalDistance / historicalData.length) * 100) / 100,
      averageDuration: Math.round((totalDuration / historicalData.length) * 100) / 100,
      dataPoints: historicalData.length
    }
  }

  /**
   * Ajusta o cálculo baseado no histórico
   */
  adjustCostWithHistory(
    routeCosting: RouteCosting,
    origin: string,
    destination: string
  ): RouteCosting {
    const historicalAverage = this.getAverageCostFromHistory(
      origin, 
      destination, 
      routeCosting.vehicleSpecs.id
    )

    if (!historicalAverage || historicalAverage.dataPoints < 3) {
      return routeCosting // Não há dados suficientes
    }

    // Ajustar baseado na média histórica
    const historicalCostPerKm = historicalAverage.averageCostPerKm
    const estimatedCostPerKm = routeCosting.actualCostPerKm

    // Se a diferença for significativa (>20%), ajustar
    const difference = Math.abs(historicalCostPerKm - estimatedCostPerKm) / estimatedCostPerKm

    if (difference > 0.2) {
      const adjustmentFactor = historicalCostPerKm / estimatedCostPerKm
      
      // Ajustar custos
      const adjustedTotalCost = routeCosting.costBreakdown.totalCost * adjustmentFactor
      const adjustedProfitMargin = routeCosting.costBreakdown.profitMargin * adjustmentFactor
      
      routeCosting.costBreakdown.totalCost = Math.round(adjustedTotalCost * 100) / 100
      routeCosting.costBreakdown.profitMargin = Math.round(adjustedProfitMargin * 100) / 100
      routeCosting.costBreakdown.finalPrice = Math.round((adjustedTotalCost + adjustedProfitMargin) * 100) / 100
      routeCosting.actualCostPerKm = Math.round((adjustedTotalCost / routeCosting.route.distance) * 100) / 100
    }

    return routeCosting
  }

  /**
   * Compara custos de diferentes rotas
   */
  compareRoutes(routeCostings: RouteCosting[]): {
    cheapest: RouteCosting
    fastest: RouteCosting
    mostEfficient: RouteCosting
    comparison: Array<{
      route: RouteCosting
      savings: number
      timeDifference: number
      efficiencyScore: number
    }>
  } {
    const cheapest = routeCostings.reduce((min, current) => 
      current.costBreakdown.finalPrice < min.costBreakdown.finalPrice ? current : min
    )

    const fastest = routeCostings.reduce((min, current) => 
      current.route.duration < min.route.duration ? current : min
    )

    // Calcular eficiência (menor custo por tempo)
    const mostEfficient = routeCostings.reduce((best, current) => {
      const currentEfficiency = current.costBreakdown.finalPrice / current.route.duration
      const bestEfficiency = best.costBreakdown.finalPrice / best.route.duration
      return currentEfficiency < bestEfficiency ? current : best
    })

    const comparison = routeCostings.map(routeCosting => {
      const savings = cheapest.costBreakdown.finalPrice - routeCosting.costBreakdown.finalPrice
      const timeDifference = routeCosting.route.duration - fastest.route.duration
      const efficiencyScore = routeCosting.costBreakdown.finalPrice / routeCosting.route.duration

      return {
        route: routeCosting,
        savings: Math.round(savings * 100) / 100,
        timeDifference: Math.round(timeDifference),
        efficiencyScore: Math.round(efficiencyScore * 100) / 100
      }
    })

    return {
      cheapest,
      fastest,
      mostEfficient,
      comparison
    }
  }

  /**
   * Atualiza o preço do combustível
   */
  updateFuelPrice(newPrice: number): void {
    this.fuelPricePerLiter = newPrice
  }

  /**
   * Mapeia tipo de veículo para número de eixos da tabela de frete
   */
  private getVehicleAxis(vehicleType: string): string {
    const axisMap: Record<string, string> = {
      'Van': '2',
      'Caminhão Pequeno': '3',
      'Caminhão Médio': '4',
      'Caminhão Grande': '5'
    }
    return axisMap[vehicleType] || '3' // padrão para caminhão médio
  }

  /**
   * Exporta dados históricos para análise
   */
  exportHistoricalData(): HistoricalRouteData[] {
    const allData: HistoricalRouteData[] = []
    this.historicalData.forEach(routeData => {
      allData.push(...routeData)
    })
    return allData
  }

  /**
   * Calcula estatísticas de performance das rotas
   */
  getRouteStatistics(origin: string, destination: string): {
    totalTrips: number
    averageCost: number
    averageDistance: number
    averageDuration: number
    costTrend: 'increasing' | 'decreasing' | 'stable'
    commonIssues: { issue: string; frequency: number }[]
  } | null {
    const data = this.getHistoricalData(origin, destination)
    
    if (data.length === 0) return null

    const totalTrips = data.length
    const averageCost = data.reduce((sum, trip) => sum + trip.actualCost, 0) / totalTrips
    const averageDistance = data.reduce((sum, trip) => sum + trip.distance, 0) / totalTrips
    const averageDuration = data.reduce((sum, trip) => sum + trip.duration, 0) / totalTrips

    // Calcular tendência de custo
    const recentData = data.slice(-5) // últimas 5 viagens
    const oldData = data.slice(0, 5) // primeiras 5 viagens
    
    let costTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (recentData.length > 0 && oldData.length > 0) {
      const recentAvg = recentData.reduce((sum, trip) => sum + trip.actualCost, 0) / recentData.length
      const oldAvg = oldData.reduce((sum, trip) => sum + trip.actualCost, 0) / oldData.length
      
      const difference = (recentAvg - oldAvg) / oldAvg
      if (difference > 0.1) costTrend = 'increasing'
      else if (difference < -0.1) costTrend = 'decreasing'
    }

    // Problemas comuns
    const issueMap = new Map<string, number>()
    data.forEach(trip => {
      trip.issues?.forEach(issue => {
        issueMap.set(issue, (issueMap.get(issue) || 0) + 1)
      })
    })

    const commonIssues = Array.from(issueMap.entries())
      .map(([issue, frequency]) => ({ issue, frequency }))
      .sort((a, b) => b.frequency - a.frequency)

    return {
      totalTrips,
      averageCost: Math.round(averageCost * 100) / 100,
      averageDistance: Math.round(averageDistance * 100) / 100,
      averageDuration: Math.round(averageDuration),
      costTrend,
      commonIssues
    }
  }
}

// Instância global do calculador
export const routeCostCalculator = new RouteCostCalculator()

// Tipos de veículos padrão
export const defaultVehicleSpecs: Record<string, VehicleSpecs> = {
  caminhao_pequeno: {
    id: 'caminhao_pequeno',
    tipo: 'Caminhão Pequeno',
    fuelConsumption: 12, // km/l
    maintenanceCostPerKm: 0.25,
    driverCostPerHour: 25,
    tollMultiplier: 1.0
  },
  caminhao_medio: {
    id: 'caminhao_medio',
    tipo: 'Caminhão Médio',
    fuelConsumption: 8, // km/l
    maintenanceCostPerKm: 0.35,
    driverCostPerHour: 30,
    tollMultiplier: 1.2
  },
  caminhao_grande: {
    id: 'caminhao_grande',
    tipo: 'Caminhão Grande',
    fuelConsumption: 5, // km/l
    maintenanceCostPerKm: 0.50,
    driverCostPerHour: 35,
    tollMultiplier: 1.5
  },
  van: {
    id: 'van',
    tipo: 'Van',
    fuelConsumption: 15, // km/l
    maintenanceCostPerKm: 0.20,
    driverCostPerHour: 20,
    tollMultiplier: 0.8
  }
}