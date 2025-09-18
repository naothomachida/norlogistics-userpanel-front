export const APP_TEXT = {
  // App Info
  APP_NAME: 'Nor Logistics',
  APP_TAGLINE: 'Sistema de Gestão',

  // Common Actions
  ACTIONS: {
    SAVE: 'Salvar',
    CANCEL: 'Cancelar',
    DELETE: 'Excluir',
    EDIT: 'Editar',
    VIEW: 'Visualizar',
    CREATE: 'Criar',
    UPDATE: 'Atualizar',
    SEARCH: 'Buscar',
    FILTER: 'Filtrar',
    EXPORT: 'Exportar',
    IMPORT: 'Importar',
    APPROVE: 'Aprovar',
    REJECT: 'Reprovar',
    SUBMIT: 'Enviar',
    RESET: 'Resetar',
    LOGOUT: 'Sair do Sistema',
    LOGIN: 'Entrar',
    CONFIRM: 'Confirmar'
  },

  // Status Labels
  STATUS: {
    PENDING: 'Pendente',
    APPROVED: 'Aprovada',
    REJECTED: 'Reprovada',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluída',
    CANCELLED: 'Cancelada',
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo'
  },

  // Navigation
  NAVIGATION: {
    DASHBOARD: 'Dashboard',
    CALCULATE_ROUTES: 'Calcular Rotas',
    REQUEST_PICKUP: 'Solicitar Coleta',
    REGISTER_TRIP: 'Registrar Viagem',
    OPERATIONS: 'Operações',
    DRIVER: 'Motorista',
    ADMIN_USERS: 'Admin - Usuários',
    ADMIN_CLIENTS: 'Admin - Clientes',
    REPORTS: 'Relatórios'
  },

  // Dashboard
  DASHBOARD: {
    TITLE: 'Dashboard',
    WELCOME: (name: string) => `Bem-vindo, ${name}!`,
    DESCRIPTION: 'Gerencie aprovações e usuários.',

    STATS: {
      PENDING_APPROVALS: 'Pendentes de Aprovação',
      APPROVED_TODAY: 'Aprovadas Hoje',
      REJECTED_TODAY: 'Reprovadas Hoje',
      TOTAL_USERS: 'Total de Usuários'
    },

    QUICK_ACTIONS: {
      TITLE: 'Ações Rápidas',
      MANAGE_USERS: {
        TITLE: 'Gerenciar Usuários',
        DESCRIPTION: 'Cadastrar e editar usuários'
      },
      MANAGE_CLIENTS: {
        TITLE: 'Gerenciar Clientes',
        DESCRIPTION: 'Cadastrar empresas e centros de custo'
      },
      REPORTS: {
        TITLE: 'Relatórios',
        DESCRIPTION: 'Visualizar relatórios e estatísticas'
      },
      ROUTE_CALCULATOR: {
        TITLE: 'Calculadora de Rotas',
        DESCRIPTION: 'Compare rotas e custos logísticos'
      }
    },

    PENDING_REQUESTS: {
      TITLE: 'Solicitações Pendentes de Aprovação',
      DESCRIPTION: (count: number) => `${count} solicitação(ões) aguardando sua aprovação`,
      NO_REQUESTS: 'Nenhuma solicitação pendente',
      LOADING: 'Carregando...'
    }
  },

  // Forms
  FORMS: {
    LABELS: {
      NAME: 'Nome',
      EMAIL: 'E-mail',
      PASSWORD: 'Senha',
      PHONE: 'Telefone',
      ADDRESS: 'Endereço',
      COMPANY: 'Empresa',
      ROLE: 'Função',
      STATUS: 'Status',
      DESCRIPTION: 'Descrição',
      DATE: 'Data',
      VALUE: 'Valor',
      PICKUP_POINT: 'Ponto de Coleta',
      DELIVERY_POINT: 'Ponto de Entrega'
    },

    PLACEHOLDERS: {
      ENTER_NAME: 'Digite o nome',
      ENTER_EMAIL: 'Digite o e-mail',
      ENTER_PASSWORD: 'Digite a senha',
      SELECT_OPTION: 'Selecione uma opção'
    },

    VALIDATION: {
      REQUIRED: 'Este campo é obrigatório',
      INVALID_EMAIL: 'E-mail inválido',
      PASSWORD_MIN_LENGTH: 'Senha deve ter pelo menos 6 caracteres',
      PASSWORDS_DONT_MATCH: 'Senhas não coincidem'
    }
  },

  // Messages
  MESSAGES: {
    SUCCESS: {
      CREATED: 'Criado com sucesso!',
      UPDATED: 'Atualizado com sucesso!',
      DELETED: 'Excluído com sucesso!',
      SAVED: 'Salvo com sucesso!',
      APPROVED: 'Aprovado com sucesso!',
      REJECTED: 'Reprovado com sucesso!'
    },

    ERROR: {
      GENERIC: 'Ocorreu um erro. Tente novamente.',
      CONNECTION: 'Erro de conexão',
      UNAUTHORIZED: 'Não autorizado',
      NOT_FOUND: 'Item não encontrado',
      VALIDATION: 'Dados inválidos'
    },

    CONFIRMATION: {
      DELETE: 'Tem certeza que deseja excluir?',
      APPROVE: 'Tem certeza que deseja aprovar esta solicitação?',
      REJECT: 'Tem certeza que deseja reprovar esta solicitação?',
      LOGOUT: 'Tem certeza que deseja sair do sistema?'
    }
  },

  // Roles
  ROLES: {
    GESTOR: 'Gestor',
    SOLICITANTE: 'Solicitante',
    TRANSPORTADOR: 'Transportador',
    MOTORISTA: 'Motorista'
  }
} as const

// Currency and date formatting helpers
export const FORMAT_TEXT = {
  currency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  },

  date: (date: string | Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date))
  },

  dateTime: (date: string | Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }
}