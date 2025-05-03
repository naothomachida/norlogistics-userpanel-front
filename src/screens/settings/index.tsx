import React from 'react';
import Header from '../../components/layout/Header';
import './settings.css';

const Settings: React.FC = () => {
  return (
    <div className="settings-page">
      <Header />
      <div className="settings-content">
        <main className="settings-main">
          <div className="settings-title-row">
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <h1 className="settings-title">Configurações</h1>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-section">
              <h2 className="settings-section-title">Preferências da conta</h2>
              
              <div className="settings-form-group">
                <label htmlFor="language">Idioma</label>
                <select id="language" className="settings-input">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
              
              <div className="settings-form-group">
                <label htmlFor="timezone">Fuso horário</label>
                <select id="timezone" className="settings-input">
                  <option value="America/Sao_Paulo">América/São Paulo (GMT-3)</option>
                  <option value="America/New_York">América/Nova York (GMT-5)</option>
                  <option value="Europe/London">Europa/Londres (GMT+0)</option>
                </select>
              </div>
              
              <div className="settings-form-group">
                <label htmlFor="notifications">Notificações</label>
                <div className="settings-toggle-group">
                  <div className="settings-toggle">
                    <input type="checkbox" id="email-notifications" />
                    <label htmlFor="email-notifications">Notificações por e-mail</label>
                  </div>
                  <div className="settings-toggle">
                    <input type="checkbox" id="push-notifications" />
                    <label htmlFor="push-notifications">Notificações push</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="settings-section">
              <h2 className="settings-section-title">Segurança</h2>
              
              <div className="settings-form-group">
                <label htmlFor="current-password">Senha atual</label>
                <input 
                  type="password" 
                  id="current-password" 
                  className="settings-input"
                  placeholder="Digite sua senha atual"
                />
              </div>
              
              <div className="settings-form-group">
                <label htmlFor="new-password">Nova senha</label>
                <input 
                  type="password" 
                  id="new-password" 
                  className="settings-input"
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div className="settings-form-group">
                <label htmlFor="confirm-password">Confirmar nova senha</label>
                <input 
                  type="password" 
                  id="confirm-password" 
                  className="settings-input"
                  placeholder="Confirme a nova senha"
                />
              </div>
              
              <button className="settings-button">Atualizar senha</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings; 