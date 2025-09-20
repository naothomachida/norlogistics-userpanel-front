'use client'

import { useState, useEffect } from 'react'

interface DashboardAnalytics {
  period: 'day' | 'month' | 'year'
  startDate: string
  endDate: string
  summary: {
    totalValue: number
    totalCount: number
    byStatus: Array<{
      status: string
      count: number
      value: number
    }>
  }
  currentPeriodStats: Array<{
    status: string
    count: number
    value: number
  }>
  chartData: Array<{
    date: string
    PENDENTE: { count: number; value: number }
    APROVADA: { count: number; value: number }
    EM_EXECUCAO: { count: number; value: number }
    FINALIZADA: { count: number; value: number }
    REPROVADA: { count: number; value: number }
  }>
  pendingRequests: Array<{
    id: string
    numeroOrdem: string
    valorTotal: number
    createdAt: string
    pontoColeta: string
    pontoEntrega: string
    solicitante?: {
      usuario?: {
        nome: string
      }
    }
  }>
  inProgressRequests: Array<{
    id: string
    numeroOrdem: string
    valorTotal: number
    status: string
    createdAt: string
    pontoColeta: string
    pontoEntrega: string
    solicitante?: {
      usuario?: {
        nome: string
      }
    }
  }>
}

export function useDashboardAnalytics(
  period: 'day' | 'month' | 'year' = 'month',
  gestorId?: string,
  solicitanteId?: string
) {
  const [data, setData] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(gestorId && { gestorId }),
        ...(solicitanteId && { solicitanteId })
      })

      const response = await fetch(`/api/dashboard/analytics?${params}`)

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao buscar analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [period, gestorId, solicitanteId])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}