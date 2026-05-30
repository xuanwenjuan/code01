import React from 'react'
import { Modal, Form, FormProps, Input, Select, InputNumber, Switch, Row, Col } from 'antd'
import { ModalFormConfig } from '@/types'

interface ModalFormProps<T = Record<string, unknown>> {
  open: boolean
  title: string
  onCancel: () => void
  onOk: (values: T) => void | Promise<void>
  initialValues?: T
  children?: React.ReactNode
  width?: number | string
  okText?: string
  cancelText?: string
  formProps?: Omit<FormProps<T>, 'form' | 'initialValues'>
  config?: ModalFormConfig<T>
  col?: number
}

function renderField<T>(field: ModalFormConfig<T>['fields'][0]) {
  const placeholder = field.placeholder || `请输入${field.label}`

  switch (field.type) {
    case 'input':
      return <Input placeholder={placeholder} />
    case 'number':
      return <InputNumber placeholder={placeholder} style={{ width: '100%' }} />
    case 'select':
      return <Select placeholder={placeholder} options={field.options} />
    case 'switch':
      return <Switch checkedChildren="是" unCheckedChildren="否" />
    case 'textarea':
      return <Input.TextArea placeholder={placeholder} rows={4} />
    default:
      return <Input placeholder={placeholder} />
  }
}

function ModalForm<T = Record<string, unknown>>({
  open,
  title,
  onCancel,
  onOk,
  initialValues,
  children,
  width = 600,
  okText = '确定',
  cancelText = '取消',
  formProps = {},
  config,
  col = 1,
}: ModalFormProps<T>) {
  const [form] = Form.useForm<T>()
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues)
    } else if (!open) {
      form.resetFields()
    }
  }, [open, initialValues, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await onOk(values)
      setLoading(false)
      onCancel()
    } catch (error) {
      setLoading(false)
    }
  }

  const renderFieldsByConfig = () => {
    if (!config) return null

    const fields = config.fields.map((field) => {
      const valueProps = field.type === 'switch' ? { valuePropName: 'checked' } : {}

      return (
        <Col xs={24} sm={24 / col} key={field.name}>
          <Form.Item<T>
            name={field.name as keyof T}
            label={field.label}
            rules={field.rules}
            {...valueProps}
          >
            {renderField<T>(field)}
          </Form.Item>
        </Col>
      )
    })

    return <Row gutter={16}>{fields}</Row>
  }

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText={okText}
      cancelText={cancelText}
      width={width}
      destroyOnClose
    >
      <Form<T> form={form} layout="vertical" initialValues={initialValues} {...formProps}>
        {config ? renderFieldsByConfig() : children}
      </Form>
    </Modal>
  )
}

export default ModalForm
