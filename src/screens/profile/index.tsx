import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import './profile.css';

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState({
    name: 'João Silva',
    email: 'joao.silva@example.com',
    phone: '(11) 98765-4321',
    position: 'Gerente de Transportes',
    department: 'Logística',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
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

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit
      setTempProfileData({ ...profileData });
      setPhotoPreview(null);
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempProfileData({
      ...tempProfileData,
      [name]: value,
    });
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
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-button"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            ) :
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
                  <span className="detail-value">{profileData.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Cargo:</span>
                  <span className="detail-value">{profileData.position}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Departamento:</span>
                  <span className="detail-value">{profileData.department}</span>
                </div>
              </div>
            }
          </div>

          <div className="profile-title-row" style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <h2 className="profile-section-title">Alterar senha</h2>
            </div>
          </div>

          {passwordSuccess && (
            <div className="success-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Senha atualizada!
            </div>
          )}

          <div className="profile-card">
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Senha atual</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Senha atual"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Nova senha</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nova senha"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar senha</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirmar senha"
                  required
                />
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-button"
                >
                  Atualizar
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