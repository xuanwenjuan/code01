import React from 'react';
import { ModalProps } from '@/types';

const Modal: React.FC<ModalProps> = ({ title, visible, onClose, onConfirm, children, width = '500px' }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">{children}</div>
        {onConfirm && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>取消</button>
            <button className="btn btn-primary" onClick={onConfirm}>确认</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;