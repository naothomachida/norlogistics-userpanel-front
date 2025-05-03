import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import './users.css';

// Sample user data 
const initialUsers = [
  { id: '1', name: 'João Silva', email: 'joao.silva@example.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Maria Souza', email: 'maria.souza@example.com', role: 'user', status: 'active' },
  { id: '3', name: 'Carlos Oliveira', email: 'carlos.oliveira@example.com', role: 'user', status: 'inactive' },
  { id: '4', name: 'Ana Santos', email: 'ana.santos@example.com', role: 'manager', status: 'active' },
  { id: '5', name: 'Roberto Ferreira', email: 'roberto.ferreira@example.com', role: 'user', status: 'active' },
];

const Users: React.FC = () => {
  const [users, setUsers] = useState(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user', status: 'active' });
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Apply filters whenever filter states change
  useEffect(() => {
    let result = [...users];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
    
    // Count active filters
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (roleFilter !== 'all') count++;
    if (searchQuery) count++;
    setActiveFiltersCount(count);
  }, [users, statusFilter, roleFilter, searchQuery]);

  const handleStatusChange = (id: string, newStatus: 'active' | 'inactive') => {
    const updatedUsers = users.map(user => 
      user.id === id ? { ...user, status: newStatus } : user
    );
    setUsers(updatedUsers);
  };

  const handleRoleChange = (id: string, newRole: 'admin' | 'manager' | 'user') => {
    const updatedUsers = users.map(user => 
      user.id === id ? { ...user, role: newRole } : user
    );
    setUsers(updatedUsers);
  };

  const handleRemoveUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newId = (Math.max(...users.map(user => parseInt(user.id))) + 1).toString();
    
    setUsers([...users, { ...newUser, id: newId }]);
    setNewUser({ name: '', email: '', role: 'user', status: 'active' });
    setShowAddUserModal(false);
  };
  
  const clearFilters = () => {
    setStatusFilter('all');
    setRoleFilter('all');
    setSearchQuery('');
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
                className="action-button"
                onClick={() => setShowAddUserModal(true)}
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
            <div className="filter-group">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Status: Todos</option>
                <option value="active">Status: Ativo</option>
                <option value="inactive">Status: Inativo</option>
              </select>
            </div>
            <div className="filter-group">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Função: Todas</option>
                <option value="admin">Função: Administrador</option>
                <option value="manager">Função: Gerente</option>
                <option value="user">Função: Usuário</option>
              </select>
            </div>
            <div className="filter-spacer"></div>
            <div className="search-input">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
              </svg>
              <input 
                type="text" 
                placeholder="Buscar usuários" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-group">
              {activeFiltersCount > 0 ? (
                <button className="filter-reset-button" onClick={clearFilters}>
                  Filtros ({activeFiltersCount}) <span className="filter-reset-x">×</span>
                </button>
              ) : (
                <span>Filtros (0)</span>
              )}
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="no-users">
              <p>Nenhum usuário encontrado com os filtros aplicados.</p>
              {activeFiltersCount > 0 && (
                <button 
                  className="action-button" 
                  style={{ margin: '1rem auto', display: 'flex' }}
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Função</th>
                    <th>Status</th>
                    <th style={{textAlign: 'center'}}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <div className="role-select">
                          <select 
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                            className={`role-${user.role}`}
                          >
                            <option value="admin">Administrador</option>
                            <option value="manager">Gerente</option>
                            <option value="user">Usuário</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className="status-select">
                          <select 
                            value={user.status}
                            onChange={(e) => handleStatusChange(user.id, e.target.value as any)}
                            className={`status-${user.status}`}
                          >
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className="action-icons">
                          <button className="action-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                            </svg>
                          </button>
                          <button className="action-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
                            </svg>
                          </button>
                          <button 
                            className="action-icon" 
                            onClick={() => handleRemoveUser(user.id)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {showAddUserModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Adicionar Novo Usuário</h2>
                  <button 
                    className="modal-close"
                    onClick={() => setShowAddUserModal(false)}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleAddUser}>
                  <div className="form-group">
                    <label htmlFor="name">Nome</label>
                    <input
                      type="text"
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">Função</label>
                    <select
                      id="role"
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                      required
                    >
                      <option value="admin">Administrador</option>
                      <option value="manager">Gerente</option>
                      <option value="user">Usuário</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="cancel-button"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="submit-button"
                    >
                      Adicionar Usuário
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Users; 