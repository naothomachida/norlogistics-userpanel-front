import { NextRequest, NextResponse } from 'next/server'
import { calculateBestRoutes, QualRouteOption } from '@/lib/qualp-api'
import { routeCostCalculator, defaultVehicleSpecs } from '@/lib/route-cost-calculator'
import { routeCacheManager } from '@/lib/route-cache'

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
      cargoType = 'geral',
      forceUpdate = false  // Nova flag para forçar atualização
    } = body

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origem e destino são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar preço do combustível
    routeCostCalculator.updateFuelPrice(fuelPrice)

    // Parâmetros para o cache
    const cacheParams = {
      origin,
      destination,
      waypoints,
      vehicleType: body.vehicleType || 'truck',
      vehicleAxis: body.vehicleAxis || 'all',
      freightCategory: freightCategory,
      cargoType: cargoType,
      topSpeed: body.topSpeed || null,
      fuelConsumption: body.fuelConsumption ? parseFloat(body.fuelConsumption) : undefined,
      showTolls: body.showTolls ?? true,
      showFreightTable: body.showFreightTable ?? true,
      showPolyline: body.showPolyline ?? true,
      forceUpdate: forceUpdate
    }

    let routeResults
    let fromCache = false

    // Tentar buscar no cache primeiro
    const cachedEntry = await routeCacheManager.findCacheEntry(cacheParams)

    if (cachedEntry) {
      // Usar dados do cache
      routeResults = JSON.parse(cachedEntry.qualpResponse)
      fromCache = true

      console.log(`🗃️ Usando dados do cache para rota ${origin} → ${destination}`)
    } else {
      // Fazer nova consulta à API Qualp
      console.log(`🌐 Consultando API Qualp para rota ${origin} → ${destination}`)

      routeResults = await calculateBestRoutes(origin, destination, {
        waypoints,
        vehicleType: body.vehicleType || 'truck',
        vehicleAxis: body.vehicleAxis || 'all',
        topSpeed: body.topSpeed || null,
        fuelPrice,
        fuelConsumption: body.fuelConsumption ? parseFloat(body.fuelConsumption) : undefined,
        costPerKm: 2.8,
        showTolls: body.showTolls ?? true,
        showFreightTable: body.showFreightTable ?? true,
        showPolyline: body.showPolyline ?? true
      })

      // Salvar no cache (async, não bloquear resposta)
      routeCacheManager.saveCacheEntry(cacheParams, routeResults).catch(error => {
        console.error('Erro ao salvar no cache:', error)
      })
    }

    // Obter especificações do veículo
    const vehicleSpecs = defaultVehicleSpecs[vehicleType] || defaultVehicleSpecs.caminhao_medio

    // Calcular custos para cada rota usando dados reais do QUALP
    const routeCostings = routeResults.routes.map((route: QualRouteOption) => {
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
      },
      debug: {
        qualp: routeResults.debug,
        requestBody: body,
        processedPayload: {
          origin,
          destination,
          waypoints,
          vehicleType: body.vehicleType || 'truck',
          vehicleAxis: body.vehicleAxis || 'all',
          topSpeed: body.topSpeed || null,
          fuelPrice,
          fuelConsumption: body.fuelConsumption ? parseFloat(body.fuelConsumption) : undefined,
          costPerKm: 2.8,
          showTolls: body.showTolls ?? true,
          showFreightTable: body.showFreightTable ?? true,
          showPolyline: body.showPolyline ?? true
        },
        cache: {
          fromCache,
          cacheEntry: fromCache ? {
            id: cachedEntry?.id,
            totalConsultas: cachedEntry?.totalConsultas,
            primeiraConsulta: cachedEntry?.primeiraConsulta,
            ultimaConsulta: cachedEntry?.ultimaConsulta
          } : null
        }
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