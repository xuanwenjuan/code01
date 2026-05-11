import React from 'react';
import { Modal } from 'antd';
import type { ModalProps } from 'antd';

interface CommonModalProps extends Omit<ModalProps, 'onOk'> {
  title: string;
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  children: React.ReactNode;
  confirmLoading?: boolean;
  width?: number | string;
}

const CommonModal: React.FC<CommonModalProps> = ({
  title,
  open,
  onClose,
  onConfirm,
  children,
  confirmLoading = false,
  width = 600,
  okText = '确定',
  cancelText = '取消',
  ...rest
}) => {
  const handleOk = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      width={width}
      okText={okText}
      cancelText={cancelText}
      maskClosable={false}
      destroyOnClose
      {...rest}
    >
      {children}
    </Modal>
  );
};

export default CommonModal;
