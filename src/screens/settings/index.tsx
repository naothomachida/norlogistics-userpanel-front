import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../../components/layout/Header';
import VehicleModal from '../../components/VehicleModal';
import LocationModal from '../../components/LocationModal';
import { 
  addPersonVehicleType, 
  addCargoVehicleType, 
  updatePersonVehicleType, 
  updateCargoVehicleType, 
  removePersonVehicleType, 
  removeCargoVehicleType,
  VehicleType
} from '../../store/vehicleTypesSlice';
import {
  addLocation,
  updateLocation,
  removeLocation,
  Location
} from '../../store/locationSlice';
import { RootState } from '../../store';
import './settings.css';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'general' | 'vehicles' | 'locations'>('general');
  const [activeVehicleTab, setActiveVehicleTab] = useState<'person' | 'cargo'>('person');
  
  // Obter tipos de veículos e locais do Redux store
  const personVehicles = useSelector((state: RootState) => state.vehicleTypes.person);
  const cargoVehicles = useSelector((state: RootState) => state.vehicleTypes.cargo);
  const locations = useSelector((state: RootState) => state.locations.locations);
  
  // Estado para o modal de veículos
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editVehicleMode, setEditVehicleMode] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<VehicleType | undefined>(undefined);
  
  // Estado para o modal de locais
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editLocationMode, setEditLocationMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | undefined>(undefined);
  
  // Manipuladores de eventos para veículos 
  const handleAddVehicle = (vehicle: VehicleType) => {
    if (editVehicleMode) {
      // Modo de edição
      if (activeVehicleTab === 'person') {
        dispatch(updatePersonVehicleType({
          id: vehicle.id,
          updates: {
            name: vehicle.name,
            description: vehicle.description,
            capacity: Number(vehicle.capacity)
          }
        }));
      } else {
        dispatch(updateCargoVehicleType({
          id: vehicle.id,
          updates: {
            name: vehicle.name,
            description: vehicle.description,
            maxWeight: Number(vehicle.maxWeight)
          }
        }));
      }
    } else {
      // Modo de adição
      if (activeVehicleTab === 'person') {
        dispatch(addPersonVehicleType({
          id: vehicle.id,
          name: vehicle.name,
          description: vehicle.description,
          capacity: Number(vehicle.capacity) || 0
        }));
      } else {
        dispatch(addCargoVehicleType({
          id: vehicle.id,
          name: vehicle.name,
          description: vehicle.description,
          maxWeight: Number(vehicle.maxWeight) || 0
        }));
      }
    }
    
    // Fechar modal e resetar estado
    setVehicleModalOpen(false);
    setEditVehicleMode(false);
    setCurrentVehicle(undefined);
  };
  
  const handleEditVehicle = (vehicle: VehicleType) => {
    setEditVehicleMode(true);
    setCurrentVehicle(vehicle);
    setVehicleModalOpen(true);
  };
  
  const handleRemoveVehicle = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este veículo?")) {
      if (activeVehicleTab === 'person') {
        dispatch(removePersonVehicleType(id));
      } else {
        dispatch(removeCargoVehicleType(id));
      }
    }
  };
  
  const handleOpenVehicleModal = () => {
    setEditVehicleMode(false);
    setCurrentVehicle(undefined);
    setVehicleModalOpen(true);
  };
  
  const handleCloseVehicleModal = () => {
    setVehicleModalOpen(false);
    setEditVehicleMode(false);
    setCurrentVehicle(undefined);
  };

  // Manipuladores de eventos para locais
  const handleAddLocation = (location: Location) => {
    if (editLocationMode) {
      // Modo de edição
      dispatch(updateLocation({
        id: location.id,
        updates: {
          name: location.name,
          address: location.address,
          city: location.city,
          state: location.state,
          zipCode: location.zipCode,
          isCompany: location.isCompany
        }
      }));
    } else {
      // Modo de adição
      dispatch(addLocation(location));
    }
    
    // Fechar modal e resetar estado
    setLocationModalOpen(false);
    setEditLocationMode(false);
    setCurrentLocation(undefined);
  };
  
  const handleEditLocation = (location: Location) => {
    setEditLocationMode(true);
    setCurrentLocation(location);
    setLocationModalOpen(true);
  };
  
  const handleRemoveLocation = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este local?")) {
      dispatch(removeLocation(id));
    }
  };
  
  const handleOpenLocationModal = () => {
    setEditLocationMode(false);
    setCurrentLocation(undefined);
    setLocationModalOpen(true);
  };
  
  const handleCloseLocationModal = () => {
    setLocationModalOpen(false);
    setEditLocationMode(false);
    setCurrentLocation(undefined);
  };
  
  // Renderizar abas
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-card">
            <div className="settings-section">
              <h2 className="settings-section-title">
                <span className="settings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5C16 9.29 14.21 7.5 12 7.5C9.79 7.5 8 9.29 8 11.5C8 13.71 9.79 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.5 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.5 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.04 4.95 18.95L7.44 17.95C7.96 18.34 8.5 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.5 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" fill="currentColor"/>
                  </svg>
                </span>
                Preferências da conta
              </h2>
              
              <div className="settings-form-group">
                <label htmlFor="language">
                  <span className="settings-label-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z" fill="currentColor"/>
                    </svg>
                  </span>
                  Idioma
                </label>
                <select id="language" className="settings-input">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
                <p className="settings-description">Selecione o idioma de exibição para a interface do sistema.</p>
              </div>
              
              <div className="settings-form-group">
                <label htmlFor="timezone">
                  <span className="settings-label-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
                    </svg>
                  </span>
                  Fuso horário
                </label>
                <select id="timezone" className="settings-input">
                  <option value="America/Sao_Paulo">América/São Paulo (GMT-3)</option>
                  <option value="America/New_York">América/Nova York (GMT-5)</option>
                  <option value="Europe/London">Europa/Londres (GMT+0)</option>
                </select>
                <p className="settings-description">Defina seu fuso horário para visualizar datas e horários corretamente.</p>
              </div>
              
              <div className="settings-form-group">
                <label htmlFor="notifications">
                  <span className="settings-label-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
                    </svg>
                  </span>
                  Notificações
                </label>
                <div className="settings-toggle-group">
                  <div className="settings-toggle">
                    <input type="checkbox" id="email-notifications" />
                    <label htmlFor="email-notifications">Notificações por e-mail</label>
                  </div>
                  <p className="settings-description">Receba atualizações sobre suas solicitações diretamente no seu email.</p>
                  
                  <div className="settings-toggle">
                    <input type="checkbox" id="push-notifications" />
                    <label htmlFor="push-notifications">Notificações push</label>
                  </div>
                  <p className="settings-description">Receba notificações em tempo real no seu navegador.</p>
                </div>
              </div>
              
              <button className="settings-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                  <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM19 19H5V5H16.17L19 7.83V19ZM12 12C10.34 12 9 13.34 9 15C9 16.66 10.34 18 12 18C13.66 18 15 16.66 15 15C15 13.34 13.66 12 12 12ZM6 6H15V10H6V6Z" fill="currentColor"/>
                </svg>
                Salvar alterações
              </button>
            </div>
          </div>
        );
      
      case 'vehicles':
        return (
          <div className="settings-card">
            <div className="settings-section">
              <h2 className="settings-section-title">
                <span className="settings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" fill="currentColor"/>
                  </svg>
                </span>
                Configuração de Veículos
              </h2>
              
              <div className="vehicle-tabs">
                <button 
                  className={`vehicle-tab ${activeVehicleTab === 'person' ? 'active' : ''}`}
                  onClick={() => setActiveVehicleTab('person')}
                >
                  Veículos de Passageiros
                </button>
                <button 
                  className={`vehicle-tab ${activeVehicleTab === 'cargo' ? 'active' : ''}`}
                  onClick={() => setActiveVehicleTab('cargo')}
                >
                  Veículos de Carga
                </button>
              </div>
              
              <div className="action-buttons" style={{ marginBottom: '2rem' }}>
                <button 
                  className="action-button"
                  onClick={handleOpenVehicleModal}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                  </svg>
                  Adicionar Veículo
                </button>
              </div>
              
              <div className="vehicle-list">
                <h3 className="vehicle-list-title">
                  Lista de Veículos de {activeVehicleTab === 'person' ? 'Passageiros' : 'Carga'}
                </h3>
                
                <div className="vehicle-table-container">
                  <table className="vehicle-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>{activeVehicleTab === 'person' ? 'Capacidade (passageiros)' : 'Capacidade (toneladas)'}</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeVehicleTab === 'person' ? personVehicles : cargoVehicles).map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td>{vehicle.id}</td>
                          <td>{vehicle.name}</td>
                          <td>{vehicle.description}</td>
                          <td>{activeVehicleTab === 'person' ? vehicle.capacity : vehicle.maxWeight}</td>
                          <td className="vehicle-actions">
                            <button 
                              className="vehicle-action-button edit"
                              onClick={() => handleEditVehicle(vehicle)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                              </svg>
                            </button>
                            <button 
                              className="vehicle-action-button delete"
                              onClick={() => handleRemoveVehicle(vehicle.id)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case 'locations':
        return (
          <div className="settings-card">
            <div className="settings-section">
              <h2 className="settings-section-title">
                <span className="settings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                  </svg>
                </span>
                Configuração de Locais
              </h2>
              
              <div className="action-buttons" style={{ marginBottom: '2rem' }}>
                <button 
                  className="action-button"
                  onClick={handleOpenLocationModal}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                  </svg>
                  Adicionar Local
                </button>
              </div>
              
              <div className="locations-list">
                <h3 className="locations-list-title">
                  Lista de Locais Cadastrados
                </h3>
                
                <div className="location-table-container">
                  <table className="location-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Endereço</th>
                        <th>Cidade</th>
                        <th>Estado</th>
                        <th>CEP</th>
                        <th>Tipo</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map((location) => (
                        <tr key={location.id}>
                          <td>{location.name}</td>
                          <td>{location.address}</td>
                          <td>{location.city}</td>
                          <td>{location.state}</td>
                          <td>{location.zipCode || '-'}</td>
                          <td>
                            {location.isCompany ? 
                              <span className="company-tag">Empresa</span> : 
                              'Destino'
                            }
                          </td>
                          <td className="location-actions">
                            <button 
                              className="location-action-button edit"
                              onClick={() => handleEditLocation(location)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                              </svg>
                            </button>
                            <button 
                              className="location-action-button delete"
                              onClick={() => handleRemoveLocation(location.id)}
                              disabled={location.isCompany}
                              title={location.isCompany ? "Locais da empresa não podem ser removidos" : ""}
                              style={{ opacity: location.isCompany ? 0.5 : 1 }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  }
  
  return (
    <div className="settings-page">
      <Header />
      <div className="settings-content">
        <main className="settings-main">
          <div className="settings-title-row">
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '20px' }}>
              <h1 className="settings-title">Configurações</h1>
            </div>
          </div>
          
          <div className="settings-tabs">
            <button
              className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              Geral
            </button>
            <button
              className={`settings-tab ${activeTab === 'vehicles' ? 'active' : ''}`}
              onClick={() => setActiveTab('vehicles')}
            >
              Veículos
            </button>
            <button
              className={`settings-tab ${activeTab === 'locations' ? 'active' : ''}`}
              onClick={() => setActiveTab('locations')}
            >
              Locais
            </button>
          </div>
          
          {renderTabContent()}
          
          {/* Modal de adição/edição de veículo */}
          <VehicleModal
            isOpen={vehicleModalOpen}
            onClose={handleCloseVehicleModal}
            onSave={handleAddVehicle}
            vehicleType={activeVehicleTab}
            initialData={currentVehicle}
            editMode={editVehicleMode}
          />

          {/* Modal de adição/edição de local */}
          <LocationModal
            isOpen={locationModalOpen}
            onClose={handleCloseLocationModal}
            onSave={handleAddLocation}
            initialData={currentLocation}
            editMode={editLocationMode}
          />
        </main>
      </div>
    </div>
  );
};

export default Settings;