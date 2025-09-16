import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockUsers } from '../data/mockUsers';

// Debug log to check imported mockUsers
console.log('authSlice imported mockUsers:', JSON.stringify(mockUsers));

// Definir tipos para o perfil do usuário
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'driver';
  status: 'active' | 'inactive';
  permissions?: string[];
  avatarUrl?: string;
  // Novos campos para perfil completo
  phone?: string;
  department?: string;
  location?: string;
  bio?: string;
  // Referência ao gerente (para usuários que têm um gerente)
  managerId?: string;
  // Lista de IDs de usuários gerenciados (para gerentes)
  managedUsers?: string[];
  // Informações específicas para motoristas
  driverInfo?: {
    licenseType?: string; // A, B, C, D, E, AB, etc.
    licenseNumber?: string; // Número da CNH
    licenseExpiry?: string; // Data de vencimento da CNH
    licenseIssueDate?: string; // Data de emissão da CNH
    vehicleType?: string; // Tipo de veículo que está habilitado a dirigir
    experience?: number; // Anos de experiência
    hasMedicalExam?: boolean; // Se possui exame médico válido
    medicalExamExpiry?: string; // Data de vencimento do exame médico
    observations?: string; // Observações adicionais
  };
}

// Interface para o estado de autenticação
interface AuthState {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  // Lista de usuários para gerenciamento
  users: UserProfile[];
  // Flag de carregamento para lista de usuários
  usersLoading: boolean;
}

// Estado inicial
const initialState: AuthState = {
  isAuthenticated: false,
  userProfile: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  users: mockUsers,
  usersLoading: false
};

// Criar o slice de autenticação
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Ação para quando o login é iniciado
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // Ação para quando o login é bem-sucedido
    loginSuccess: (state, action: PayloadAction<{
      userProfile: UserProfile;
      accessToken: string;
      refreshToken?: string;
    }>) => {
      state.isAuthenticated = true;
      state.userProfile = action.payload.userProfile;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || null;
      state.loading = false;
      state.error = null;
      
      // Log do perfil do usuário no console
      console.log('Usuário logado:', action.payload.userProfile);
    },
    
    // Ação para quando o login falha
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.userProfile = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = action.payload;
      
      console.error('Erro de login:', action.payload);
    },
    
    // Ação para atualizar o perfil do usuário
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.userProfile) {
        state.userProfile = {
          ...state.userProfile,
          ...action.payload
        };
        
        // Atualizar usuário na lista de usuários também
        const userIndex = state.users.findIndex(u => u.id === state.userProfile?.id);
        if (userIndex >= 0) {
          state.users[userIndex] = {
            ...state.users[userIndex],
            ...action.payload
          };
        }
        
        console.log('Perfil atualizado:', state.userProfile);
      }
    },

    // Ação para carregar usuários
    fetchUsersStart: (state) => {
      state.usersLoading = true;
    },

    // Ação para quando os usuários são carregados com sucesso
    fetchUsersSuccess: (state, action: PayloadAction<UserProfile[]>) => {
      state.users = action.payload;
      state.usersLoading = false;
    },

    // Ação para atualizar um usuário específico
    updateUser: (state, action: PayloadAction<{userId: string, changes: Partial<UserProfile>}>) => {
      const { userId, changes } = action.payload;
      const userIndex = state.users.findIndex(user => user.id === userId);
      
      if (userIndex >= 0) {
        state.users[userIndex] = {
          ...state.users[userIndex],
          ...changes
        };
        
        console.log(`Usuário ${userId} atualizado:`, state.users[userIndex]);
      }
    },

    // Ação para atribuir um gerente a um usuário
    assignManager: (state, action: PayloadAction<{userId: string, managerId: string}>) => {
      const { userId, managerId } = action.payload;
      const userIndex = state.users.findIndex(user => user.id === userId);
      const managerIndex = state.users.findIndex(user => user.id === managerId);
      
      if (userIndex >= 0 && managerIndex >= 0) {
        // Atribuir o gerente ao usuário
        state.users[userIndex].managerId = managerId;
        
        // Adicionar o usuário à lista de gerenciados do gerente
        if (!state.users[managerIndex].managedUsers) {
          state.users[managerIndex].managedUsers = [];
        }
        
        if (!state.users[managerIndex].managedUsers?.includes(userId)) {
          state.users[managerIndex].managedUsers?.push(userId);
        }
        
        console.log(`Gerente ${managerId} atribuído ao usuário ${userId}`);
      }
    },

    // Ação para remover um gerente de um usuário
    removeManager: (state, action: PayloadAction<{userId: string, managerId: string}>) => {
      const { userId, managerId } = action.payload;
      const userIndex = state.users.findIndex(user => user.id === userId);
      const managerIndex = state.users.findIndex(user => user.id === managerId);
      
      if (userIndex >= 0) {
        // Remover o gerente do usuário
        state.users[userIndex].managerId = undefined;
        
        // Remover o usuário da lista de gerenciados do gerente
        if (managerIndex >= 0 && state.users[managerIndex].managedUsers) {
          state.users[managerIndex].managedUsers = state.users[managerIndex].managedUsers?.filter(
            id => id !== userId
          );
        }
        
        console.log(`Gerente ${managerId} removido do usuário ${userId}`);
      }
    },
    
    // Ação para logout
    logout: (state) => {
      console.log('Usuário deslogado');
      return initialState;
    }
  }
});

