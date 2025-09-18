// Type definitions for API responses

export interface User {
  id: string
  nome: string
  email: string
  telefone?: string
  role: 'SOLICITANTE' | 'GESTOR' | 'TRANSPORTADOR' | 'MOTORISTA'
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface Cliente {
  id: string
  nomeEmpresa: string
  cnpj: string
  endereco: string
  telefone: string
  email: string
  ativo: boolean
  createdAt: string
  updatedAt: string
  centrosCusto?: CentroCusto[]
}

export interface CentroCusto {
  id: string
  nome: string
  codigo: string
  clienteId: string
  ativo: boolean
  createdAt: string
  updatedAt: string
  cliente?: Pick<Cliente, 'id' | 'nomeEmpresa'>
}

export interface Solicitacao {
  id: string
  numeroOrdem: string
  solicitanteId: string
  clienteId: string
  centroCustoId: string
  gestorId?: string
  transportadorId?: string
  motoristaId?: string
  veiculoId?: string
  
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
  
  descricaoMaterial: string
  quantidadeVolumes: number
  dimensoes: string
  tipoEmbalagem: string
  pesoTotal: number
  numeroDanfe?: string
  valorDanfe?: number
  
  tipoVeiculo: 'VAN' | 'CAMINHONETE' | 'TRUCK' | 'CARRETA' | 'BITRUCK'
  observacoes?: string
  
  kmTotal: number
  valorPedagio: number
  valorServico: number
  valorTotal: number
  
  status: 'PENDENTE' | 'APROVADA' | 'REPROVADA' | 'EM_EXECUCAO' | 'FINALIZADA'
  
  numeroCte?: string
  valorMotorista?: number
  
  createdAt: string
  updatedAt: string
}

export interface Motorista {
  id: string
  usuarioId: string
  transportadorId?: string
  tipo: 'PROPRIO' | 'TERCEIRO'
  cnh: string
  valorPorKm?: number
  ativo: boolean
  createdAt: string
  updatedAt: string
  usuario?: Pick<User, 'id' | 'nome' | 'email' | 'telefone'>
}

export interface Veiculo {
  id: string
  placa: string
  modelo: string
  tipo: 'VAN' | 'CAMINHONETE' | 'TRUCK' | 'CARRETA' | 'BITRUCK'
  capacidade: string
  transportadorId: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface CustoExtra {
  id: string
  solicitacaoId: string
  tipo: string
  valor: number
  observacao?: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number
  page?: number
  limit?: number
}