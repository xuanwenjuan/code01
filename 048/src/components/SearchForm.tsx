import { Form, Row, Col, Button, FormProps, Input, Select, DatePicker } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { ReactNode } from 'react'

interface SearchFormProps<T = unknown> {
  onSearch: (values: T) => void
  onReset?: () => void
  children: ReactNode
  formProps?: Omit<FormProps<T>, 'form'>
  showExtraButtons?: ReactNode
}

export function SearchForm<T = Record<string, unknown>>({
  onSearch,
  onReset,
  children,
  formProps,
  showExtraButtons,
}: SearchFormProps<T>) {
  const [form] = Form.useForm<T>()

  const handleSearch = () => {
    const values = form.getFieldsValue()
    onSearch(values)
  }

  const handleReset = () => {
    form.resetFields()
    onReset?.()
  }

  return (
    <Form<T>
      form={form}
      layout="inline"
      {...formProps}
      style={{ marginBottom: 16, ...formProps?.style }}
    >
      <Row gutter={[16, 16]} align="bottom" style={{ width: '100%' }}>
        {children}
        <Col>
          <Form.Item>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              style={{ marginRight: 8 }}
            >
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            {showExtraButtons}
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

SearchForm.Input = function SearchFormInput(props: {
  name: string
  label?: string
  placeholder?: string
  [key: string]: unknown
}) {
  const { name, label, placeholder, ...rest } = props
  return (
    <Form.Item name={name} label={label}>
      <Input placeholder={placeholder || `请输入${label}`} {...rest} />
    </Form.Item>
  )
}

SearchForm.Select = function SearchFormSelect(props: {
  name: string
  label?: string
  placeholder?: string
  options: { label: string; value: string | number }[]
  [key: string]: unknown
}) {
  const { name, label, placeholder, options, ...rest } = props
  return (
    <Form.Item name={name} label={label}>
      <Select
        style={{ width: 140 }}
        placeholder={placeholder || `请选择${label}`}
        allowClear
        options={options}
        {...rest}
      />
    </Form.Item>
  )
}

SearchForm.DatePicker = function SearchFormDatePicker(props: {
  name: string
  label?: string
  placeholder?: string
  [key: string]: unknown
}) {
  const { name, label, placeholder, ...rest } = props
  return (
    <Form.Item name={name} label={label}>
      <DatePicker style={{ width: 140 }} placeholder={placeholder || `请选择${label}`} {...rest} />
    </Form.Item>
  )
}