// Exportar actions e reducer
export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  updateUserProfile, 
  fetchUsersStart,
  fetchUsersSuccess,
  updateUser,
  assignManager,
  removeManager,
  logout 
} = authSlice.actions;

export default authSlice.reducer;

// Thunk para simular login (para testes)
export const loginUser = (credentials: { email: string; password: string }) => async (dispatch: any) => {
  try {
    dispatch(loginStart());
    
    // Simular chamada API (para testes)
    // Em produção, isso seria uma chamada real para API de autenticação
    console.log('Tentando login com:', credentials);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar por diferentes tipos de usuários
    let userProfile: UserProfile | null = null;
    
    if (credentials.email === 'admin@exemplo.com' && credentials.password === 'senha123') {
      userProfile = {
        id: '1',
        name: 'Administrador',
        email: credentials.email,
        role: 'admin',
        status: 'active',
        permissions: ['all'],
        avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
        managedUsers: ['2', '3', '4', '7']
      };
    } 
    else if (credentials.email === 'gerente@exemplo.com' && credentials.password === 'senha123') {
      userProfile = {
        id: '2',
        name: 'Gerente Oliveira',
        email: credentials.email,
        role: 'manager',
        status: 'active',
        permissions: ['manage_users', 'manage_orders'],
        avatarUrl: 'https://ui-avatars.com/api/?name=Gerente&background=2563EB&color=fff',
        managedUsers: ['3', '4', '5']
      };
    }
    else if (credentials.email === 'motorista@exemplo.com' && credentials.password === 'senha123') {
      userProfile = {
        id: '5',
        name: 'João Motorista',
        email: credentials.email,
        role: 'driver',
        status: 'active',
        permissions: ['view_orders'],
        avatarUrl: 'https://ui-avatars.com/api/?name=Motorista&background=16A34A&color=fff',
        driverInfo: {
          licenseType: 'B',
          licenseNumber: '123456789',
          experience: 5
        }
      };
    }
    else if (credentials.email === 'usuario@exemplo.com' && credentials.password === 'senha123') {
      userProfile = {
        id: '3',
        name: 'Carlos Usuário',
        email: credentials.email,
        role: 'user',
        status: 'active',
        permissions: ['request_service'],
        avatarUrl: 'https://ui-avatars.com/api/?name=Usuario&background=DC2626&color=fff',
        managerId: '2'
      };
    }
    // Fallback para login de administrador (para testes)
    else {
      userProfile = {
        id: '1',
        name: 'Administrador',
        email: 'admin@exemplo.com',
        role: 'admin',
        status: 'active',
        permissions: ['all'],
        avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
        managedUsers: ['2', '3', '4', '7']
      };
    }
    
    if (userProfile) {
      dispatch(loginSuccess({
        userProfile,
        accessToken: 'fake-jwt-token-12345',
        refreshToken: 'fake-refresh-token-12345'
      }));
      
      // Salvar no localStorage para persistência
      localStorage.setItem('authToken', 'fake-jwt-token-12345');
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      return { success: true };
    } else {
      dispatch(loginFailure('Credenciais inválidas. Por favor, verifique seu email e senha.'));
      return { success: false };
    }
  } catch (error) {
    dispatch(loginFailure('Erro ao fazer login. Tente novamente mais tarde.'));
    return { success: false };
  }
};

// Thunk para verificar autenticação atual (para persistência)
export const checkAuth = () => (dispatch: any) => {
  const token = localStorage.getItem('authToken');
  const userProfileString = localStorage.getItem('userProfile');
  
  if (token && userProfileString) {
    try {
      const userProfile = JSON.parse(userProfileString) as UserProfile;
      
      dispatch(loginSuccess({
        userProfile,
        accessToken: token
      }));
      
      console.log('Sessão restaurada para:', userProfile.name);
      return true;
    } catch (e) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      return false;
    }
  }
  
  return false;
};

// Thunk para buscar todos os usuários
export const fetchUsers = () => async (dispatch: any) => {
  try {
    // Log for debugging where users are coming from
    console.log('fetchUsers called, mockUsers at this point:', JSON.stringify(mockUsers));
    
    dispatch(fetchUsersStart());
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Usar os dados do mockUsers
    dispatch(fetchUsersSuccess(mockUsers));
    console.log('Usuários carregados após fetchUsersSuccess:', mockUsers);
    
    return { success: true, users: mockUsers };
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    return { success: false };
  }
}; 