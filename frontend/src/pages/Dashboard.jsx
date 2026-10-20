import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { resumeService } from '../services/resumeService';
import { useAuth } from '../context/AuthContext';
import {
  pageContainer,
  pageContent,
  colors,
  shadows,
  radii,
  primaryBtn,
  secondaryBtn,
} from '../styles/tokens';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
    if (user?.email) {
      const hasLoggedInKey = `hasLoggedIn_${user.email}`;
      const hasLoggedInBefore = localStorage.getItem(hasLoggedInKey);
      if (!hasLoggedInBefore) {
        setShowWelcome(true);
        localStorage.setItem(hasLoggedInKey, 'true');
      }
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const data = await resumeService.getCandidateStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainer}>
      <Navbar />

      {showWelcome && (
        <div style={styles.overlay} onClick={() => setShowWelcome(false)}>
          <div style={styles.welcomeCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.welcomeIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 style={styles.welcomeTitle}>Welcome, {user?.hrName}!</h2>
            <p style={styles.welcomeText}>
              Thank you for joining AI Resume Shortlisting System.
              <br />
              Start by uploading resumes to find the best candidates.
            </p>
            <button onClick={() => setShowWelcome(false)} style={styles.welcomeBtn}>
              Get Started
            </button>
          </div>
        </div>
      )}

      <div style={pageContent}>
        <h1 style={styles.heading}>Dashboard</h1>

        {loading ? (
          <p>Loading statistics...</p>
        ) : (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div style={styles.statValue}>{stats?.totalCandidates || 0}</div>
              <div style={styles.statLabel}>Total Candidates</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div style={styles.statValue}>{stats?.shortlistedCandidates || 0}</div>
              <div style={styles.statLabel}>Shortlisted</div>
            </div>

            <div style={{ ...styles.statCard, cursor: 'pointer' }} onClick={() => navigate('/jobs')}>
              <div style={styles.statIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.amber} strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div style={styles.statValue}>{stats?.totalJobs || 0}</div>
              <div style={styles.statLabel}>Active Jobs</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div style={styles.statValue}>{stats?.totalReports || 0}</div>
              <div style={styles.statLabel}>Reports Generated</div>
            </div>
          </div>
        )}

        <div style={styles.actions}>
          <button onClick={() => navigate('/upload')} style={{ ...primaryBtn, padding: '1rem 2rem', fontSize: '1rem' }}>
            Upload Resume
          </button>
          <button onClick={() => navigate('/candidates')} style={{ ...secondaryBtn, padding: '1rem 2rem', fontSize: '1rem' }}>
            View Candidates
          </button>
          <button onClick={() => navigate('/reports')} style={{ ...secondaryBtn, padding: '1rem 2rem', fontSize: '1rem' }}>
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  heading: {
    fontSize: '2rem',
    color: colors.textPrimary,
    marginBottom: '2rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: colors.cardBg,
    borderRadius: radii.xl,
    padding: '2rem',
    textAlign: 'center',
    boxShadow: shadows.card,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  statIcon: {
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '1rem',
    color: colors.textSecondary,
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  welcomeCard: {
    background: colors.cardBg,
    borderRadius: radii.xxl,
    padding: '3rem',
    maxWidth: '500px',
    textAlign: 'center',
    boxShadow: shadows.modal,
  },
  welcomeIcon: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: '2rem',
    color: colors.textPrimary,
    marginBottom: '1rem',
  },
  welcomeText: {
    fontSize: '1rem',
    color: colors.textSecondary,
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  welcomeBtn: {
    padding: '1rem 2rem',
    background: colors.purpleGradient,
    color: 'white',
    border: 'none',
    borderRadius: radii.lg,
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },
};

export default Dashboard;
