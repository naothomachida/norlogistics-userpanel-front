import { UserProfile } from '../store/authSlice';

// Lista de usuários de exemplo para testes - WITH UNIQUE IDENTIFIER FOR TESTING
export const mockUsers: UserProfile[] = [
  {
    id: '1',
    name: 'Administrador (UPDATED)',
    email: 'admin@exemplo.com',
    role: 'admin',
    status: 'active',
    permissions: ['all'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
    managedUsers: ['4']
  },
  {
    id: '2',
    name: 'Gerente Oliveira (UPDATED)',
    email: 'gerente@exemplo.com',
    role: 'manager',
    status: 'active',
    permissions: ['manage_users', 'manage_orders'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Gerente&background=2563EB&color=fff',
    managedUsers: ['3', '7']
  },
  {
    id: '3',
    name: 'Carlos Usuário (UPDATED)',
    email: 'usuario@exemplo.com',
    role: 'user',
    status: 'active',
    permissions: ['request_service'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Carlos+Usuario&background=DC2626&color=fff',
    managerId: '2'
  },
  {
    id: '7',
    name: 'João Motorista (UPDATED)',
    email: 'motorista@exemplo.com',
    role: 'driver',
    status: 'active',
    permissions: ['view_orders'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Joao+Motorista&background=16A34A&color=fff',
    managerId: '2'
  }
]; 