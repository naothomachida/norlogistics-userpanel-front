import { UserProfile } from '../store/authSlice';

// Lista de usuários de exemplo para testes
export const mockUsers: UserProfile[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@exemplo.com',
    role: 'admin',
    status: 'active',
    permissions: ['all'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
    managedUsers: ['2', '3', '4', '7']
  },
  {
    id: '2',
    name: 'Gerente Oliveira',
    email: 'gerente@exemplo.com',
    role: 'manager',
    status: 'active',
    permissions: ['manage_users', 'manage_orders'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Gerente&background=2563EB&color=fff',
    managedUsers: ['3', '5', '6', '7']
  },
  {
    id: '3',
    name: 'Carlos Usuário',
    email: 'usuario@exemplo.com',
    role: 'user',
    status: 'active',
    permissions: ['request_service'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Usuario&background=DC2626&color=fff',
    managerId: '2'
  },
  {
    id: '4',
    name: 'Pedro Oliveira',
    email: 'pedro@exemplo.com',
    role: 'user',
    status: 'active',
    permissions: ['view_own_orders'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Pedro+Oliveira&background=9C27B0&color=fff',
    managerId: '1'
  },
  {
    id: '5',
    name: 'Ana Costa',
    email: 'ana@exemplo.com',
    role: 'user',
    status: 'active',
    permissions: ['create_orders'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Costa&background=FF9800&color=fff',
    managerId: '2'
  },
  {
    id: '6',
    name: 'Lucas Ferreira',
    email: 'lucas@exemplo.com',
    role: 'user',
    status: 'active',
    permissions: ['view_own_orders'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Lucas+Ferreira&background=2196F3&color=fff',
    managerId: '2'
  },
  {
    id: '7',
    name: 'João Motorista',
    email: 'motorista@exemplo.com',
    role: 'driver',
    status: 'active',
    permissions: ['view_orders'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Motorista&background=16A34A&color=fff',
    managerId: '2',
    driverInfo: {
      licenseType: 'B',
      licenseNumber: '123456789',
      licenseExpiry: '2025-06-30',
      licenseIssueDate: '2015-06-30',
      vehicleType: 'Caminhão',
      experience: 5,
      hasMedicalExam: true,
      medicalExamExpiry: '2024-04-15',
      observations: 'Motorista experiente, especializado em rotas de longa distância'
    }
  }
]; 