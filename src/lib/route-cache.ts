import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export interface RouteCacheParams {
  origin: string
  destination: string
  waypoints?: string[]
  vehicleType: string
  vehicleAxis?: string
  freightCategory?: string
  cargoType?: string
  topSpeed?: string | null
  fuelConsumption?: number
  showTolls?: boolean
  showFreightTable?: boolean
  showPolyline?: boolean
  forceUpdate?: boolean
}

export interface CacheEntry {
  id: string
  payloadHash: string
  origem: string
  destino: string
  pontoParadas: string | null
  tipoVeiculo: string
  eixosVeiculo: string | null
  categoriaFrete: string | null
  tipoCarga: string | null
  mostrarPedagios: boolean
  mostrarTabela: boolean
  mostrarRota: boolean
  qualpResponse: string
  primeiraConsulta: Date
  ultimaConsulta: Date
  totalConsultas: number
  forcarAtualizacao: boolean
  createdAt: Date
  updatedAt: Date
}

export class RouteCacheManager {
  /**
   * Gera um hash único para o payload da requisição
   */
  private generatePayloadHash(params: RouteCacheParams): string {
    const payload = {
      origin: params.origin.toLowerCase().trim(),
      destination: params.destination.toLowerCase().trim(),
      waypoints: params.waypoints?.map(w => w.toLowerCase().trim()).sort() || [],
      vehicleType: params.vehicleType,
      vehicleAxis: params.vehicleAxis || 'all',
      freightCategory: params.freightCategory || 'A',
      cargoType: params.cargoType || 'geral',
      topSpeed: params.topSpeed || null,
      fuelConsumption: params.fuelConsumption || null,
      showTolls: params.showTolls ?? true,
      showFreightTable: params.showFreightTable ?? true,
      showPolyline: params.showPolyline ?? true
    }

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex')
  }

  /**
   * Busca uma entrada no cache
   */
  async findCacheEntry(params: RouteCacheParams): Promise<CacheEntry | null> {
    // Se forceUpdate estiver true, não buscar no cache
    if (params.forceUpdate) {
      return null
    }

    const hash = this.generatePayloadHash(params)

    try {
      const entry = await prisma.routeCache.findUnique({
        where: { payloadHash: hash }
      })

      // Se encontrou uma entrada e não está marcada para forçar atualização
      if (entry && !entry.forcarAtualizacao) {
        // Atualizar contadores
        await prisma.routeCache.update({
          where: { id: entry.id },
          data: {
            ultimaConsulta: new Date(),
            totalConsultas: { increment: 1 }
          }
        })

        return entry
      }

      return null
    } catch (error) {
      console.error('Erro ao buscar cache:', error)
      return null
    }
  }

  /**
   * Salva uma resposta no cache
   */
  async saveCacheEntry(params: RouteCacheParams, qualpResponse: any): Promise<void> {
    const hash = this.generatePayloadHash(params)

    try {
      // Verificar se já existe uma entrada
      const existing = await prisma.routeCache.findUnique({
        where: { payloadHash: hash }
      })

      if (existing) {
        // Atualizar entrada existente
        await prisma.routeCache.update({
          where: { id: existing.id },
          data: {
            qualpResponse: JSON.stringify(qualpResponse),
            ultimaConsulta: new Date(),
            totalConsultas: { increment: 1 },
            forcarAtualizacao: false // Reset da flag
          }
        })
      } else {
        // Criar nova entrada
        await prisma.routeCache.create({
          data: {
            payloadHash: hash,
            origem: params.origin,
            destino: params.destination,
            pontoParadas: params.waypoints ? JSON.stringify(params.waypoints) : null,
            tipoVeiculo: params.vehicleType,
            eixosVeiculo: params.vehicleAxis || null,
            categoriaFrete: params.freightCategory || null,
            tipoCarga: params.cargoType || null,
            mostrarPedagios: params.showTolls ?? true,
            mostrarTabela: params.showFreightTable ?? true,
            mostrarRota: params.showPolyline ?? true,
            qualpResponse: JSON.stringify(qualpResponse),
            forcarAtualizacao: false
          }
        })
      }
    } catch (error) {
      console.error('Erro ao salvar cache:', error)
      // Não falhar a operação por causa do cache
    }
  }

  /**
   * Marca uma entrada para forçar atualização na próxima consulta
   */
  async markForUpdate(params: RouteCacheParams): Promise<void> {
    const hash = this.generatePayloadHash(params)

    try {
      await prisma.routeCache.updateMany({
        where: { payloadHash: hash },
        data: { forcarAtualizacao: true }
      })
    } catch (error) {
      console.error('Erro ao marcar cache para atualização:', error)
    }
  }

  /**
   * Remove entradas antigas do cache (limpeza)
   */
  async cleanOldEntries(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    try {
      const result = await prisma.routeCache.deleteMany({
        where: {
          ultimaConsulta: {
            lt: cutoffDate
          }
        }
      })

      return result.count
    } catch (error) {
      console.error('Erro ao limpar cache antigo:', error)
      return 0
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  async getCacheStats(): Promise<{
    totalEntries: number
    totalQueries: number
    oldestEntry: Date | null
    newestEntry: Date | null
  }> {
    try {
      const [totalEntries, totalQueries, oldestEntry, newestEntry] = await Promise.all([
        prisma.routeCache.count(),
        prisma.routeCache.aggregate({
          _sum: { totalConsultas: true }
        }),
        prisma.routeCache.findFirst({
          orderBy: { primeiraConsulta: 'asc' },
          select: { primeiraConsulta: true }
        }),
        prisma.routeCache.findFirst({
          orderBy: { primeiraConsulta: 'desc' },
          select: { primeiraConsulta: true }
        })
      ])

      return {
        totalEntries,
        totalQueries: totalQueries._sum.totalConsultas || 0,
        oldestEntry: oldestEntry?.primeiraConsulta || null,
        newestEntry: newestEntry?.primeiraConsulta || null
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas do cache:', error)
      return {
        totalEntries: 0,
        totalQueries: 0,
        oldestEntry: null,
        newestEntry: null
      }
    }
  }

  /**
   * Lista entradas mais consultadas
   */
  async getMostQueriedRoutes(limit: number = 10): Promise<Array<{
    origem: string
    destino: string
    totalConsultas: number
    ultimaConsulta: Date
  }>> {
    try {
      const entries = await prisma.routeCache.findMany({
        orderBy: { totalConsultas: 'desc' },
        take: limit,
        select: {
          origem: true,
          destino: true,
          totalConsultas: true,
          ultimaConsulta: true
        }
      })

      return entries
    } catch (error) {
      console.error('Erro ao buscar rotas mais consultadas:', error)
      return []
    }
  }
}

// Instância singleton
export const routeCacheManager = new RouteCacheManager()