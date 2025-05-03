import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/layout/Header';
import './drivers.css';
import { RootState } from '../../store';
import { addDriver, updateDriver, removeDriver, updateDriverStatus, Driver } from '../../store/driversSlice';

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

  // Tradução dos tipos de licença
  const getLicenseDescription = (license: string): string => {
    const descriptions: Record<string, string> = {
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

  return (
    <div className="drivers-page">
      <Header />
      <div className="drivers-content">
        <main className="drivers-main">
          <div className="drivers-title-row">
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '20px' }}>
              <h1 className="drivers-title">Motoristas</h1>
              <span className="drivers-title-count">{drivers.length}</span>
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

          {drivers.length === 0 ? (
            <div className="no-drivers">
              <p>Nenhum motorista encontrado. Adicione um novo motorista para começar.</p>
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
                  {drivers.map(driver => (
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