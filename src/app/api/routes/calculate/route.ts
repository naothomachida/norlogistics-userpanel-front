import { NextRequest, NextResponse } from 'next/server'
import { calculateBestRoutes } from '@/lib/qualp-api'
import { routeCostCalculator, defaultVehicleSpecs } from '@/lib/route-cost-calculator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      origin,
      destination,
      waypoints = [],
      vehicleType = 'caminhao_medio',
      fuelPrice = 5.5,
      profitMargin = 20,
      useHistoricalData = true,
      freightCategory = 'A',
      cargoType = 'geral'
    } = body

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origem e destino são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar preço do combustível
    routeCostCalculator.updateFuelPrice(fuelPrice)

    // Calcular rotas usando a API Qualp com configurações completas
    const routeResults = await calculateBestRoutes(origin, destination, {
      waypoints,
      vehicleType: body.vehicleType || 'truck',
      vehicleAxis: body.vehicleAxis,
      fuelPrice,
      fuelConsumption: body.fuelConsumption ? parseFloat(body.fuelConsumption) : undefined,
      costPerKm: 2.8,
      showTolls: body.showTolls,
      showFreightTable: body.showFreightTable,
      showPolyline: body.showPolyline
    })

    // Obter especificações do veículo
    const vehicleSpecs = defaultVehicleSpecs[vehicleType] || defaultVehicleSpecs.caminhao_medio

    // Calcular custos para cada rota usando dados reais do QUALP
    const routeCostings = routeResults.routes.map(route => {
      let costing = routeCostCalculator.calculateRouteCost(
        route,
        vehicleSpecs,
        profitMargin,
        freightCategory,
        cargoType
      )

      // Ajustar com dados históricos se solicitado
      if (useHistoricalData) {
        costing = routeCostCalculator.adjustCostWithHistory(
          costing,
          origin,
          destination
        )
      }

      return costing
    })

    // Comparar rotas
    const comparison = routeCostCalculator.compareRoutes(routeCostings)

    // Obter estatísticas históricas se disponíveis
    const statistics = routeCostCalculator.getRouteStatistics(origin, destination)

    // Preparar resposta com as 3 melhores opções
    const response = {
      success: true,
      routes: {
        cheapest: {
          ...comparison.cheapest,
          tag: 'Mais Econômica',
          savings: 0,
          recommendation: 'Melhor custo-benefício para esta rota'
        },
        fastest: {
          ...comparison.fastest,
          tag: 'Mais Rápida',
          timeSaved: comparison.comparison.find(c => c.route === comparison.fastest)?.timeDifference || 0,
          recommendation: 'Ideal para entregas urgentes'
        },
        mostEfficient: {
          ...comparison.mostEfficient,
          tag: 'Mais Eficiente',
          efficiencyScore: comparison.comparison.find(c => c.route === comparison.mostEfficient)?.efficiencyScore || 0,
          recommendation: 'Melhor equilíbrio entre tempo e custo'
        }
      },
      comparison: comparison.comparison.map(comp => ({
        routeId: comp.route.route.id,
        distance: comp.route.route.distance,
        duration: comp.route.route.duration,
        cost: comp.route.costBreakdown.finalPrice,
        savings: comp.savings,
        timeDifference: comp.timeDifference,
        efficiencyScore: comp.efficiencyScore,
        costBreakdown: comp.route.costBreakdown
      })),
      statistics,
      metadata: {
        origin,
        destination,
        waypoints,
        vehicleType: vehicleSpecs.tipo,
        fuelPrice,
        profitMargin,
        calculatedAt: new Date().toISOString()
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao calcular rotas:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao calcular rotas',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get('origin')
  const destination = searchParams.get('destination')

  if (!origin || !destination) {
    return NextResponse.json(
      { error: 'Parâmetros origin e destination são obrigatórios' },
      { status: 400 }
    )
  }

  try {
    // Retornar apenas dados históricos
    const statistics = routeCostCalculator.getRouteStatistics(origin, destination)
    const historicalData = routeCostCalculator.getHistoricalData(origin, destination)
    const averageData = routeCostCalculator.getAverageCostFromHistory(origin, destination)

    return NextResponse.json({
      success: true,
      hasHistoricalData: historicalData.length > 0,
      statistics,
      averageData,
      historicalTrips: historicalData.length,
      lastTrip: historicalData.length > 0 ? historicalData[historicalData.length - 1] : null
    })

  } catch (error) {
    console.error('Erro ao buscar dados históricos:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar dados históricos',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}