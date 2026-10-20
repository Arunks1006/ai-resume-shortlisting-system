import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors, shadows, radii } from '../styles/tokens';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Navigation is handled inside AuthContext.logout → handleLogout
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Fixed: merged both style props into one object to avoid the duplicate prop bug */}
        <div style={styles.brand} onClick={() => navigate('/dashboard')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={styles.icon}>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth="2"/>
          </svg>
          <span style={styles.brandText}>AI Resume Shortlisting</span>
        </div>

        <div style={styles.userSection}>
          {/* Show placeholders while user data is loading — prevents layout shift */}
          <div style={styles.userInfo}>
            <span style={styles.companyName}>
              {user?.companyName ?? <span style={styles.skeleton}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>}
            </span>
            <span style={styles.userName}>
              {user?.hrName ?? <span style={styles.skeleton}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>}
            </span>
          </div>
          <div style={styles.buttonGroup}>
            <button onClick={() => navigate('/dashboard')} style={styles.navBtn}>
              Home
            </button>
            <button onClick={handleLogout} style={styles.navBtn}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    background: colors.blueGradient,
    padding: '1rem 2rem',
    boxShadow: shadows.card,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',   // cursor moved here, no more duplicate style prop
  },
  icon: {
    marginTop: '4px',
  },
  brandText: {
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem',
  },
  companyName: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
  },
  userName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '0.9rem',
  },
  skeleton: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.25)',
    borderRadius: radii.sm,
    animation: 'spin 1.5s ease-in-out infinite alternate', // reuse spin for shimmer pulse
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  navBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '0.5rem 1rem',
    borderRadius: radii.md,
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
};

export default Navbar;
