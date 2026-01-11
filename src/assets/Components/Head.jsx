import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { BASE_URL } from '../services/Baseurl';
import './Head.css';

const Head = () => {
  const { isAuthorized, logout, userData } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => location.pathname === path ? 'active-link' : '';

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          AuraCare
        </Link>

        {/* Hamburger Menu Icon */}
        <button className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <nav>
            <ul className="nav-menu">
              <li><Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMobileMenu}>Home</Link></li>
              <li><Link to="/about" className={`nav-link ${isActive('/about')}`} onClick={closeMobileMenu}>About Us</Link></li>
              {userData?.role !== 'receiver' && (
                <li><Link to="/donor" className={`nav-link ${isActive('/donor')}`} onClick={closeMobileMenu}>Donor</Link></li>
              )}
              {userData?.role !== 'donor' && (
                <li><Link to="/receiver" className={`nav-link ${isActive('/receiver')}`} onClick={closeMobileMenu}>Receiver</Link></li>
              )}
              {userData?.role === 'donor' && (
                <li><Link to="/receivers-list" className={`nav-link ${isActive('/receivers-list')}`} onClick={closeMobileMenu}>Receivers List</Link></li>
              )}
              <li><Link to="/aura" className={`nav-link ${isActive('/aura')}`} onClick={closeMobileMenu}>Donors List</Link></li>
              <li><Link to="/contact" className={`nav-link ${isActive('/contact')}`} onClick={closeMobileMenu}>Contact</Link></li>
              {isAuthorized && (
                userData?.isPremium ? (
                  <li><Link to="/book-doctor" className={`nav-link ${isActive('/book-doctor')}`} style={{color: '#d97706', fontWeight: 'bold'}} onClick={closeMobileMenu}>Consultation</Link></li>
                ) : (
                  <li><Link to="/premium" className={`nav-link ${isActive('/premium')}`} style={{color: '#d97706', fontWeight: 'bold'}} onClick={closeMobileMenu}>Go Premium 🌟</Link></li>
                )
              )}
              {isAuthorized && userData?.role === 'admin' && (
                 <li><Link to="/admin" className={`nav-link ${isActive('/admin')}`} onClick={closeMobileMenu}>Admin</Link></li>
              )}
              {isAuthorized && (
                 <li><Link to="/profile" className={`nav-link ${isActive('/profile')}`} onClick={closeMobileMenu}>Profile</Link></li>
              )}
            </ul>
          </nav>

          <div className="header-actions">
            {isAuthorized ? (
              <div className="user-profile-nav">
                <span className="user-name">Hi, {userData?.fullName?.split(' ')[0]}</span>
                <button onClick={handleLogoutClick} className="btn btn-outline btn-sm">Log Out</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline btn-sm" onClick={closeMobileMenu}>Log In</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMobileMenu}>Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Logout</h3>
            <p>If you really want to logout select Yes, otherwise Cancel.</p>
            <div className="modal-actions">
              <button onClick={confirmLogout} className="btn btn-primary btn-sm" style={{backgroundColor: 'var(--primary-red)', color: 'white'}}>Yes, Logout</button>
              <button onClick={cancelLogout} className="btn btn-outline btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Head;
