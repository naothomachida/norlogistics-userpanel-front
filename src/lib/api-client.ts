import { User, Cliente, CentroCusto, Solicitacao, Motorista, Veiculo, CustoExtra, ApiResponse } from './api-types'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || `HTTP ${response.status}` }
      }

      return { data }
    } catch (error) {
      return { error: 'Erro de conexão' }
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    })
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me')
  }

  // Usuarios
  async getUsuarios(role?: string): Promise<ApiResponse<User[]>> {
    const query = role ? `?role=${role}` : ''
    return this.request<User[]>(`/usuarios${query}`)
  }

  async createUsuario(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUsuario(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUsuario(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/usuarios/${id}`, {
      method: 'DELETE',
    })
  }

  // Clientes
  async getClientes(): Promise<ApiResponse<Cliente[]>> {
    return this.request<Cliente[]>('/clientes')
  }

  async getCliente(id: string): Promise<ApiResponse<Cliente>> {
    return this.request<Cliente>(`/clientes/${id}`)
  }

  async createCliente(clienteData: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Cliente>> {
    return this.request<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(clienteData),
    })
  }

  async updateCliente(id: string, clienteData: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    return this.request<Cliente>(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clienteData),
    })
  }

  async deleteCliente(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/clientes/${id}`, {
      method: 'DELETE',
    })
  }

  // Centros de Custo
  async getCentrosCusto(clienteId?: string): Promise<ApiResponse<CentroCusto[]>> {
    const query = clienteId ? `?clienteId=${clienteId}` : ''
    return this.request<CentroCusto[]>(`/centros-custo${query}`)
  }

  async createCentroCusto(centroCustoData: Omit<CentroCusto, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<CentroCusto>> {
    return this.request<CentroCusto>('/centros-custo', {
      method: 'POST',
      body: JSON.stringify(centroCustoData),
    })
  }

  // Solicitações
  async getSolicitacoes(filters?: {
    status?: string
    solicitanteId?: string
    gestorId?: string
    transportadorId?: string
    motoristaId?: string
  }): Promise<ApiResponse<Solicitacao[]>> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request<Solicitacao[]>(`/solicitacoes${query}`)
  }

  async getSolicitacao(id: string): Promise<ApiResponse<Solicitacao>> {
    return this.request<Solicitacao>(`/solicitacoes/${id}`)
  }

  async createSolicitacao(solicitacaoData: Partial<Solicitacao>): Promise<ApiResponse<Solicitacao>> {
    return this.request<Solicitacao>('/solicitacoes', {
      method: 'POST',
      body: JSON.stringify(solicitacaoData),
    })
  }

  async updateSolicitacao(id: string, solicitacaoData: Partial<Solicitacao>): Promise<ApiResponse<Solicitacao>> {
    return this.request<Solicitacao>(`/solicitacoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(solicitacaoData),
    })
  }

  async aprovarSolicitacao(id: string, aprovada: boolean, gestorId: string, observacao?: string): Promise<ApiResponse<Solicitacao>> {
    return this.request<Solicitacao>(`/solicitacoes/${id}/aprovacao`, {
      method: 'POST',
      body: JSON.stringify({ gestorId, aprovada, observacao }),
    })
  }

  async atribuirSolicitacao(id: string, atribuicao: {
    transportadorId: string
    motoristaId: string
    veiculoId: string
    numeroCte?: string
    valorMotorista?: number
  }): Promise<ApiResponse<Solicitacao>> {
    return this.request<Solicitacao>(`/solicitacoes/${id}/atribuir`, {
      method: 'POST',
      body: JSON.stringify(atribuicao),
    })
  }

  // Motoristas
  async getMotoristas(transportadorId?: string): Promise<ApiResponse<Motorista[]>> {
    const query = transportadorId ? `?transportadorId=${transportadorId}` : ''
    return this.request<Motorista[]>(`/motoristas${query}`)
  }

  async createMotorista(motoristaData: Partial<Motorista>): Promise<ApiResponse<Motorista>> {
    return this.request<Motorista>('/motoristas', {
      method: 'POST',
      body: JSON.stringify(motoristaData),
    })
  }

  // Veiculos
  async getVeiculos(transportadorId?: string): Promise<ApiResponse<Veiculo[]>> {
    const query = transportadorId ? `?transportadorId=${transportadorId}` : ''
    return this.request<Veiculo[]>(`/veiculos${query}`)
  }

  async createVeiculo(veiculoData: Partial<Veiculo>): Promise<ApiResponse<Veiculo>> {
    return this.request<Veiculo>('/veiculos', {
      method: 'POST',
      body: JSON.stringify(veiculoData),
    })
  }

  // Custos Extras
  async getCustosExtras(solicitacaoId: string): Promise<ApiResponse<CustoExtra[]>> {
    return this.request<CustoExtra[]>(`/custos-extras?solicitacaoId=${solicitacaoId}`)
  }

  async createCustoExtra(custoExtraData: {
    solicitacaoId: string
    tipo: string
    valor: number
    observacao?: string
  }): Promise<ApiResponse<CustoExtra>> {
    return this.request<CustoExtra>('/custos-extras', {
      method: 'POST',
      body: JSON.stringify(custoExtraData),
    })
  }
}

export const apiClient = new ApiClient()
export default apiClient