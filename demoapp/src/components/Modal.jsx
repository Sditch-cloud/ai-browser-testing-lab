import React from 'react';
import './Modal.css';

export const Modal = ({ isOpen, title, children, onClose, footer }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} data-testid="modal-overlay" />
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            data-testid="modal-close"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};
