import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
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
            to="/dashboard" 
            className={`header-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/accounts" 
            className={`header-nav-link ${isActive('/accounts') ? 'active' : ''}`}
          >
            Accounts
          </Link>
          <Link 
            to="/transactions" 
            className={`header-nav-link ${isActive('/transactions') ? 'active' : ''}`}
          >
            Transactions
          </Link>
          <Link 
            to="/messages" 
            className={`header-nav-link ${isActive('/messages') ? 'active' : ''}`}
          >
            Messages
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
        <div className="avatar">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User avatar" />
        </div>
      </div>
    </header>
  );
};

export default Header; 