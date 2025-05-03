import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAvatarClick = () => {
    setShowDropdown(!showDropdown);
  };

  const navigateToProfile = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  return (
    <header className="app-header">
      <div className="header-logo-container">
        <div className="header-logo">
          <span className="logo-icon">⚡</span>
          blank.
        </div>
        <nav className="header-nav">
          <Link 
            to="/orders" 
            className={`header-nav-link ${isActive('/orders') && !isActive('/orders/new') ? 'active' : ''}`}
          >
            Histórico
          </Link>
          <Link 
            to="/orders/new" 
            className={`header-nav-link ${isActive('/orders/new') ? 'active' : ''}`}
          >
            Nova solicitação
          </Link>
          <Link 
            to="/settings" 
            className={`header-nav-link ${isActive('/settings') ? 'active' : ''}`}
          >
            Configuração
          </Link>
          <Link 
            to="/users" 
            className={`header-nav-link ${isActive('/users') ? 'active' : ''}`}
          >
            Lista de usuários
          </Link>
        </nav>
      </div>
      <div className="header-actions">
        <button className="notification-button">
          <div className="notification-indicator"></div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
          </svg>
        </button>
        <div className="avatar-container" ref={dropdownRef}>
          <div className="avatar" onClick={handleAvatarClick}>
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User avatar" />
          </div>
          {showDropdown && (
            <div className="avatar-dropdown">
              <div className="dropdown-item" onClick={navigateToProfile}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                </svg>
                <span>Meu Perfil</span>
              </div>
              <div className="dropdown-item" onClick={() => navigate('/settings')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
                </svg>
                <span>Configurações</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z" fill="currentColor"/>
                </svg>
                <span>Sair</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 