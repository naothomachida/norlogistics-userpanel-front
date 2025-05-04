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
  const [activeLocationTab, setActiveLocationTab] = useState<'company' | 'custom'>('company');
  
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
  
  // Manipuladores para veículos
  const handleOpenVehicleModal = (mode: 'add' | 'edit', vehicle?: VehicleType) => {
    setCurrentVehicle(vehicle);
    setEditVehicleMode(mode === 'edit');
    setVehicleModalOpen(true);
  };
  
  const handleCloseVehicleModal = () => {
    setVehicleModalOpen(false);
    setCurrentVehicle(undefined);
  };
  
  const handleAddVehicle = (vehicleData: VehicleType) => {
    if (editVehicleMode) {
      if (activeVehicleTab === 'person') {
        dispatch(updatePersonVehicleType({ id: vehicleData.id, updates: vehicleData }));
      } else {
        dispatch(updateCargoVehicleType({ id: vehicleData.id, updates: vehicleData }));
      }
    } else {
      if (activeVehicleTab === 'person') {
        dispatch(addPersonVehicleType(vehicleData));
      } else {
        dispatch(addCargoVehicleType(vehicleData));
      }
    }
    
    handleCloseVehicleModal();
  };
  
  const handleDeleteVehicle = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este veículo?")) {
      if (activeVehicleTab === 'person') {
        dispatch(removePersonVehicleType(id));
      } else {
        dispatch(removeCargoVehicleType(id));
      }
    }
  };
  
  // Manipuladores para locais
  const handleOpenLocationModal = (mode: 'add' | 'edit', location?: Location) => {
    setCurrentLocation(location);
    setEditLocationMode(mode === 'edit');
    setLocationModalOpen(true);
  };
  
  const handleCloseLocationModal = () => {
    setLocationModalOpen(false);
    setCurrentLocation(undefined);
  };
  
  const handleAddLocation = (locationData: Location) => {
    if (editLocationMode) {
      dispatch(updateLocation({ id: locationData.id, updates: locationData }));
    } else {
      dispatch(addLocation(locationData));
    }
    
    handleCloseLocationModal();
  };
  
  const handleDeleteLocation = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este local?")) {
      dispatch(removeLocation(id));
    }
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
                Preferências
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
                <p className="settings-description">Idioma para interface</p>
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
                <p className="settings-description">Fuso horário para datas e horários</p>
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
                    <label htmlFor="email-notifications">Email</label>
                  </div>
                  <p className="settings-description">Receba atualizações por email</p>
                  
                  <div className="settings-toggle">
                    <input type="checkbox" id="push-notifications" />
                    <label htmlFor="push-notifications">Push</label>
                  </div>
                  <p className="settings-description">Receba notificações no navegador</p>
                </div>
              </div>
              
              <button className="settings-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                  <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM19 19H5V5H16.17L19 7.83V19ZM12 12C10.34 12 9 13.34 9 15C9 16.66 10.34 18 12 18C13.66 18 15 16.66 15 15C15 13.34 13.66 12 12 12ZM6 6H15V10H6V6Z" fill="currentColor"/>
                </svg>
                Salvar
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
                Veículos
              </h2>
              
              <div className="tab-buttons">
                <button 
                  className={`tab-button ${activeVehicleTab === 'person' ? 'active' : ''}`}
                  onClick={() => setActiveVehicleTab('person')}
                >
                  Passageiros
                </button>
                <button 
                  className={`tab-button ${activeVehicleTab === 'cargo' ? 'active' : ''}`}
                  onClick={() => setActiveVehicleTab('cargo')}
                >
                  Carga
                </button>
                
                <div className="tab-actions">
                  <button 
                    className="add-button"
                    onClick={() => handleOpenVehicleModal('add')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                    </svg>
                    Adicionar
                  </button>
                </div>
              </div>
              
              <div className="vehicle-list">
                {activeVehicleTab === 'person' ? (
                  personVehicles.length > 0 ? (
                    personVehicles.map(vehicle => (
                      <div key={vehicle.id} className="vehicle-item">
                        <div className="vehicle-details">
                          <div className="vehicle-name">{vehicle.name}</div>
                          <div className="vehicle-description">
                            {vehicle.capacity} passageiros
                          </div>
                        </div>
                        <div className="vehicle-actions">
                          <button 
                            className="action-button edit-button"
                            onClick={() => handleOpenVehicleModal('edit', vehicle)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                            </svg>
                          </button>
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhum veículo para passageiros cadastrado.</p>
                  )
                ) : (
                  cargoVehicles.length > 0 ? (
                    cargoVehicles.map(vehicle => (
                      <div key={vehicle.id} className="vehicle-item">
                        <div className="vehicle-details">
                          <div className="vehicle-name">{vehicle.name}</div>
                          <div className="vehicle-description">
                            Capacidade: {vehicle.maxWeight} toneladas
                          </div>
                        </div>
                        <div className="vehicle-actions">
                          <button 
                            className="action-button edit-button"
                            onClick={() => handleOpenVehicleModal('edit', vehicle)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                            </svg>
                          </button>
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhum veículo para carga cadastrado.</p>
                  )
                )}
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
                Locais
              </h2>
              
              <div className="tab-buttons">
                <button 
                  className={`tab-button ${activeLocationTab === 'company' ? 'active' : ''}`}
                  onClick={() => setActiveLocationTab('company')}
                >
                  Empresas
                </button>
                <button 
                  className={`tab-button ${activeLocationTab === 'custom' ? 'active' : ''}`}
                  onClick={() => setActiveLocationTab('custom')}
                >
                  Customizados
                </button>
                
                <div className="tab-actions">
                  <button 
                    className="add-button"
                    onClick={() => handleOpenLocationModal('add')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                    </svg>
                    Adicionar
                  </button>
                </div>
              </div>
              
              <div className="location-list">
                {activeLocationTab === 'company' ? (
                  locations.filter(location => location.isCompany).length > 0 ? (
                    locations.filter(location => location.isCompany).map(location => (
                      <div key={location.id} className="location-item">
                        <div className="location-details">
                          <div className="location-name">
                            {location.name}
                            <span className="location-badge company-badge">Empresa</span>
                          </div>
                          <div className="location-description">
                            {location.address}, {location.city}-{location.state}
                          </div>
                        </div>
                        <div className="location-actions">
                          <button 
                            className="action-button edit-button"
                            onClick={() => handleOpenLocationModal('edit', location)}
                            aria-label="Editar"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                            </svg>
                          </button>
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteLocation(location.id)}
                            aria-label="Excluir"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhum local de empresa cadastrado</p>
                  )
                ) : (
                  locations.filter(location => !location.isCompany).length > 0 ? (
                    locations.filter(location => !location.isCompany).map(location => (
                      <div key={location.id} className="location-item">
                        <div className="location-details">
                          <div className="location-name">
                            {location.name}
                            <span className="location-badge custom-badge">Customizado</span>
                          </div>
                          <div className="location-description">
                            {location.address}, {location.city}-{location.state}
                          </div>
                        </div>
                        <div className="location-actions">
                          <button 
                            className="action-button edit-button"
                            onClick={() => handleOpenLocationModal('edit', location)}
                            aria-label="Editar"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                            </svg>
                          </button>
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteLocation(location.id)}
                            aria-label="Excluir"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhum local customizado cadastrado</p>
                  )
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Renderiza as opções de menu lateral
  const renderSidebarTabs = () => {
    return (
      <div className="settings-sidebar">
        <div className="settings-tabs">
          <div 
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
            </svg>
            <span>Geral</span>
          </div>
          <div 
            className={`settings-tab ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" fill="currentColor"/>
            </svg>
            <span>Veículos</span>
          </div>
          <div 
            className={`settings-tab ${activeTab === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveTab('locations')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
            </svg>
            <span>Locais</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="settings-page">
      <Header />
      <div className="settings-content">
        <div className="settings-title-container">
          <h1 className="settings-title">Configurações</h1>
        </div>
        <div className="settings-main">
          {renderSidebarTabs()}
          <div className="settings-card-container">
            {renderTabContent()}
          </div>
        </div>
      </div>
      
      {vehicleModalOpen && (
        <VehicleModal 
          isOpen={vehicleModalOpen}
          onClose={handleCloseVehicleModal}
          onSave={handleAddVehicle}
          vehicleType={activeVehicleTab}
          initialData={currentVehicle}
          editMode={editVehicleMode}
        />
      )}
      
      {locationModalOpen && (
        <LocationModal 
          isOpen={locationModalOpen}
          onClose={handleCloseLocationModal}
          onSave={handleAddLocation}
          initialData={currentLocation}
          editMode={editLocationMode}
        />
      )}
    </div>
  );
};

export default Settings;