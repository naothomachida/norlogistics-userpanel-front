import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Header from '../../components/layout/Header';
import './profile.css';

const Profile: React.FC = () => {
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  
  // Dados iniciais do perfil
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    photo: '',
    role: '',
    driverInfo: {
      licenseType: '',
      licenseNumber: '',
      experience: 0,
      observations: ''
    },
    managedUsers: []
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [tempProfileData, setTempProfileData] = useState({ ...profileData });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Atualizar dados do perfil quando o userProfile mudar
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',  // Agora considera o telefone do perfil se existir
        position: getRoleDisplay(userProfile.role),
        department: 'Logística',
        photo: userProfile.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userProfile.name),
        role: userProfile.role,
        driverInfo: userProfile.driverInfo || {
          licenseType: '',
          licenseNumber: '',
          experience: 0,
          observations: ''
        },
        managedUsers: userProfile.managedUsers || []
      });
      
      // Atualizar também os dados temporários
      setTempProfileData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        position: getRoleDisplay(userProfile.role),
        department: 'Logística',
        photo: userProfile.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userProfile.name),
        role: userProfile.role,
        driverInfo: userProfile.driverInfo || {
          licenseType: '',
          licenseNumber: '',
          experience: 0,
          observations: ''
        },
        managedUsers: userProfile.managedUsers || []
      });
    }
  }, [userProfile]);

  // Função para obter o nome formatado do cargo com base na role
  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'driver':
        return 'Motorista';
      case 'user':
        return 'Usuário';
      default:
        return 'Não definido';
    }
  };
  
  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit
      setTempProfileData({ ...profileData });
      setPhotoPreview(null);
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Verifica se o nome do campo contém ponto, indicando um campo aninhado
    if (name.includes('.')) {
      const [parentField, childField] = name.split('.');
      setTempProfileData({
        ...tempProfileData,
        [parentField]: {
          ...tempProfileData[parentField as keyof typeof tempProfileData],
          [childField]: value
        }
      });
    } else {
      setTempProfileData({
        ...tempProfileData,
        [name]: value,
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would send the data to the server
    setProfileData({
      ...tempProfileData,
      photo: photoPreview || profileData.photo, // Use the preview if available
    });
    
    setEditMode(false);
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would validate and send the data to the server
    
    // Reset password form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    setPasswordSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setPasswordSuccess(false);
    }, 3000);
  };

  // Se não houver usuário logado, não renderizar a página
  if (!userProfile) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-content">
          <main className="profile-main">
            <div className="profile-title-row">
              <h1 className="profile-title">Perfil</h1>
            </div>
            <div className="profile-card">
              <p>Usuário não encontrado. Por favor, faça login novamente.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-content">
        <main className="profile-main">
          <div className="profile-title-row">
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '20px' }}>
              <h1 className="profile-title">Perfil</h1>
            </div>
          </div>

          {saveSuccess && (
            <div className="success-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Perfil atualizado!
            </div>
          )}

          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-photo-container">
                <img 
                  src={photoPreview || profileData.photo} 
                  alt="Foto de perfil" 
                  className="profile-photo"
                />
                {editMode && (
                  <label htmlFor="photo-upload" className="photo-upload-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
                    </svg>
                    <input 
                      type="file" 
                      id="photo-upload" 
                      className="photo-upload-input" 
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{profileData.name}</h2>
                <p className="profile-email">{profileData.email}</p>
                <p className="profile-position">{profileData.position} · {profileData.department}</p>
              </div>
              <button 
                className="profile-edit-button"
                onClick={handleEditToggle}
              >
                {editMode ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {editMode ? (
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">Nome</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={tempProfileData.name}
                    onChange={handleInputChange}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={tempProfileData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Telefone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={tempProfileData.phone}
                    onChange={handleInputChange}
                    placeholder="Telefone"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="position">Cargo</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={tempProfileData.position}
                    onChange={handleInputChange}
                    placeholder="Cargo"
                    disabled={true}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="department">Departamento</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={tempProfileData.department}
                    onChange={handleInputChange}
                    placeholder="Departamento"
                  />
                </div>
                
                {/* Campos adicionais específicos para motoristas */}
                {userProfile.role === 'driver' && (
                  <>
                    <h3 className="detail-section-title">Informações do Motorista</h3>
                    
                    <div className="form-group">
                      <label htmlFor="driverInfo.licenseType">Tipo de CNH</label>
                      <input
                        type="text"
                        id="driverInfo.licenseType"
                        name="driverInfo.licenseType"
                        value={tempProfileData.driverInfo?.licenseType}
                        onChange={handleInputChange}
                        placeholder="Tipo da CNH"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="driverInfo.licenseNumber">Número da CNH</label>
                      <input
                        type="text"
                        id="driverInfo.licenseNumber"
                        name="driverInfo.licenseNumber"
                        value={tempProfileData.driverInfo?.licenseNumber}
                        onChange={handleInputChange}
                        placeholder="Número da CNH"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="driverInfo.experience">Anos de Experiência</label>
                      <input
                        type="number"
                        id="driverInfo.experience"
                        name="driverInfo.experience"
                        value={tempProfileData.driverInfo?.experience}
                        onChange={handleInputChange}
                        placeholder="Anos de experiência"
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="driverInfo.observations">Observações</label>
                      <textarea
                        id="driverInfo.observations"
                        name="driverInfo.observations"
                        value={tempProfileData.driverInfo?.observations}
                        onChange={handleInputChange}
                        placeholder="Informações adicionais"
                        className="profile-textarea"
                        rows={4}
                      />
                    </div>
                  </>
                )}
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-button"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">Nome:</span>
                  <span className="detail-value">{profileData.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{profileData.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Telefone:</span>
                  <span className="detail-value">{profileData.phone || 'Não informado'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Cargo:</span>
                  <span className="detail-value">{profileData.position}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Departamento:</span>
                  <span className="detail-value">{profileData.department}</span>
                </div>
                
                {/* Informações adicionais específicas de perfil */}
                {userProfile.role === 'driver' && userProfile.driverInfo && (
                  <>
                    <div className="detail-divider"></div>
                    <h3 className="detail-section-title">Informações do Motorista</h3>
                    
                    <div className="detail-row">
                      <span className="detail-label">CNH:</span>
                      <span className="detail-value">
                        {userProfile.driverInfo.licenseType || '-'} 
                        {userProfile.driverInfo.licenseNumber ? ` - ${userProfile.driverInfo.licenseNumber}` : ''}
                      </span>
                    </div>
                    
                    {userProfile.driverInfo.experience && (
                      <div className="detail-row">
                        <span className="detail-label">Experiência:</span>
                        <span className="detail-value">
                          {userProfile.driverInfo.experience} {userProfile.driverInfo.experience === 1 ? 'ano' : 'anos'}
                        </span>
                      </div>
                    )}
                    
                    {userProfile.driverInfo.observations && (
                      <div className="detail-row">
                        <span className="detail-label">Observações:</span>
                        <span className="detail-value">{userProfile.driverInfo.observations}</span>
                      </div>
                    )}
                  </>
                )}
                
                {userProfile.role === 'manager' && userProfile.managedUsers && (
                  <>
                    <div className="detail-divider"></div>
                    <h3 className="detail-section-title">Informações do Gerente</h3>
                    
                    <div className="detail-row">
                      <span className="detail-label">Equipe:</span>
                      <span className="detail-value">
                        {userProfile.managedUsers.length} {userProfile.managedUsers.length === 1 ? 'membro' : 'membros'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="password-card">
            <h2 className="card-title">Alterar Senha</h2>
            
            {passwordSuccess && (
              <div className="success-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Senha atualizada!
              </div>
            )}
            
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="password-section">
                <h3 className="password-section-title">Verificação de Identidade</h3>
                <p className="password-section-description">
                  Digite sua senha atual para confirmar sua identidade
                </p>
                <div className="form-group current-password-group">
                  <label htmlFor="currentPassword">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 11H5V21H19V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 9V8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16.5C12.8284 16.5 13.5 15.8284 13.5 15C13.5 14.1716 12.8284 13.5 12 13.5C11.1716 13.5 10.5 14.1716 10.5 15C10.5 15.8284 11.1716 16.5 12 16.5Z" fill="currentColor"/>
                    </svg>
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Digite sua senha atual"
                    required
                    className="current-password-input"
                  />
                </div>
              </div>

              <div className="password-section">
                <h3 className="password-section-title">Nova Senha</h3>
                <p className="password-section-description">
                  Defina uma nova senha forte para sua conta
                </p>
                <div className="form-group">
                  <label htmlFor="newPassword">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 11H5V21H19V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 7V8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="16" r="2" fill="currentColor"/>
                      <path d="M12 16V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Digite a nova senha"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirme a nova senha"
                    required
                  />
                  {passwordData.newPassword && passwordData.confirmPassword && 
                   passwordData.newPassword !== passwordData.confirmPassword && (
                    <div className="password-mismatch">
                      As senhas não conferem
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={!passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px" }}>
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile; 