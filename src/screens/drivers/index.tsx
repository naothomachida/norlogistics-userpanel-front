import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/layout/Header';
import './drivers.css';
import { RootState } from '../../store';
import { addDriver, updateDriver, removeDriver, updateDriverStatus, Driver } from '../../store/driversSlice';

// Tipo para representar os filtros
type DriverFilters = {
  status: string; // 'all', 'active' ou 'inactive'
  license: string; // 'all' ou uma categoria de CNH específica
  searchQuery: string;
};

const Drivers: React.FC = () => {
  const dispatch = useDispatch();
  const drivers = useSelector((state: RootState) => state.drivers.drivers);
  
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Driver>({
    id: '',
    name: '', 
    email: '', 
    phone: '', 
    license: 'B', 
    status: 'active' 
  });

  // Estado para os filtros
  const [filters, setFilters] = useState<DriverFilters>({
    status: 'all',
    license: 'all',
    searchQuery: ''
  });

  // Controle para o dropdown de filtros
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showLicenseDropdown, setShowLicenseDropdown] = useState(false);

  // Função para atualizar os filtros
  const updateFilter = (filterType: keyof DriverFilters, value: string) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
    
    // Fechar o dropdown correspondente
    if (filterType === 'status') setShowStatusDropdown(false);
    if (filterType === 'license') setShowLicenseDropdown(false);
  };

  // Função para contar quantos filtros estão ativos
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.license !== 'all') count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      license: 'all',
      searchQuery: ''
    });
  };

  // Tradução dos tipos de licença
  const getLicenseDescription = (license: string): string => {
    const descriptions: Record<string, string> = {
      'all': 'Todas',
      'A': 'Motos',
      'B': 'Carros',
      'C': 'Caminhões leves',
      'D': 'Ônibus',
      'E': 'Veículos pesados',
      'AB': 'Motos e carros',
      'AC': 'Motos e caminhões leves',
      'AD': 'Motos e ônibus',
      'AE': 'Motos e veículos pesados',
    };
    return descriptions[license] || license;
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

  // Filtragem dos motoristas
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      // Filtro por status
      if (filters.status !== 'all' && driver.status !== filters.status) {
        return false;
      }
      
      // Filtro por tipo de licença
      if (filters.license !== 'all' && driver.license !== filters.license) {
        return false;
      }
      
      // Filtro por termo de busca
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const nameMatches = driver.name.toLowerCase().includes(searchLower);
        const emailMatches = driver.email.toLowerCase().includes(searchLower);
        const phoneMatches = driver.phone.toLowerCase().includes(searchLower);
        
        if (!nameMatches && !emailMatches && !phoneMatches) {
          return false;
        }
      }
      
      return true;
    });
  }, [drivers, filters]);

  const handleStatusChange = (id: string, newStatus: 'active' | 'inactive') => {
    dispatch(updateDriverStatus({ id, status: newStatus }));
  };

  const handleRemoveDriver = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este motorista?')) {
      dispatch(removeDriver(id));
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentDriver({
      id: '',
      name: '', 
      email: '', 
      phone: '', 
      license: 'B', 
      status: 'active'
    });
    setShowDriverModal(true);
  };

  const openEditModal = (driver: Driver) => {
    setIsEditing(true);
    setCurrentDriver({ ...driver });
    setShowDriverModal(true);
  };

  const handleDriverFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      dispatch(updateDriver(currentDriver));
    } else {
      // Usando o Omit para remover o campo id para adicionar um novo motorista
      const { id, ...driverWithoutId } = currentDriver;
      dispatch(addDriver(driverWithoutId));
    }
    
    setShowDriverModal(false);
  };

  const handleDriverChange = (field: keyof Driver, value: string) => {
    setCurrentDriver({
      ...currentDriver,
      [field]: value
    });
  };

  return (
    <div className="drivers-page">
      <Header />
      <div className="drivers-content">
        <main className="drivers-main">
          <div className="drivers-title-row">
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '20px' }}>
              <h1 className="drivers-title">Motoristas</h1>
              <span className="drivers-title-count">{filteredDrivers.length}</span>
            </div>
            <div className="action-buttons">
              <button 
                className="action-button"
                onClick={openAddModal}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Adicionar Motorista
              </button>
              <button className="action-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
                </svg>
                Exportar
              </button>
            </div>
          </div>

          <div className="drivers-filters">
            <div className="filter-group filter-dropdown">
              <div 
                className="filter-selected" 
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowLicenseDropdown(false);
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
                  setShowLicenseDropdown(!showLicenseDropdown);
                  setShowStatusDropdown(false);
                }}
              >
                <span>CNH: {filters.license === 'all' ? 'Todas' : `${filters.license} - ${getLicenseDescription(filters.license)}`}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z" fill="currentColor" />
                </svg>
              </div>
              {showLicenseDropdown && (
                <div className="filter-options">
                  <div 
                    className={`filter-option ${filters.license === 'all' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('license', 'all')}
                  >
                    Todas
                  </div>
                  <div 
                    className={`filter-option ${filters.license === 'A' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('license', 'A')}
                  >
                    A - Motos
                  </div>
                  <div 
                    className={`filter-option ${filters.license === 'B' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('license', 'B')}
                  >
                    B - Carros
                  </div>
                  <div 
                    className={`filter-option ${filters.license === 'C' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('license', 'C')}
                  >
                    C - Caminhões leves
                  </div>
                  <div 
                    className={`filter-option ${filters.license === 'D' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('license', 'D')}
                  >
                    D - Ônibus
                  </div>
                  <div 
                    className={`filter-option ${filters.license === 'E' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('license', 'E')}
                  >
                    E - Veículos pesados
                  </div>
                  <div 
                    className={`filter-option ${filters.license === 'AB' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('license', 'AB')}
                  >
                    AB - Motos e carros
                  </div>
                </div>
              )}
            </div>
            
            <div className="filter-spacer"></div>
            
            <div className="search-input">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
              </svg>
              <input 
                type="text" 
                placeholder="Buscar motoristas" 
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
              />
            </div>
            
            {activeFilterCount > 0 && (
              <div className="filter-group filter-clear" onClick={clearAllFilters}>
                <span>Filtros ({activeFilterCount})</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>

          {filteredDrivers.length === 0 ? (
            <div className="no-drivers">
              <p>Nenhum motorista encontrado com os filtros atuais.</p>
              {activeFilterCount > 0 && (
                <button 
                  className="action-button" 
                  style={{ margin: '1rem auto', display: 'flex' }}
                  onClick={clearAllFilters}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
                  </svg>
                  Limpar filtros
                </button>
              )}
              <button 
                className="action-button" 
                style={{ margin: '1rem auto', display: 'flex' }}
                onClick={openAddModal}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Adicionar Motorista
              </button>
            </div>
          ) : (
            <div className="drivers-table-container">
              <table className="drivers-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Categoria CNH</th>
                    <th>Status</th>
                    <th style={{textAlign: 'center'}}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map(driver => (
                    <tr key={driver.id}>
                      <td>{driver.name}</td>
                      <td>{driver.email}</td>
                      <td>{driver.phone}</td>
                      <td>
                        <div className={`license-badge license-${driver.license.toLowerCase()}`}>
                          {driver.license} - {getLicenseDescription(driver.license)}
                        </div>
                      </td>
                      <td>
                        <select
                          value={driver.status}
                          onChange={(e) => handleStatusChange(driver.id, e.target.value as 'active' | 'inactive')}
                          className={`status-select status-${driver.status}`}
                        >
                          <option value="active">Ativo</option>
                          <option value="inactive">Inativo</option>
                        </select>
                      </td>
                      <td>
                        <div className="action-icons">
                          <button 
                            className="action-icon"
                            onClick={() => openEditModal(driver)}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
                            </svg>
                          </button>
                          <button 
                            className="action-icon"
                            onClick={() => handleRemoveDriver(driver.id)}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          
          {showDriverModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>{isEditing ? 'Editar Motorista' : 'Adicionar Novo Motorista'}</h2>
                  <button 
                    className="modal-close"
                    onClick={() => setShowDriverModal(false)}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleDriverFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Nome</label>
                    <input
                      type="text"
                      id="name"
                      value={currentDriver.name}
                      onChange={(e) => handleDriverChange('name', e.target.value)}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={currentDriver.email}
                      onChange={(e) => handleDriverChange('email', e.target.value)}
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Telefone</label>
                    <input
                      type="tel"
                      id="phone"
                      value={currentDriver.phone}
                      onChange={(e) => handleDriverChange('phone', e.target.value)}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="license">Categoria CNH</label>
                    <select
                      id="license"
                      value={currentDriver.license}
                      onChange={(e) => handleDriverChange('license', e.target.value)}
                      required
                    >
                      <option value="A">A - Motos</option>
                      <option value="B">B - Carros</option>
                      <option value="C">C - Caminhões leves</option>
                      <option value="D">D - Ônibus</option>
                      <option value="E">E - Veículos pesados</option>
                      <option value="AB">AB - Motos e carros</option>
                      <option value="AC">AC - Motos e caminhões leves</option>
                      <option value="AD">AD - Motos e ônibus</option>
                      <option value="AE">AE - Motos e veículos pesados</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      value={currentDriver.status}
                      onChange={(e) => handleDriverChange('status', e.target.value as 'active' | 'inactive')}
                      required
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button"
                      onClick={() => setShowDriverModal(false)}
                      className="cancel-button"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="submit-button"
                    >
                      {isEditing ? 'Salvar Alterações' : 'Adicionar Motorista'}
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

export default Drivers; 