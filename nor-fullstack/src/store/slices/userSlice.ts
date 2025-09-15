import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Cliente {
  id: string
  nomeEmpresa: string
  cnpj: string
}

export interface CentroCusto {
  id: string
  nome: string
  codigo: string
}

export interface Gestor {
  id: string
  nome: string
  email: string
}

interface UserState {
  clientes: Cliente[]
  centrosCusto: CentroCusto[]
  gestores: Gestor[]
  selectedCliente: Cliente | null
  selectedCentroCusto: CentroCusto | null
  selectedGestor: Gestor | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  clientes: [],
  centrosCusto: [],
  gestores: [],
  selectedCliente: null,
  selectedCentroCusto: null,
  selectedGestor: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setClientes: (state, action: PayloadAction<Cliente[]>) => {
      state.clientes = action.payload
    },
    setCentrosCusto: (state, action: PayloadAction<CentroCusto[]>) => {
      state.centrosCusto = action.payload
    },
    setGestores: (state, action: PayloadAction<Gestor[]>) => {
      state.gestores = action.payload
    },
    setSelectedCliente: (state, action: PayloadAction<Cliente | null>) => {
      state.selectedCliente = action.payload
    },
    setSelectedCentroCusto: (state, action: PayloadAction<CentroCusto | null>) => {
      state.selectedCentroCusto = action.payload
    },
    setSelectedGestor: (state, action: PayloadAction<Gestor | null>) => {
      state.selectedGestor = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setClientes,
  setCentrosCusto,
  setGestores,
  setSelectedCliente,
  setSelectedCentroCusto,
  setSelectedGestor,
  setLoading,
  setError,
} = userSlice.actions

export default userSlice.reducer