import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import './profile.css';

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState({
    name: 'João Silva',
    email: 'joao.silva@example.com',
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
              Perfil atualizado com sucesso!
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
              </div>
              <button 
                className="profile-edit-button"
                onClick={handleEditToggle}
              >
                {editMode ? 'Cancelar' : 'Editar perfil'}
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
                    placeholder="Seu nome completo"
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
                    placeholder="Seu email"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-button"
                  >
                    Salvar alterações
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
              </div>
            )}
          </div>

          <div className="profile-title-row" style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <h2 className="profile-section-title">Alterar senha</h2>
            </div>
          </div>

          {passwordSuccess && (
            <div className="success-message">
              Senha atualizada com sucesso!
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
                  placeholder="Digite sua senha atual"
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
                  placeholder="Digite a nova senha"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar nova senha</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirme a nova senha"
                  required
                />
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-button"
                >
                  Atualizar senha
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