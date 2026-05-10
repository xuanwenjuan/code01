import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children, footer }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (): void => {
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal" onClick={handleModalClick}>
        <div className="modal-header">
          <h3 className="modal-title" id="modal-title">{title}</h3>
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="关闭"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
