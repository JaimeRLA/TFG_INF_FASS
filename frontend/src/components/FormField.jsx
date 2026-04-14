import React from 'react';
import { AlertCircle } from 'lucide-react';

const FormField = ({ 
  label, 
  error, 
  required = false, 
  children, 
  helpText = null 
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          color: error ? '#dc2626' : '#334155',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          {label}
          {required && <span style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {React.cloneElement(children, {
          style: {
            ...children.props.style,
            borderColor: error ? '#dc2626' : (children.props.style?.borderColor || '#e2e8f0'),
            borderWidth: error ? '2px' : '1px',
            ...(error && { backgroundColor: '#fef2f2' })
          }
        })}
      </div>
      
      {error && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          marginTop: '6px',
          color: '#dc2626',
          fontSize: '0.8rem'
        }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      
      {helpText && !error && (
        <p style={{ 
          margin: '6px 0 0', 
          color: '#64748b', 
          fontSize: '0.8rem',
          lineHeight: '1.4'
        }}>
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormField;
