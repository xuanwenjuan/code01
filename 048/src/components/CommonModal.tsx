import { Modal, ModalProps } from 'antd'
import { ReactNode } from 'react'

interface CommonModalProps extends Omit<ModalProps, 'onOk'> {
  title: string
  open: boolean
  onCancel: () => void
  onOk?: () => void | Promise<void>
  children: ReactNode
  width?: number | string
  okText?: string
  cancelText?: string
}

export const CommonModal = ({
  title,
  open,
  onCancel,
  onOk,
  children,
  width = 600,
  okText = '确定',
  cancelText = '取消',
  ...rest
}: CommonModalProps) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      width={width}
      okText={okText}
      cancelText={cancelText}
      destroyOnClose
      {...rest}
    >
      {children}
    </Modal>
  )
}
