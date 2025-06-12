import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import VehicleModal from '../../components/VehicleModal';
import LocationModal from '../../components/LocationModal';
import CityPairModal from '../../components/CityPairModal';
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
  type Location
} from '../../store/locationSlice';
import {
  setKmRate,
  addCityPair,
  updateCityPair,
  removeCityPair,
  CityPair
} from '../../store/pricingSlice';
import { updateUserProfile } from '../../store/authSlice';
import { RootState } from '../../store';
import './settings.css';

type TabType = 'system' | 'security' | 'profile' | 'vehicles' | 'locations' | 'pricing' | 'price-table' | 'integrations';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isMinimumLoadingTimePassed, setIsMinimumLoadingTimePassed] = useState(false);
  
  // Determine active tab based on URL or default
  const getInitialTab = (): TabType => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab') as TabType;
    return tab || 'system';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  const [activeVehicleTab, setActiveVehicleTab] = useState<'person' | 'cargo'>('person');
  
  // Security-related states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Profile-related states
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    location: '',
    bio: '',
    avatar: ''
  });

  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // System preferences
  const [systemPreferences, setSystemPreferences] = useState({
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    currency: 'BRL',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false,
      orders: true,
      system: true
    }
  });
  
  // Obter tipos de veículos e locais do Redux store
  const personVehicles = useSelector((state: RootState) => state.vehicleTypes.person);
  const cargoVehicles = useSelector((state: RootState) => state.vehicleTypes.cargo);
  const locations = useSelector((state: RootState) => state.locations.locations);
  const pricing = useSelector((state: RootState) => state.pricing);
  
  // Estado para os modais
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editVehicleMode, setEditVehicleMode] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<VehicleType | undefined>(undefined);
  
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editLocationMode, setEditLocationMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | undefined>(undefined);
  
  const [cityPairModalOpen, setCityPairModalOpen] = useState(false);
  const [editCityPairMode, setEditCityPairMode] = useState(false);
  const [currentCityPair, setCurrentCityPair] = useState<CityPair | undefined>(undefined);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Effect to ensure minimum loading time of 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinimumLoadingTimePassed(true);
    }, 1000); // 1 second minimum loading time

    return () => clearTimeout(timer);
  }, []);

  // Handle tab changes and URL updates
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    navigate(`/settings?tab=${tab}`, { replace: true });
  };

  // Security functions
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    setPasswordSuccess(true);
    
    setTimeout(() => {
      setPasswordSuccess(false);
    }, 3000);
  };

  // System preferences handlers
  const handleSystemPreferenceChange = (key: string, value: any) => {
    setSystemPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setSystemPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };
  
  // Profile functions
  useEffect(() => {
    if (userProfile) {
      const nameParts = userProfile.name?.split(' ') || [];
      setProfileData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        department: userProfile.department || '',
        role: getRoleDisplayName(userProfile.role),
        location: userProfile.location || '',
        bio: userProfile.bio || '',
        avatar: userProfile.avatarUrl || ''
      });
    }
  }, [userProfile]);

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'user': 'Usuário',
      'driver': 'Motorista'
    };
    return roleMap[role] || role;
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setProfileData(prev => ({
          ...prev,
          avatar: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleProfileSave = () => {
    if (!userProfile) return;

    const updateData = {
      name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      phone: profileData.phone,
      department: profileData.department,
      location: profileData.location,
      bio: profileData.bio,
      ...(imagePreview && { avatarUrl: imagePreview })
    };

    dispatch(updateUserProfile(updateData));
    
    setImagePreview(null);
    setShowProfileSuccess(true);
    
    setTimeout(() => {
      setShowProfileSuccess(false);
    }, 3000);
  };

  const handleProfileCancel = () => {
    if (userProfile) {
      const nameParts = userProfile.name?.split(' ') || [];
      setProfileData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        department: userProfile.department || '',
        role: getRoleDisplayName(userProfile.role),
        location: userProfile.location || '',
        bio: userProfile.bio || '',
        avatar: userProfile.avatarUrl || ''
      });
    }
    setImagePreview(null);
  };
  
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
  
  // Manipuladores para pares de cidades
  const handleOpenCityPairModal = (mode: 'add' | 'edit', cityPair?: CityPair) => {
    setCurrentCityPair(cityPair);
    setEditCityPairMode(mode === 'edit');
    setCityPairModalOpen(true);
  };
  
  const handleCloseCityPairModal = () => {
    setCityPairModalOpen(false);
    setCurrentCityPair(undefined);
  };
  
  const handleSaveCityPair = (cityPairData: Omit<CityPair, 'id'>) => {
    if (editCityPairMode && currentCityPair) {
      dispatch(updateCityPair({ id: currentCityPair.id, updates: cityPairData }));
    } else {
      dispatch(addCityPair(cityPairData));
    }
    
    handleCloseCityPairModal();
  };
  
  const handleDeleteCityPair = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta rota?")) {
      dispatch(removeCityPair(id));
    }
  };
  
  const handleKmRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    if (!isNaN(newRate) && newRate >= 0) {
      dispatch(setKmRate(newRate));
    }
  };
  
  // Renderizar abas
  const renderTabContent = () => {
    switch (activeTab) {
      case 'system':
        return (
          <div className="settings-card">
            <div className="settings-section">
              <h2 className="settings-section-title">
                <span className="settings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5C16 9.29 14.21 7.5 12 7.5C9.79 7.5 8 9.29 8 11.5C8 13.71 9.79 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.5 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.5 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.04 4.95 18.95L7.44 17.95C7.96 18.34 8.5 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.5 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" fill="currentColor"/>
                  </svg>
                </span>
                Configurações do Sistema
              </h2>
              
              <div className="system-preferences-grid">
                <div className="system-card">
                  <div className="system-card-header">
                  <span className="settings-label-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z" fill="currentColor"/>
                    </svg>
                  </span>
                    <h3 className="system-card-title">Idioma e Região</h3>
                  </div>
                  <div className="system-card-content">
                    <div className="settings-form-group">
                      <label htmlFor="language" className="settings-label">Idioma</label>
                      <select 
                        id="language" 
                        className="settings-input"
                        value={systemPreferences.language}
                        onChange={(e) => handleSystemPreferenceChange('language', e.target.value)}
                      >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
              
                    <div className="settings-form-group">
                      <label htmlFor="timezone" className="settings-label">Fuso horário</label>
                      <select 
                        id="timezone" 
                        className="settings-input"
                        value={systemPreferences.timezone}
                        onChange={(e) => handleSystemPreferenceChange('timezone', e.target.value)}
                      >
                  <option value="America/Sao_Paulo">América/São Paulo (GMT-3)</option>
                  <option value="America/New_York">América/Nova York (GMT-5)</option>
                  <option value="Europe/London">Europa/Londres (GMT+0)</option>
                </select>
                  </div>

                    <div className="settings-form-group">
                      <label htmlFor="dateFormat" className="settings-label">Formato de data</label>
                      <select 
                        id="dateFormat" 
                        className="settings-input"
                        value={systemPreferences.dateFormat}
                        onChange={(e) => handleSystemPreferenceChange('dateFormat', e.target.value)}
                      >
                        <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                        <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                        <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                      </select>
              </div>
              
                    <div className="settings-form-group">
                      <label htmlFor="currency" className="settings-label">Moeda</label>
                      <select 
                        id="currency" 
                        className="settings-input"
                        value={systemPreferences.currency}
                        onChange={(e) => handleSystemPreferenceChange('currency', e.target.value)}
                      >
                        <option value="BRL">Real (R$)</option>
                        <option value="USD">Dólar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="system-card">
                  <div className="system-card-header">
                  <span className="settings-label-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
                    </svg>
                  </span>
                    <h3 className="system-card-title">Notificações</h3>
                  </div>
                  <div className="system-card-content">
                <div className="settings-toggle-group">
                  <div className="settings-toggle">
                        <input 
                          type="checkbox" 
                          id="email-notifications"
                          checked={systemPreferences.notifications.email}
                          onChange={(e) => handleNotificationChange('email', e.target.checked)}
                        />
                        <label htmlFor="email-notifications">Notificações por email</label>
                  </div>
                      <p className="settings-description">Receba atualizações importantes por email</p>
                    </div>
                  
                    <div className="settings-toggle-group">
                  <div className="settings-toggle">
                        <input 
                          type="checkbox" 
                          id="push-notifications"
                          checked={systemPreferences.notifications.push}
                          onChange={(e) => handleNotificationChange('push', e.target.checked)}
                        />
                        <label htmlFor="push-notifications">Notificações push</label>
                  </div>
                      <p className="settings-description">Notificações em tempo real no navegador</p>
                    </div>

                    <div className="settings-toggle-group">
                      <div className="settings-toggle">
                        <input 
                          type="checkbox" 
                          id="sms-notifications"
                          checked={systemPreferences.notifications.sms}
                          onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                        />
                        <label htmlFor="sms-notifications">Notificações por SMS</label>
                  </div>
                      <p className="settings-description">Alertas críticos por mensagem de texto</p>
                </div>

                    <div className="settings-toggle-group">
                      <div className="settings-toggle">
                        <input 
                          type="checkbox" 
                          id="order-notifications"
                          checked={systemPreferences.notifications.orders}
                          onChange={(e) => handleNotificationChange('orders', e.target.checked)}
                        />
                        <label htmlFor="order-notifications">Atualizações de pedidos</label>
                      </div>
                      <p className="settings-description">Notificações sobre status de pedidos</p>
                    </div>
                  </div>
                </div>

                <div className="system-card">
                  <div className="system-card-header">
                    <span className="settings-label-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
                      </svg>
                    </span>
                    <h3 className="system-card-title">Tema</h3>
                  </div>
                  <div className="system-card-content">
                    <div className="theme-selector">
                      <div className="theme-option">
                        <input 
                          type="radio" 
                          id="theme-light" 
                          name="theme" 
                          value="light"
                          checked={systemPreferences.theme === 'light'}
                          onChange={(e) => handleSystemPreferenceChange('theme', e.target.value)}
                        />
                        <label htmlFor="theme-light" className="theme-label">
                          <div className="theme-preview light"></div>
                          <span>Claro</span>
                        </label>
                      </div>
                      <div className="theme-option">
                        <input 
                          type="radio" 
                          id="theme-dark" 
                          name="theme" 
                          value="dark"
                          checked={systemPreferences.theme === 'dark'}
                          onChange={(e) => handleSystemPreferenceChange('theme', e.target.value)}
                        />
                        <label htmlFor="theme-dark" className="theme-label">
                          <div className="theme-preview dark"></div>
                          <span>Escuro</span>
                        </label>
                      </div>
                      <div className="theme-option">
                        <input 
                          type="radio" 
                          id="theme-auto" 
                          name="theme" 
                          value="auto"
                          checked={systemPreferences.theme === 'auto'}
                          onChange={(e) => handleSystemPreferenceChange('theme', e.target.value)}
                        />
                        <label htmlFor="theme-auto" className="theme-label">
                          <div className="theme-preview auto"></div>
                          <span>Automático</span>
                        </label>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="settings-card">
            <div className="settings-section">
              <h2 className="settings-section-title">
                <span className="settings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="currentColor"/>
                  </svg>
                </span>
                Segurança
              </h2>

              {passwordSuccess && (
                <div className="settings-success-message">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Senha alterada com sucesso!
                </div>
              )}
              
              <div className="security-grid">
                <div className="security-card">
                  <div className="security-card-header">
                    <span className="settings-label-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/>
                      </svg>
                    </span>
                    <h3 className="security-card-title">Alterar Senha</h3>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="password-form">
                    <div className="settings-form-group">
                      <label htmlFor="current-password" className="settings-label">Senha atual</label>
                      <input
                        type="password"
                        id="current-password"
                        name="currentPassword"
                        className="settings-input"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <div className="settings-form-group">
                      <label htmlFor="new-password" className="settings-label">Nova senha</label>
                      <input
                        type="password"
                        id="new-password"
                        name="newPassword"
                        className="settings-input"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <div className="settings-form-group">
                      <label htmlFor="confirm-password" className="settings-label">Confirmar nova senha</label>
                      <input
                        type="password"
                        id="confirm-password"
                        name="confirmPassword"
                        className="settings-input"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                  </div>

                    <button type="submit" className="settings-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/>
                      </svg>
                      Alterar Senha
                    </button>
                  </form>
                </div>

                <div className="security-card">
                  <div className="security-card-header">
                    <span className="settings-label-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="currentColor"/>
                      </svg>
                    </span>
                    <h3 className="security-card-title">Autenticação de Dois Fatores</h3>
                  </div>

                  <div className="two-factor-content">
                    <p className="settings-description">
                      Adicione uma camada extra de segurança à sua conta com autenticação de dois fatores.
                    </p>
                    
                    <div className="settings-toggle-group">
                      <div className="settings-toggle">
                        <input type="checkbox" id="2fa" />
                        <label htmlFor="2fa">Ativar autenticação de dois fatores</label>
                      </div>
                    </div>
                    
                    <div className="two-factor-info">
                      <h4>Como funciona:</h4>
                      <ul>
                        <li>Configure um aplicativo autenticador (Google Authenticator, Authy, etc.)</li>
                        <li>Escaneie o código QR com seu aplicativo</li>
                        <li>Digite o código gerado para confirmar</li>
                      </ul>
              </div>
              
                    <button className="settings-button secondary-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                </svg>
                      Configurar 2FA
              </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="settings-card">
            <div className="settings-section">
              <h2 className="settings-section-title">
                <span className="settings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                  </svg>
                </span>
                Perfil do Usuário
              </h2>
              
              {showProfileSuccess && (
                <div className="settings-success-message">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Perfil atualizado com sucesso!
              </div>
              )}

              <div className="profile-modern-grid">
                <div className="profile-main-card">
                  <div className="profile-header-section">
                    <div className="profile-photo-container">
                      <div className="profile-photo">
                        <img 
                          src={imagePreview || profileData.avatar || `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=6B46C1&color=fff`} 
                          alt="Foto do perfil" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=6B46C1&color=fff`;
                          }}
                        />
                          </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <button className="photo-upload-btn" onClick={triggerFileInput}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" fill="currentColor"/>
                            </svg>
                        Alterar foto
                          </button>
                    </div>

                    <div className="profile-basic-info">
                      <h2 className="profile-name">{profileData.firstName} {profileData.lastName}</h2>
                      <p className="profile-role">{profileData.role}</p>
                      {profileData.department && (
                        <p className="profile-department">{profileData.department}</p>
                      )}
                      {profileData.location && (
                        <p className="profile-location">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="currentColor"/>
                            </svg>
                          {profileData.location}
                        </p>
                      )}
                        </div>
                      </div>

                  <div className="profile-edit-form">
                    <div className="form-section">
                      <h3>Informações Pessoais</h3>
                      <div className="settings-form-row">
                        <div className="settings-form-group">
                          <label htmlFor="firstName">Nome</label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            className="settings-input"
                            value={profileData.firstName}
                            onChange={handleProfileInputChange}
                          />
                    </div>
                        <div className="settings-form-group">
                          <label htmlFor="lastName">Sobrenome</label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className="settings-input"
                            value={profileData.lastName}
                            onChange={handleProfileInputChange}
                          />
                          </div>
                        </div>
                      <div className="settings-form-row">
                        <div className="settings-form-group">
                          <label htmlFor="email">Email</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="settings-input"
                            value={profileData.email}
                            onChange={handleProfileInputChange}
                            disabled
                            title="Email não pode ser alterado"
                          />
                        </div>
                        <div className="settings-form-group">
                          <label htmlFor="phone">Telefone</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="settings-input"
                            value={profileData.phone}
                            onChange={handleProfileInputChange}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Informações Profissionais</h3>
                      <div className="settings-form-row">
                        <div className="settings-form-group">
                          <label htmlFor="role">Cargo</label>
                          <input
                            type="text"
                            id="role"
                            name="role"
                            className="settings-input"
                            value={profileData.role}
                            onChange={handleProfileInputChange}
                            disabled
                            title="Cargo não pode ser alterado pelo usuário"
                          />
                        </div>
                        <div className="settings-form-group">
                          <label htmlFor="department">Departamento</label>
                          <input
                            type="text"
                            id="department"
                            name="department"
                            className="settings-input"
                            value={profileData.department}
                            onChange={handleProfileInputChange}
                            placeholder="Ex: Logística, Vendas, etc."
                          />
                        </div>
                      </div>
                      <div className="settings-form-group">
                        <label htmlFor="location">Localização</label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          className="settings-input"
                          value={profileData.location}
                          onChange={handleProfileInputChange}
                          placeholder="Ex: São Paulo, SP"
                        />
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Sobre</h3>
                      <div className="settings-form-group">
                        <label htmlFor="bio">Biografia</label>
                        <textarea
                          id="bio"
                          name="bio"
                          rows={4}
                          className="settings-input"
                          value={profileData.bio}
                          onChange={handleProfileInputChange}
                          placeholder="Conte um pouco sobre você, sua experiência e interesses profissionais..."
                        />
                      </div>
                      
                      <div className="profile-form-actions">
                          <button 
                          type="button"
                          className="profile-cancel-btn"
                          onClick={handleProfileCancel}
                          >
                          Cancelar
                          </button>
                          <button 
                          className="profile-save-btn"
                          onClick={handleProfileSave}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" fill="currentColor"/>
                            </svg>
                          Salvar Perfil
                          </button>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
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
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01Z" fill="currentColor"/>
                  </svg>
                </span>
                Tipos de Veículos
              </h2>
              
              <div className="business-section-header">
                <button 
                  className="add-button"
                  onClick={() => handleOpenVehicleModal('add')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                  </svg>
                  Adicionar Veículo
                </button>
              </div>

              <div className="vehicle-tabs">
                <button 
                  className={`vehicle-tab ${activeVehicleTab === 'person' ? 'active' : ''}`}
                  onClick={() => setActiveVehicleTab('person')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                  </svg>
                  Transporte de Pessoas
                </button>
                <button 
                  className={`vehicle-tab ${activeVehicleTab === 'cargo' ? 'active' : ''}`}
                  onClick={() => setActiveVehicleTab('cargo')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7h-2V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v1H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 6h6v1H9V6zm6 11H8v-2h8v2zm0-4H8v-2h8v2z" fill="currentColor"/>
                  </svg>
                  Transporte de Cargas
                </button>
              </div>
              
              <div className="vehicles-grid">
                {(activeVehicleTab === 'person' ? personVehicles : cargoVehicles).length > 0 ? (
                  (activeVehicleTab === 'person' ? personVehicles : cargoVehicles).map(vehicle => (
                    <div key={vehicle.id} className="vehicle-card">
                      <div className="vehicle-info">
                        <h4 className="vehicle-name">{vehicle.name}</h4>
                        <p className="vehicle-description">{vehicle.description}</p>
                        <div className="vehicle-capacity">
                          <span className="capacity-label">Capacidade:</span>
                          <span className="capacity-value">{vehicle.capacity}</span>
                          </div>
                          </div>
                        <div className="vehicle-actions">
                          <button 
                            className="action-button edit-button"
                            onClick={() => handleOpenVehicleModal('edit', vehicle)}
                            aria-label="Editar"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                            </svg>
                          </button>
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
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
                    <div className="empty-message">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01Z" fill="#aaa"/>
                            </svg>
                    <p>Nenhum veículo cadastrado para {activeVehicleTab === 'person' ? 'transporte de pessoas' : 'transporte de cargas'}</p>
                          <button 
                      className="add-button small"
                      onClick={() => handleOpenVehicleModal('add')}
                          >
                      Adicionar primeiro veículo
                          </button>
                    </div>
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
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                  </svg>
                </span>
                Locais Predefinidos
              </h2>
              
              <div className="business-section-header">
                <button 
                  className="add-button"
                  onClick={() => handleOpenLocationModal('add')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                  </svg>
                  Adicionar Local
                </button>
              </div>
              
              <div className="locations-grid">
                {locations.length > 0 ? (
                  locations.map(location => (
                    <div key={location.id} className="location-card">
                      <div className="location-info">
                        <h4 className="location-name">{location.name}</h4>
                        <p className="location-address">{location.address}</p>
                        <div className="location-type">
                          <span className={`location-badge ${location.isCompany ? 'company' : 'special'}`}>
                            {location.isCompany ? 'Empresa' : 'Local Especial'}
                          </span>
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
                    <div className="empty-message">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#aaa"/>
                            </svg>
                    <p>Nenhum local cadastrado</p>
                          <button 
                      className="add-button small"
                      onClick={() => handleOpenLocationModal('add')}
                          >
                      Adicionar primeiro local
                          </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'pricing':
        return (
          <div className="settings-card">
            <div className="settings-section">
              <h2 className="settings-section-title">
                <span className="settings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z" fill="currentColor"/>
                  </svg>
                </span>
                Configurações de Preços
              </h2>
              
              <div className="pricing-config">
                <div className="pricing-rate-card">
                  <div className="pricing-card-header">
                    <h4>Taxa por Quilômetro</h4>
                    <span className="pricing-current-rate">R$ {pricing.kmRate.toFixed(2)}/km</span>
                  </div>
                  <div className="pricing-card-content">
                    <label htmlFor="km-rate" className="settings-label">
                  Taxa por quilômetro (R$)
                </label>
                <input
                  type="number"
                  id="km-rate"
                  className="settings-input"
                  value={pricing.kmRate}
                  onChange={handleKmRateChange}
                  min="0"
                  step="0.01"
                />
                    <p className="settings-description">Taxa base por quilômetro para cálculo de fretes</p>
              </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'price-table':
        return (
          <div className="settings-card">
            <div className="settings-section">
              <h2 className="settings-section-title">
                <span className="settings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4V1H2V4H1V5H2V8H3V5H6V4H3ZM8 6H21V5H8V6ZM8 10H21V9H8V10ZM8 14H21V13H8V14ZM8 18H21V17H8V18Z" fill="currentColor"/>
                  </svg>
                </span>
                Tabela de Preços Mínimos
              </h2>

              <div className="city-pairs-section">
                <div className="city-pairs-header">
                  <h4 className="city-pairs-title">
                <span className="settings-label-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 4V1H2V4H1V5H2V8H3V5H6V4H3ZM8 6H21V5H8V6ZM8 10H21V9H8V10ZM8 14H21V13H8V14ZM8 18H21V17H8V18Z" fill="currentColor"/>
                  </svg>
                </span>
                    Rotas Cadastradas
                  </h4>
                <button 
                  className="add-button"
                  onClick={() => handleOpenCityPairModal('add')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                  </svg>
                  Adicionar Rota
                </button>
              </div>
              
              <div className="city-pairs-grid">
                {pricing.cityPairs.length > 0 ? (
                  pricing.cityPairs.map(cityPair => (
                    <div key={cityPair.id} className="city-pair-card">
                      <div className="city-pair-info">
                        <div className="city-pair-route">
                          <div className="city-from">
                            <span className="city-badge">Origem</span>
                            <span className="city-name">{cityPair.fromCity}</span>
                            <span className="city-state">{cityPair.fromState}</span>
                          </div>
                          <div className="route-arrow-container">
                          <span className="route-arrow">→</span>
                          </div>
                          <div className="city-to">
                            <span className="city-badge">Destino</span>
                            <span className="city-name">{cityPair.toCity}</span>
                            <span className="city-state">{cityPair.toState}</span>
                          </div>
                        </div>
                        <div className="city-pair-price-container">
                          <span className="price-label">Preço mínimo</span>
                          <span className="city-pair-price">R$ {cityPair.minimumPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="city-pair-actions">
                        <button 
                          className="action-button edit-button"
                          onClick={() => handleOpenCityPairModal('edit', cityPair)}
                          aria-label="Editar"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                          </svg>
                        </button>
                        <button 
                          className="action-button delete-button"
                          onClick={() => handleDeleteCityPair(cityPair.id)}
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
                  <div className="empty-message">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z" fill="#aaa"/>
                    </svg>
                    <p>Nenhuma rota cadastrada</p>
                    <button 
                      className="add-button small"
                      onClick={() => handleOpenCityPairModal('add')}
                    >
                      Adicionar primeira rota
                    </button>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="settings-card">
            <div className="settings-section">
              <h2 className="settings-section-title">
                <span className="settings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                    <path d="M12 2L2 7V10C2 16 6 20.9 12 22C18 20.9 22 16 22 10V7L12 2Z" stroke="currentColor" strokeWidth="1" fill="none"/>
                  </svg>
                </span>
                Integrações
              </h2>

              <div className="integrations-grid">
                <div className="integration-card active">
                  <div className="integration-header">
                    <div className="integration-logo">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#4285F4"/>
                      </svg>
                    </div>
                    <div className="integration-info">
                      <h3>Google Maps</h3>
                      <span className="integration-status connected">Conectado</span>
                    </div>
                  </div>
                  <p className="integration-description">
                    Integração com Google Maps para cálculo de rotas e distâncias.
                  </p>
                </div>

                <div className="integration-card">
                  <div className="integration-header">
                    <div className="integration-logo">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div className="integration-info">
                      <h3>SMTP Email</h3>
                      <span className="integration-status disconnected">Desconectado</span>
                    </div>
                  </div>
                  <p className="integration-description">
                    Configuração de servidor SMTP para envio de emails automáticos.
                  </p>
                </div>

                <div className="integration-card">
                  <div className="integration-header">
                    <div className="integration-logo">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 15.66 4.52 18.83 8.05 20.15C8.55 20.25 8.75 19.93 8.75 19.66V17.69C6.04 18.30 5.46 16.39 5.46 16.39C5.01 15.28 4.35 14.97 4.35 14.97C3.41 14.34 4.42 14.35 4.42 14.35C5.46 14.43 6.00 15.42 6.00 15.42C6.91 16.96 8.45 16.51 8.81 16.34C8.90 15.69 9.17 15.25 9.46 15.08C7.35 14.91 5.12 14.03 5.12 10.41C5.12 9.38 5.51 8.54 6.02 7.90C5.92 7.72 5.58 6.68 6.12 5.25C6.12 5.25 7.01 4.97 8.75 6.15C9.58 5.92 10.46 5.80 11.33 5.80C12.21 5.80 13.08 5.92 13.92 6.15C15.66 4.97 16.54 5.25 16.54 5.25C17.08 6.68 16.75 7.72 16.64 7.90C17.16 8.54 17.54 9.38 17.54 10.41C17.54 14.04 15.31 14.91 13.19 15.08C13.54 15.39 13.84 16.00 13.84 16.94V19.66C13.84 19.93 14.04 20.25 14.54 20.15C18.08 18.83 20.46 15.66 20.46 11.91C20.46 6.45 16.00 2 10.54 2H12.04Z" fill="#25D366"/>
                      </svg>
                    </div>
                    <div className="integration-info">
                      <h3>WhatsApp Business</h3>
                      <span className="integration-status pending">Pendente</span>
                    </div>
                  </div>
                  <p className="integration-description">
                    Envio de notificações via WhatsApp Business API.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Renderizar abas laterais
  const renderSidebarTabs = () => {
    return (
        <div className="settings-tabs">
        <button 
          className={`settings-tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => handleTabChange('system')}
          >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5C16 9.29 14.21 7.5 12 7.5C9.79 7.5 8 9.29 8 11.5C8 13.71 9.79 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.5 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.5 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.04 4.95 18.95L7.44 17.95C7.96 18.34 8.5 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.5 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" fill="currentColor"/>
            </svg>
          Sistema
        </button>

        <button 
          className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => handleTabChange('security')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="currentColor"/>
          </svg>
          Segurança
        </button>

        <button 
          className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
          </svg>
          Perfil
        </button>

        <button 
            className={`settings-tab ${activeTab === 'vehicles' ? 'active' : ''}`}
          onClick={() => handleTabChange('vehicles')}
          >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01Z" fill="currentColor"/>
            </svg>
          Tipos de Veículos
        </button>

        <button 
            className={`settings-tab ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => handleTabChange('locations')}
          >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
            </svg>
          Locais Predefinidos
        </button>

        <button 
            className={`settings-tab ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => handleTabChange('pricing')}
          >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z" fill="currentColor"/>
            </svg>
          Configurações de Preços
        </button>

        <button 
          className={`settings-tab ${activeTab === 'price-table' ? 'active' : ''}`}
          onClick={() => handleTabChange('price-table')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4V1H2V4H1V5H2V8H3V5H6V4H3ZM8 6H21V5H8V6ZM8 10H21V9H8V10ZM8 14H21V13H8V14ZM8 18H21V17H8V18Z" fill="currentColor"/>
          </svg>
          Tabela de Preços Mínimos
        </button>

        <button 
          className={`settings-tab ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => handleTabChange('integrations')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
            <path d="M12 2L2 7V10C2 16 6 20.9 12 22C18 20.9 22 16 22 10V7L12 2Z" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
          Integrações
        </button>
      </div>
    );
  };
  
  return (
    <div className="settings-page">
      <Header />
      <div className="settings-content">
        <div className="settings-title-container">
          <h1 className="settings-title">Configuração</h1>
        </div>
        
        {(isLoading || !isMinimumLoadingTimePassed) ? (
          // Skeleton Loading
          <div className="settings-skeleton">
            <div className="settings-skeleton-main">
              <div className="skeleton-sidebar">
                <div className="skeleton-tabs">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="skeleton-tab">
                      <div className="skeleton-tab-icon"></div>
                      <div className="skeleton-tab-text"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="skeleton-content">
                <div className="skeleton-card">
                  <div className="skeleton-header">
                    <div className="skeleton-tab-icon"></div>
                    <div className="skeleton-title"></div>
                  </div>
                  <div className="skeleton-content-inner">
                    {/* System Cards Grid - matching real structure */}
                    <div className="skeleton-cards-grid">
                      {/* Language & Region Card */}
                      <div className="skeleton-system-card">
                        <div className="skeleton-card-header">
                          <div className="skeleton-tab-icon"></div>
                          <div className="skeleton-section-title"></div>
                        </div>
                        <div className="skeleton-card-content">
                          {[...Array(4)].map((_, index) => (
                            <div key={index} className="skeleton-form-group">
                              <div className="skeleton-label"></div>
                              <div className="skeleton-input"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Notifications Card */}
                      <div className="skeleton-system-card">
                        <div className="skeleton-card-header">
                          <div className="skeleton-tab-icon"></div>
                          <div className="skeleton-section-title"></div>
                        </div>
                        <div className="skeleton-card-content">
                          {[...Array(4)].map((_, index) => (
                            <div key={index} className="skeleton-toggle-group">
                              <div className="skeleton-toggle-item">
                                <div className="skeleton-toggle"></div>
                                <div className="skeleton-toggle-label"></div>
                              </div>
                              <div className="skeleton-toggle-description"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Theme Card */}
                      <div className="skeleton-system-card">
                        <div className="skeleton-card-header">
                          <div className="skeleton-tab-icon"></div>
                          <div className="skeleton-section-title"></div>
                        </div>
                        <div className="skeleton-card-content">
                          <div className="skeleton-theme-selector">
                            {[...Array(3)].map((_, index) => (
                              <div key={index} className="skeleton-theme-option">
                                <div className="skeleton-theme-preview"></div>
                                <div className="skeleton-theme-label"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <div className="settings-main">
          <div className="settings-sidebar">
          {renderSidebarTabs()}
          </div>
          
          <div className="settings-card-container">
            {renderTabContent()}
          </div>
        </div>
        )}
      </div>
      
        <VehicleModal 
          isOpen={vehicleModalOpen}
          onClose={handleCloseVehicleModal}
          onSave={handleAddVehicle}
          initialData={currentVehicle}
          editMode={editVehicleMode}
        vehicleType={activeVehicleTab}
        />
      
        <LocationModal 
          isOpen={locationModalOpen}
          onClose={handleCloseLocationModal}
          onSave={handleAddLocation}
          initialData={currentLocation}
          editMode={editLocationMode}
        />
      
        <CityPairModal 
          isOpen={cityPairModalOpen}
          onClose={handleCloseCityPairModal}
          onSave={handleSaveCityPair}
          initialData={currentCityPair}
          editMode={editCityPairMode}
        />
    </div>
  );
};

export default Settings;