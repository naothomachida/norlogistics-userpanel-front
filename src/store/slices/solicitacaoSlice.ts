import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Solicitacao {
  id?: string
  numeroOrdem?: string
  solicitanteId: string
  clienteId: string
  centroCustoId: string
  gestorId?: string
  
  // Informações da coleta/entrega
  pontoColeta: string
  enderecoColeta: string
  dataColeta: string
  horaColeta: string
  
  pontoEntrega: string
  enderecoEntrega: string
  dataEntrega: string
  horaEntrega: string
  
  pontoRetorno?: string
  enderecoRetorno?: string
  dataRetorno?: string
  horaRetorno?: string
  
  // Informações do material
  descricaoMaterial: string
  quantidadeVolumes: number
  dimensoes: string
  tipoEmbalagem: string
  pesoTotal: number
  numeroDanfe?: string
  valorDanfe?: number
  
  tipoVeiculo: 'VAN' | 'CAMINHONETE' | 'TRUCK' | 'CARRETA' | 'BITRUCK'
  observacoes?: string
  
  // Cálculos
  kmTotal?: number
  valorPedagio?: number
  valorServico?: number
  valorTotal?: number
  
  status?: 'PENDENTE' | 'APROVADA' | 'REPROVADA' | 'EM_EXECUCAO' | 'FINALIZADA'
}

interface SolicitacaoState {
  currentSolicitacao: Solicitacao | null
  solicitacoes: Solicitacao[]
  loading: boolean
  error: string | null
  currentStep: number
}

const initialState: SolicitacaoState = {
  currentSolicitacao: null,
  solicitacoes: [],
  loading: false,
  error: null,
  currentStep: 1,
}

const solicitacaoSlice = createSlice({
  name: 'solicitacao',
  initialState,
  reducers: {
    setSolicitacao: (state, action: PayloadAction<Partial<Solicitacao>>) => {
      if (state.currentSolicitacao) {
        state.currentSolicitacao = { ...state.currentSolicitacao, ...action.payload }
      } else {
        state.currentSolicitacao = action.payload as Solicitacao
      }
    },
    clearSolicitacao: (state) => {
      state.currentSolicitacao = null
      state.currentStep = 1
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },
    nextStep: (state) => {
      if (state.currentStep < 4) {
        state.currentStep += 1
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1
      }
    },
    setSolicitacoes: (state, action: PayloadAction<Solicitacao[]>) => {
      state.solicitacoes = action.payload
    },
    addSolicitacao: (state, action: PayloadAction<Solicitacao>) => {
      state.solicitacoes.push(action.payload)
    },
    updateSolicitacao: (state, action: PayloadAction<Solicitacao>) => {
      const index = state.solicitacoes.findIndex(s => s.id === action.payload.id)
      if (index !== -1) {
        state.solicitacoes[index] = action.payload
      }
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
  setSolicitacao,
  clearSolicitacao,
  setCurrentStep,
  nextStep,
  prevStep,
  setSolicitacoes,
  addSolicitacao,
  updateSolicitacao,
  setLoading,
  setError,
} = solicitacaoSlice.actions

export default solicitacaoSlice.reducer