import React from 'react';

/**
 * Loader — spinner component.
 *
 * The @keyframes spin animation is defined in src/styles.css (global stylesheet)
 * so it's available before this component mounts without any DOM manipulation.
 * The old module-level document.styleSheets[0].insertRule() has been removed —
 * it caused crashes in test environments and duplicate rule injection on hot-reload.
 */
const Loader = ({ message = 'Loading...' }) => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.message}>{message}</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  message: {
    marginTop: '1rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
};

export default Loader;
