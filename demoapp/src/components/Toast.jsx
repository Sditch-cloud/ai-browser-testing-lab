import React, { useEffect } from 'react';
import './Toast.css';

export const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`} data-testid={`toast-${type}`} role="alert">
      <div className="toast-content">
        {type === 'success' && <span className="toast-icon">✓</span>}
        {type === 'error' && <span className="toast-icon">✕</span>}
        {type === 'info' && <span className="toast-icon">ℹ</span>}
        <span className="toast-message">{message}</span>
      </div>
      <button
        className="toast-close"
        onClick={onClose}
        data-testid="toast-close"
        aria-label="Close toast"
      >
        ×
      </button>
    </div>
  );
};
