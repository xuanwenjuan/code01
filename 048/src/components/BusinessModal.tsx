import { Modal, Form, FormProps, ModalProps } from 'antd'
import { ReactNode, useEffect } from 'react'

interface BusinessModalProps<T = unknown> extends Omit<ModalProps, 'onOk' | 'onCancel'> {
  title: string
  open: boolean
  onCancel: () => void
  onOk: (values: T) => void | Promise<void>
  children: ReactNode
  width?: number | string
  initialValues?: Partial<T>
  formProps?: Omit<FormProps<T>, 'form' | 'initialValues'>
  modalProps?: Partial<ModalProps>
}

export function BusinessModal<T = Record<string, unknown>>({
  title,
  open,
  onCancel,
  onOk,
  children,
  width = 720,
  initialValues,
  formProps,
  modalProps,
}: BusinessModalProps<T>) {
  const [form] = Form.useForm<T>()

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues as T)
      } else {
        form.resetFields()
      }
    }
  }, [open, initialValues, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      await onOk(values)
      form.resetFields()
    } catch {
    }
  }

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={width}
      destroyOnClose
      {...modalProps}
    >
      <Form<T> form={form} layout="vertical" {...formProps}>
        {children}
      </Form>
    </Modal>
  )
}
