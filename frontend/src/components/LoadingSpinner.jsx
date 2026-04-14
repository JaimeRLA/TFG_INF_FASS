import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'medium', message = 'Cargando...', fullScreen = false }) => {
  const sizes = {
    small: 20,
    medium: 32,
    large: 48
  };

  const spinnerSize = sizes[size] || sizes.medium;

  const spinnerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: fullScreen ? '0' : '20px'
  };

  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9998,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } : {};

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}>
        <Loader2 
          size={spinnerSize} 
          color="#2563eb" 
          style={{ animation: 'spin 1s linear infinite' }}
        />
        {message && (
          <p style={{ 
            margin: 0, 
            color: '#64748b', 
            fontSize: size === 'small' ? '0.8rem' : '0.9rem',
            fontWeight: '500'
          }}>
            {message}
          </p>
        )}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoadingSpinner;
