import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month' // day, month, year
    const gestorId = searchParams.get('gestorId')
    const solicitanteId = searchParams.get('solicitanteId')

    const now = new Date()
    let startDate = new Date()
    let groupBy = ''

    // Definir período de consulta
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0)
        groupBy = 'DATE(s."createdAt")'
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        groupBy = 'DATE(s."createdAt")'
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        groupBy = 'DATE_TRUNC(\'month\', s."createdAt")'
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        groupBy = 'DATE(s."createdAt")'
    }

    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    }

    if (gestorId) whereClause.gestorId = gestorId
    if (solicitanteId) whereClause.solicitanteId = solicitanteId

    // Buscar dados agregados
    const [
      totalStats,
      statusStats,
      dailyStats,
      pendingRequests,
      inProgressRequests
    ] = await Promise.all([
      // Total de valores por status
      prisma.solicitacao.groupBy({
        by: ['status'],
        where: whereClause,
        _sum: {
          valorTotal: true
        },
        _count: {
          id: true
        }
      }),

      // Estatísticas gerais por status
      prisma.solicitacao.groupBy({
        by: ['status'],
        _count: {
          id: true
        },
        _sum: {
          valorTotal: true
        }
      }),

      // Dados diários/mensais para gráficos
      period === 'year'
        ? prisma.$queryRaw`
            SELECT
              DATE_TRUNC('month', s."createdAt") as date,
              s.status,
              COUNT(s.id)::int as count,
              COALESCE(SUM(s."valorTotal"), 0)::float as total_value
            FROM "solicitacoes" s
            WHERE s."createdAt" >= ${startDate} AND s."createdAt" <= ${now}
              ${gestorId ? `AND s."gestorId" = '${gestorId}'` : ''}
              ${solicitanteId ? `AND s."solicitanteId" = '${solicitanteId}'` : ''}
            GROUP BY DATE_TRUNC('month', s."createdAt"), s.status
            ORDER BY date ASC
          `
        : prisma.$queryRaw`
            SELECT
              DATE(s."createdAt") as date,
              s.status,
              COUNT(s.id)::int as count,
              COALESCE(SUM(s."valorTotal"), 0)::float as total_value
            FROM "solicitacoes" s
            WHERE s."createdAt" >= ${startDate} AND s."createdAt" <= ${now}
              ${gestorId ? `AND s."gestorId" = '${gestorId}'` : ''}
              ${solicitanteId ? `AND s."solicitanteId" = '${solicitanteId}'` : ''}
            GROUP BY DATE(s."createdAt"), s.status
            ORDER BY date ASC
          `,

      // Solicitações pendentes
      prisma.solicitacao.findMany({
        where: {
          status: 'PENDENTE',
          ...(gestorId && { gestorId }),
          ...(solicitanteId && { solicitanteId })
        },
        select: {
          id: true,
          numeroOrdem: true,
          valorTotal: true,
          createdAt: true,
          pontoColeta: true,
          pontoEntrega: true,
          solicitante: {
            select: {
              usuario: {
                select: {
                  nome: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Solicitações em andamento
      prisma.solicitacao.findMany({
        where: {
          status: { in: ['APROVADA', 'EM_EXECUCAO'] },
          ...(gestorId && { gestorId }),
          ...(solicitanteId && { solicitanteId })
        },
        select: {
          id: true,
          numeroOrdem: true,
          valorTotal: true,
          status: true,
          createdAt: true,
          pontoColeta: true,
          pontoEntrega: true,
          solicitante: {
            select: {
              usuario: {
                select: {
                  nome: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    // Processar dados para o frontend
    const chartData = (dailyStats as any[]).reduce((acc, item) => {
      const dateKey = new Date(item.date).toISOString().split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          PENDENTE: { count: 0, value: 0 },
          APROVADA: { count: 0, value: 0 },
          EM_EXECUCAO: { count: 0, value: 0 },
          FINALIZADA: { count: 0, value: 0 },
          REPROVADA: { count: 0, value: 0 }
        }
      }
      acc[dateKey][item.status] = {
        count: item.count,
        value: parseFloat(item.total_value) || 0
      }
      return acc
    }, {})

    const response = {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      summary: {
        totalValue: statusStats.reduce((sum, item) => sum + (parseFloat(item._sum.valorTotal?.toString() || '0')), 0),
        totalCount: statusStats.reduce((sum, item) => sum + item._count.id, 0),
        byStatus: statusStats.map(item => ({
          status: item.status,
          count: item._count.id,
          value: parseFloat(item._sum.valorTotal?.toString() || '0')
        }))
      },
      currentPeriodStats: totalStats.map(item => ({
        status: item.status,
        count: item._count.id,
        value: parseFloat(item._sum.valorTotal?.toString() || '0')
      })),
      chartData: Object.values(chartData),
      pendingRequests: pendingRequests.map(req => ({
        ...req,
        valorTotal: parseFloat(req.valorTotal.toString())
      })),
      inProgressRequests: inProgressRequests.map(req => ({
        ...req,
        valorTotal: parseFloat(req.valorTotal.toString())
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao buscar analytics do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}