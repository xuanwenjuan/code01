import { Modal, Form, FormProps } from 'antd'
import { ModalProps } from 'antd/es/modal'

interface CommonModalProps extends Omit<ModalProps, 'onOk' | 'open'> {
  visible: boolean
  title: string
  onCancel: () => void
  onOk?: () => Promise<void> | void
  formProps?: FormProps
  children: React.ReactNode
  width?: number | string
  confirmLoading?: boolean
}

export default function CommonModal({
  visible,
  title,
  onCancel,
  onOk,
  formProps,
  children,
  width = 600,
  confirmLoading = false,
  ...restProps
}: CommonModalProps) {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      width={width}
      confirmLoading={confirmLoading}
      destroyOnClose
      maskClosable={false}
      {...restProps}
    >
      {formProps ? (
        <Form {...formProps} layout="vertical">
          {children}
        </Form>
      ) : (
        children
      )}
    </Modal>
  )
}
