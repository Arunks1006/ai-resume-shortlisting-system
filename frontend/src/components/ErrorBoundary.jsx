import React from 'react';
import { colors, shadows, radii } from '../styles/tokens';

/**
 * ErrorBoundary — catches unhandled render errors in any child component tree
 * and displays a friendly fallback UI instead of a blank screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console for development; swap with a real logger (Sentry etc.) in production
    console.error('[ErrorBoundary] Caught an error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.overlay}>
          <div style={styles.card}>
            <div style={styles.iconWrapper}>
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.red}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              An unexpected error occurred. Your data is safe — you can go back
              to the dashboard and try again.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre style={styles.errorDetail}>
                {this.state.error.toString()}
              </pre>
            )}
            <button onClick={this.handleReload} style={styles.btn}>
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  overlay: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.pageBg,
    padding: '1rem',
  },
  card: {
    background: colors.cardBg,
    borderRadius: radii.xxl,
    padding: '3rem 2.5rem',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
    boxShadow: shadows.modal,
  },
  iconWrapper: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    fontSize: '1.75rem',
    color: colors.textPrimary,
    marginBottom: '1rem',
    fontWeight: '700',
  },
  message: {
    fontSize: '1rem',
    color: colors.textSecondary,
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  errorDetail: {
    background: colors.redBg,
    color: colors.redText,
    padding: '1rem',
    borderRadius: radii.lg,
    fontSize: '0.75rem',
    textAlign: 'left',
    overflowX: 'auto',
    marginBottom: '1.5rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  btn: {
    padding: '0.875rem 2rem',
    background: colors.blue,
    color: 'white',
    border: 'none',
    borderRadius: radii.lg,
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default ErrorBoundary;
