import React from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <p className="confirm-message">{message}</p>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>
          {cancelText}
        </button>
        <button className="btn btn-danger" onClick={handleConfirm}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
