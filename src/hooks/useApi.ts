'use client'

import { useState, useEffect, useCallback } from 'react'
import apiClient from '@/lib/api-client'
import { User, Cliente, Solicitacao, Motorista, Veiculo } from '@/lib/api-types'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseApiListState<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useUsuarios(role?: string): UseApiListState<User> {
  const [state, setState] = useState<UseApiListState<User>>({
    data: [],
    loading: true,
    error: null,
    refetch: () => {}
  })

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    const result = await apiClient.getUsuarios(role)
    
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error! }))
    } else {
      setState(prev => ({ ...prev, loading: false, data: result.data || [] }))
    }
  }, [role])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

export function useClientes(): UseApiListState<Cliente> {
  const [state, setState] = useState<UseApiListState<Cliente>>({
    data: [],
    loading: true,
    error: null,
    refetch: () => {}
  })

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    const result = await apiClient.getClientes()
    
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error! }))
    } else {
      setState(prev => ({ ...prev, loading: false, data: result.data || [] }))
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

export function useCliente(id: string): UseApiState<Cliente> {
  const [state, setState] = useState<UseApiState<Cliente>>({
    data: null,
    loading: true,
    error: null,
    refetch: () => {}
  })

  const fetchData = useCallback(async () => {
    if (!id) return
    
    setState(prev => ({ ...prev, loading: true, error: null }))
    const result = await apiClient.getCliente(id)
    
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error! }))
    } else {
      setState(prev => ({ ...prev, loading: false, data: result.data || null }))
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

export function useSolicitacoes(filters?: {
  status?: string
  solicitanteId?: string
  gestorId?: string
  transportadorId?: string
  motoristaId?: string
}): UseApiListState<Solicitacao> {
  const [state, setState] = useState<UseApiListState<Solicitacao>>({
    data: [],
    loading: true,
    error: null,
    refetch: () => {}
  })

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    const result = await apiClient.getSolicitacoes(filters)

    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error! }))
    } else {
      setState(prev => ({ ...prev, loading: false, data: result.data || [] }))
    }
  }, [
    filters?.status,
    filters?.solicitanteId,
    filters?.gestorId,
    filters?.transportadorId,
    filters?.motoristaId
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

export function useMotoristas(transportadorId?: string): UseApiListState<Motorista> {
  const [state, setState] = useState<UseApiListState<Motorista>>({
    data: [],
    loading: true,
    error: null,
    refetch: () => {}
  })

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    const result = await apiClient.getMotoristas(transportadorId)
    
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error! }))
    } else {
      setState(prev => ({ ...prev, loading: false, data: result.data || [] }))
    }
  }, [transportadorId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

export function useVeiculos(transportadorId?: string): UseApiListState<Veiculo> {
  const [state, setState] = useState<UseApiListState<Veiculo>>({
    data: [],
    loading: true,
    error: null,
    refetch: () => {}
  })

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    const result = await apiClient.getVeiculos(transportadorId)
    
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error! }))
    } else {
      setState(prev => ({ ...prev, loading: false, data: result.data || [] }))
    }
  }, [transportadorId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}