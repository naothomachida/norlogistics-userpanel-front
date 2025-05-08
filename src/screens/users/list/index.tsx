import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../store';
import { fetchUsers, UserProfile } from '../../../store/authSlice';
import Header from '../../../components/layout/Header';
import './list.css';

// Tipo para representar os filtros
type UserFilters = {
  status: string; // 'active' ou 'inactive'
  role: string; // 'admin', 'manager', 'dispatcher', 'driver'
  searchQuery: string;
};

const UsersList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, usersLoading, userProfile } = useSelector((state: RootState) => state.auth);
  
  // Estado para os filtros
  const [filters, setFilters] = useState<UserFilters>({
    status: 'all',
    role: 'all',
    searchQuery: ''
  });

  // Controle para o dropdown de filtros
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Carregar usuários quando o componente é montado
  useEffect(() => {
    dispatch(fetchUsers() as any);
  }, [dispatch]);

  // Função para atualizar os filtros
  const updateFilter = (filterType: keyof UserFilters, value: string) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
    
    // Fechar o dropdown correspondente
    if (filterType === 'status') setShowStatusDropdown(false);
    if (filterType === 'role') setShowRoleDropdown(false);
  };

  // Função para contar quantos filtros estão ativos
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.role !== 'all') count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      role: 'all',
      searchQuery: ''
    });
  };

  // Corrigir a função que verifica se um usuário está inativo
  const isUserActive = (user: UserProfile): boolean => {
    return user.status === 'active';
  };

  // Filtragem dos usuários
  const filteredUsers = useMemo(() => {
    if (!users.length) return [];
    
    return users.filter(user => {
      // Filtro por status (usando função auxiliar)
      if (filters.status !== 'all') {
        const isActive = isUserActive(user);
        if (filters.status === 'active' && !isActive) return false;
        if (filters.status === 'inactive' && isActive) return false;
      }
      
      // Filtro por função
      if (filters.role !== 'all' && user.role !== filters.role) {
        return false;
      }
      
      // Filtro por termo de busca
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const nameMatches = user.name.toLowerCase().includes(searchLower);
        const emailMatches = user.email.toLowerCase().includes(searchLower);
        
        if (!nameMatches && !emailMatches) {
          return false;
        }
      }
      
      return true;
    });
  }, [users, filters]);

  // Navegar para a tela de visualização do usuário
  const handleViewUserDetails = (userId: string) => {
    navigate(`/users/edit/${userId}`);
  };

  // Navegar para a tela de atribuição de gerente
  const handleShowManagerModal = (userId: string) => {
    navigate(`/users/manager/${userId}`);
  };

  // Navegar para a tela de edição do usuário
  const handleEditUser = (userId: string) => {
    navigate(`/users/edit/${userId}`);
  };

  // Navegar para a tela de criação de usuário
  const handleAddUser = () => {
    navigate('/users/new');
  };

  // Traduzir status para português
  const translateStatus = (status: string) => {
    const translations: Record<string, string> = {
      'all': 'Todos',
      'active': 'Ativo',
      'inactive': 'Inativo'
    };
    return translations[status] || status;
  };

  // Traduzir função para português
  const translateRole = (role: string) => {
    const translations: Record<string, string> = {
      'all': 'Todas',
      'admin': 'Administrador',
      'manager': 'Gerente',
      'dispatcher': 'Despachante',
      'driver': 'Motorista',
      'user': 'Usuário'
    };
    return translations[role] || role;
  };
  
  // Obter classe CSS para o papel
  const getRoleClass = (role: string) => {
    const classes: Record<string, string> = {
      'admin': 'role-admin',
      'manager': 'role-manager',
      'dispatcher': 'role-dispatcher',
      'driver': 'role-driver',
      'user': 'role-user'
    };
    return classes[role] || '';
  };

  return (
    <div className="users-page">
      <Header />
      <div className="users-content">
        <main className="users-main">
          <div className="users-title-row">
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '20px' }}>
              <h1 className="users-title">Usuários</h1>
              <span className="users-title-count">{filteredUsers.length}</span>
            </div>
            <div className="action-buttons">
              <button 
                className="action-button new-user"
                onClick={handleAddUser}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Adicionar Usuário
              </button>
              <button className="action-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
                </svg>
                Exportar
              </button>
            </div>
          </div>

          <div className="users-filters">
            <div className="filter-group filter-dropdown">
              <div 
                className="filter-selected" 
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowRoleDropdown(false);
                }}
              >
                <span>Status: {translateStatus(filters.status)}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z" fill="currentColor" />
                </svg>
              </div>
              {showStatusDropdown && (
                <div className="filter-options">
                  <div 
                    className={`filter-option ${filters.status === 'all' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('status', 'all')}
                  >
                    Todos
                  </div>
                  <div 
                    className={`filter-option ${filters.status === 'active' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('status', 'active')}
                  >
                    Ativo
                  </div>
                  <div 
                    className={`filter-option ${filters.status === 'inactive' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('status', 'inactive')}
                  >
                    Inativo
                  </div>
                </div>
              )}
            </div>
            
            <div className="filter-group filter-dropdown">
              <div 
                className="filter-selected" 
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowStatusDropdown(false);
                }}
              >
                <span>Função: {translateRole(filters.role)}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z" fill="currentColor" />
                </svg>
              </div>
              {showRoleDropdown && (
                <div className="filter-options">
                  <div 
                    className={`filter-option ${filters.role === 'all' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('role', 'all')}
                  >
                    Todas
                  </div>
                  <div 
                    className={`filter-option ${filters.role === 'admin' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('role', 'admin')}
                  >
                    Administrador
                  </div>
                  <div 
                    className={`filter-option ${filters.role === 'manager' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('role', 'manager')}
                  >
                    Gerente
                  </div>
                  <div 
                    className={`filter-option ${filters.role === 'dispatcher' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('role', 'dispatcher')}
                  >
                    Despachante
                  </div>
                  <div 
                    className={`filter-option ${filters.role === 'driver' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('role', 'driver')}
                  >
                    Motorista
                  </div>
                </div>
              )}
            </div>
            
            <div className="filter-spacer"></div>
            
            <div className="search-input">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
              </svg>
              <input 
                type="text" 
                placeholder="Buscar usuário..."
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
              />
            </div>
            
            {activeFilterCount > 0 && (
              <button className="filter-clear" onClick={clearAllFilters}>
                Limpar filtros ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="users-table-container">
            {usersLoading ? (
              <div className="table-loading">
                <div className="loading-spinner"></div>
                <p>Carregando usuários...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
            <div className="no-users">
                <p>Nenhum usuário encontrado.</p>
            </div>
          ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Função</th>
                    <th>Gerente</th>
                    <th>Usuários gerenciados</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => {
                    // Encontrar o gerente deste usuário
                    const manager = user.managerId ? users.find(u => u.id === user.managerId) : null;
                    // Contagem de usuários gerenciados
                    const managedCount = user.managedUsers?.length || 0;
                    
                    return (
                    <tr key={user.id}>
                        <td>
                          <div className="user-name-cell">
                            <div className="user-avatar">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} />
                              ) : (
                                <div className="avatar-placeholder">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>{user.name}</div>
                          </div>
                        </td>
                      <td>{user.email}</td>
                      <td>
                          <span className={`role-badge ${getRoleClass(user.role)}`}>
                            {translateRole(user.role)}
                          </span>
                        </td>
                        <td>
                          {manager ? (
                            <div className="manager-name" onClick={() => handleViewUserDetails(manager.id)}>
                              {manager.name}
                        </div>
                          ) : (
                            <span className="no-manager">Não atribuído</span>
                          )}
                      </td>
                      <td>
                          {managedCount > 0 ? (
                            <span className="managed-count">{managedCount} usuário{managedCount !== 1 ? 's' : ''}</span>
                          ) : (
                            <span className="no-users">Nenhum</span>
                          )}
                      </td>
                      <td>
                        <div className="action-icons">
                            <button 
                              className="action-button view" 
                              title="Ver detalhes"
                              onClick={() => handleViewUserDetails(user.id)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                              </svg>
                              Ver
                            </button>
                            <button 
                              className="action-button delete" 
                              title="Excluir usuário"
                              onClick={() => {
                                if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
                                  // Aqui adicionaríamos a lógica para excluir o usuário
                                  console.log(`Excluir usuário ${user.id}`);
                                }
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" />
                              </svg>
                              Excluir
                            </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UsersList; 