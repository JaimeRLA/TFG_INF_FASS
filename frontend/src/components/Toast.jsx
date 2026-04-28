import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: '#dcfce7',
      border: '#16a34a',
      text: '#15803d',
      icon: CheckCircle2
    },
    error: {
      bg: '#fee2e2',
      border: '#dc2626',
      text: '#991b1b',
      icon: XCircle
    },
    warning: {
      bg: '#fef3c7',
      border: '#f59e0b',
      text: '#92400e',
      icon: AlertCircle
    },
    info: {
      bg: '#dbeafe',
      border: '#2563eb',
      text: '#1e40af',
      icon: Info
    }
  };

  const config = styles[type] || styles.info;
  const Icon = config.icon;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      backgroundColor: '#ffffff',
      border: `1px solid ${config.border}`,
      borderLeft: `3px solid ${config.border}`,
      borderRadius: '6px',
      padding: '12px 16px',
      minWidth: '280px',
      maxWidth: '440px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'slideIn 0.2s ease-out',
      fontFamily: '"Inter", system-ui, sans-serif'
    }}>
      <Icon size={22} color={config.border} style={{ flexShrink: 0 }} />
      <p style={{ 
        margin: 0, 
        color: config.text, 
        fontSize: '0.9rem', 
        fontWeight: '500',
        flex: 1,
        lineHeight: '1.4'
      }}>
        {message}
      </p>
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.6,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
      >
        <X size={18} color={config.text} />
      </button>
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
