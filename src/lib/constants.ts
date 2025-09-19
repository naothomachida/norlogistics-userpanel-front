import { BarChart3, Map, Package, Truck, Settings, User, Users, Building } from 'lucide-react'

export const ROLES = {
  GESTOR: 'GESTOR',
  SOLICITANTE: 'SOLICITANTE',
  TRANSPORTADOR: 'TRANSPORTADOR',
  MOTORISTA: 'MOTORISTA'
} as const

export const ROLE_LABELS = {
  [ROLES.GESTOR]: 'Gestor',
  [ROLES.SOLICITANTE]: 'Solicitante',
  [ROLES.TRANSPORTADOR]: 'Transportador',
  [ROLES.MOTORISTA]: 'Motorista'
} as const

export const ROLE_COLORS = {
  [ROLES.GESTOR]: 'bg-red-100 text-red-800',
  [ROLES.SOLICITANTE]: 'bg-yellow-100 text-yellow-800',
  [ROLES.TRANSPORTADOR]: 'bg-blue-100 text-blue-800',
  [ROLES.MOTORISTA]: 'bg-green-100 text-green-800'
} as const

export const STATUS_COLORS = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  APROVADA: 'bg-green-100 text-green-800',
  REPROVADA: 'bg-red-100 text-red-800',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-800',
  CONCLUIDA: 'bg-gray-100 text-gray-800'
} as const

export const MENU_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    roles: [ROLES.GESTOR, ROLES.SOLICITANTE, ROLES.TRANSPORTADOR, ROLES.MOTORISTA],
    icon: BarChart3
  },
  {
    name: 'Calcular Rotas',
    href: '/calcular-rotas',
    roles: [ROLES.GESTOR, ROLES.TRANSPORTADOR],
    icon: Map
  },
  {
    name: 'Solicitar Coleta',
    href: '/solicitar-coleta',
    roles: [ROLES.GESTOR, ROLES.SOLICITANTE, ROLES.TRANSPORTADOR],
    icon: Package
  },
  {
    name: 'Minhas Solicitações',
    href: '/minhas-solicitacoes',
    roles: [ROLES.SOLICITANTE],
    icon: Package
  },
  {
    name: 'Registrar Viagem',
    href: '/registrar-viagem',
    roles: [ROLES.GESTOR, ROLES.TRANSPORTADOR, ROLES.MOTORISTA],
    icon: Truck
  },
  {
    name: 'Operações',
    href: '/operacoes',
    roles: [ROLES.GESTOR, ROLES.TRANSPORTADOR],
    icon: Settings
  },
  {
    name: 'Motorista',
    href: '/motorista',
    roles: [ROLES.MOTORISTA],
    icon: User
  },
  {
    name: 'Admin - Usuários',
    href: '/admin/usuarios',
    roles: [ROLES.GESTOR],
    icon: Users
  },
  {
    name: 'Admin - Clientes',
    href: '/admin/clientes',
    roles: [ROLES.GESTOR],
    icon: Building
  }
] as const