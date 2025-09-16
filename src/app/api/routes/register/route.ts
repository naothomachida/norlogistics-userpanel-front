import { NextRequest, NextResponse } from 'next/server'
import { routeCostCalculator } from '@/lib/route-cost-calculator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      origin,
      destination,
      distance,
      actualCost,
      fuelConsumed,
      duration,
      vehicleId,
      issues = []
    } = body

    // Validar dados obrigatórios
    if (!origin || !destination || !distance || !actualCost || !vehicleId) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: origin, destination, distance, actualCost, vehicleId' },
        { status: 400 }
      )
    }

    // Validar tipos
    if (typeof distance !== 'number' || distance <= 0) {
      return NextResponse.json(
        { error: 'Distance deve ser um número positivo' },
        { status: 400 }
      )
    }

    if (typeof actualCost !== 'number' || actualCost <= 0) {
      return NextResponse.json(
        { error: 'ActualCost deve ser um número positivo' },
        { status: 400 }
      )
    }

    // Registrar dados históricos
    routeCostCalculator.registerRouteData({
      origin: origin.trim(),
      destination: destination.trim(),
      distance: parseFloat(distance.toFixed(2)),
      actualCost: parseFloat(actualCost.toFixed(2)),
      fuelConsumed: fuelConsumed ? parseFloat(fuelConsumed.toFixed(2)) : 0,
      duration: duration || 0,
      date: new Date(),
      vehicleId: vehicleId.trim(),
      issues: Array.isArray(issues) ? issues.filter(issue => typeof issue === 'string') : []
    })

    // Obter estatísticas atualizadas
    const statistics = routeCostCalculator.getRouteStatistics(origin, destination)
    const averageData = routeCostCalculator.getAverageCostFromHistory(origin, destination, vehicleId)

    return NextResponse.json({
      success: true,
      message: 'Dados da viagem registrados com sucesso',
      registered: {
        origin,
        destination,
        distance,
        actualCost,
        costPerKm: parseFloat((actualCost / distance).toFixed(2)),
        vehicleId,
        registeredAt: new Date().toISOString()
      },
      statistics,
      averageData
    })

  } catch (error) {
    console.error('Erro ao registrar dados da viagem:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao registrar dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const vehicleId = searchParams.get('vehicleId')
    const export_data = searchParams.get('export')

    // Se solicitado export de todos os dados
    if (export_data === 'all') {
      const allData = routeCostCalculator.exportHistoricalData()
      
      return NextResponse.json({
        success: true,
        totalRecords: allData.length,
        data: allData,
        exportedAt: new Date().toISOString()
      })
    }

    // Se especificou rota específica
    if (origin && destination) {
      const historicalData = routeCostCalculator.getHistoricalData(origin, destination)
      const filteredData = vehicleId 
        ? historicalData.filter(data => data.vehicleId === vehicleId)
        : historicalData

      const statistics = routeCostCalculator.getRouteStatistics(origin, destination)
      const averageData = routeCostCalculator.getAverageCostFromHistory(origin, destination, vehicleId || undefined)

      return NextResponse.json({
        success: true,
        route: { origin, destination },
        totalTrips: filteredData.length,
        data: filteredData,
        statistics,
        averageData
      })
    }

    // Retornar resumo geral
    const allData = routeCostCalculator.exportHistoricalData()
    
    // Agrupar por rotas únicas
    const routesSummary = new Map()
    allData.forEach(trip => {
      const routeKey = `${trip.origin}_${trip.destination}`
      if (!routesSummary.has(routeKey)) {
        routesSummary.set(routeKey, {
          origin: trip.origin,
          destination: trip.destination,
          trips: 0,
          totalCost: 0,
          totalDistance: 0,
          vehicles: new Set()
        })
      }
      
      const route = routesSummary.get(routeKey)
      route.trips++
      route.totalCost += trip.actualCost
      route.totalDistance += trip.distance
      route.vehicles.add(trip.vehicleId)
    })

    const summary = Array.from(routesSummary.values()).map(route => ({
      origin: route.origin,
      destination: route.destination,
      totalTrips: route.trips,
      averageCost: parseFloat((route.totalCost / route.trips).toFixed(2)),
      averageDistance: parseFloat((route.totalDistance / route.trips).toFixed(2)),
      averageCostPerKm: parseFloat((route.totalCost / route.totalDistance).toFixed(2)),
      vehiclesUsed: route.vehicles.size
    }))

    return NextResponse.json({
      success: true,
      totalRecords: allData.length,
      uniqueRoutes: summary.length,
      routes: summary
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