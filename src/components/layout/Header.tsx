import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import './Header.css';
import norLogo from '../../assets/logo-nor.png';
import { FiHome, FiSettings, FiUsers, FiClock, FiPlusSquare, FiBell, FiLogOut, FiTruck } from 'react-icons/fi';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userProfile } = useSelector((state: RootState) => state.auth);
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
    navigate('/settings?tab=profile');
    setShowDropdown(false);
  };

  const handleLogout = () => {
    // Pedir confirmação ao usuário
    if (window.confirm('Tem certeza que deseja sair?')) {
      // Dispatch logout action
      dispatch(logout());
      
      // Limpar localStorage
      localStorage.removeItem('userEmail');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      
      // Redirecionar para a página de login
      navigate('/login');
    }
    
    // Fechar o dropdown (mesmo se cancelar)
    setShowDropdown(false);
  };

  // Obter as iniciais do nome do usuário para a imagem do avatar
  const getUserInitials = () => {
    if (!userProfile?.name) return 'NU'; // Não Usuario
    
    const names = userProfile.name.split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    
    // Use first and last name initials, with a preference for more meaningful names
    const firstInitial = names[0].charAt(0).toUpperCase();
    const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
    
    // Special handling for common prefixes or short names
    const skipFirstInitialPrefixes = ['de', 'da', 'do', 'das', 'dos'];
    if (skipFirstInitialPrefixes.includes(names[0].toLowerCase()) && names.length > 2) {
      return `${names[1].charAt(0).toUpperCase()}${lastInitial}`;
    }
    
    return `${firstInitial}${lastInitial}`;
  };

  // Obter o nome de exibição do usuário
  const getDisplayName = () => {
    if (!userProfile?.name) return 'Usuário';
    
    const names = userProfile.name.split(' ');
    if (names.length === 1) {
      return names[0];
    }
    
    return `${names[0]} ${names[names.length - 1]}`;
  };

  // Renderizar o avatar do usuário
  const renderAvatar = () => {
    if (userProfile?.avatarUrl) {
      return <img src={userProfile.avatarUrl} alt={`Avatar de ${userProfile.name}`} />;
    }
    
    return (
      <div className="avatar-initials">
        {getUserInitials()}
      </div>
    );
  };

  // Determinar quais links mostrar baseado na role do usuário
  const renderNavLinks = () => {
    if (!userProfile) return null;

    // Admin vê todos os menus
    if (userProfile.role === 'admin') {
      return (
        <>
          <Link 
            to="/orders" 
            className={`header-nav-link ${isActive('/orders') && !isActive('/orders/new') ? 'active' : ''}`}
          >
            <FiClock style={{ marginRight: 6 }} /> Histórico
          </Link>
          <Link 
            to="/orders/new" 
            className={`header-nav-link ${isActive('/orders/new') ? 'active' : ''}`}
          >
            <FiPlusSquare style={{ marginRight: 6 }} /> Nova solicitação
          </Link>
          <Link 
            to="/users" 
            className={`header-nav-link ${isActive('/users') ? 'active' : ''}`}
          >
            <FiUsers style={{ marginRight: 6 }} /> Lista de usuários
          </Link>
          <Link 
            to="/tolls" 
            className={`header-nav-link ${isActive('/tolls') ? 'active' : ''}`}
          >
            <FiTruck style={{ marginRight: 6 }} /> Pedágios
          </Link>
          <Link 
            to="/settings" 
            className={`header-nav-link ${isActive('/settings') ? 'active' : ''}`}
          >
            <FiSettings style={{ marginRight: 6 }} /> Configuração
          </Link>
        </>
      );
    }

    // User vê apenas Histórico e Nova solicitação
    if (userProfile.role === 'user') {
      return (
        <>
          <Link 
            to="/orders" 
            className={`header-nav-link ${isActive('/orders') && !isActive('/orders/new') ? 'active' : ''}`}
          >
            <FiClock style={{ marginRight: 6 }} /> Histórico
          </Link>
          <Link 
            to="/orders/new" 
            className={`header-nav-link ${isActive('/orders/new') ? 'active' : ''}`}
          >
            <FiPlusSquare style={{ marginRight: 6 }} /> Nova solicitação
          </Link>
        </>
      );
    }

    // Gerente vê apenas Histórico
    if (userProfile.role === 'manager') {
      return (
        <Link 
          to="/orders" 
          className={`header-nav-link ${isActive('/orders') ? 'active' : ''}`}
        >
          <FiClock style={{ marginRight: 6 }} /> Histórico
        </Link>
      );
    }

    // Motorista vê apenas Histórico
    if (userProfile.role === 'driver') {
      return (
        <Link 
          to="/orders" 
          className={`header-nav-link ${isActive('/orders') ? 'active' : ''}`}
        >
          <FiClock style={{ marginRight: 6 }} /> Histórico
        </Link>
      );
    }

    // Fallback para qualquer outro caso
    return (
      <Link 
        to="/orders" 
        className={`header-nav-link ${isActive('/orders') ? 'active' : ''}`}
      >
        <FiClock style={{ marginRight: 6 }} /> Histórico
      </Link>
    );
  };

  return (
    <header className="app-header">
      <div className="header-logo-container">
        <div className="header-logo">
          <img src={norLogo} alt="NOR Logistics" className="nor-logo" />
          <span className="nor-text">NOR-LOGISTICS</span>
        </div>
        <nav className="header-nav">
          {renderNavLinks()}
        </nav>
      </div>
      <div className="header-actions">
        <div className="notification-container">
        <button className="notification-button">
            <FiBell size={24} />
          <div className="notification-indicator"></div>
        </button>
          <span className="notification-tooltip">Notificações</span>
        </div>
        <div className="avatar-container" ref={dropdownRef}>
          <div className="avatar" onClick={handleAvatarClick}>
            {renderAvatar()}
          </div>
          {showDropdown && (
            <div className="avatar-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {renderAvatar()}
                </div>
                <div className="dropdown-user-info">
                <div className="user-name">{getDisplayName()}</div>
                <div className="user-role">
                  {userProfile?.role === 'admin' && 'Administrador'}
                  {userProfile?.role === 'manager' && 'Gerente'}
                  {userProfile?.role === 'user' && 'Usuário'}
                  {userProfile?.role === 'driver' && 'Motorista'}
                  {!userProfile?.role && 'Cargo não definido'}
                  </div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-menu">
              <div className="dropdown-item" onClick={navigateToProfile}>
                  <FiSettings size={16} /> Perfil
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                  <FiLogOut size={16} /> Sair
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 