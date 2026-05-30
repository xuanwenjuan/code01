import { Modal } from 'antd'
import type { ModalProps } from 'antd'

export interface CommonModalProps extends Omit<ModalProps, 'onCancel' | 'onOk'> {
  title: string
  open: boolean
  onCancel: () => void
  onOk?: () => void
  okText?: string
  cancelText?: string
  confirmLoading?: boolean
  showFooter?: boolean
  width?: number
  children: React.ReactNode
}

const CommonModal: React.FC<CommonModalProps> = ({
  title,
  open,
  onCancel,
  onOk,
  okText = '确认',
  cancelText = '取消',
  confirmLoading = false,
  showFooter = true,
  width = 600,
  children,
  ...rest
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      footer={showFooter ? undefined : null}
      width={width}
      destroyOnClose
      maskClosable={false}
      centered
      {...rest}
    >
      {children}
    </Modal>
  )
}

export default CommonModal
