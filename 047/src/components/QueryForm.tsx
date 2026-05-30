import React from 'react'
import { Form, Input, Select, Button, Row, Col, DatePicker, Space } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { QueryFormField } from '@/types'

const { RangePicker } = DatePicker

interface QueryFormProps<T = Record<string, unknown>> {
  fields: QueryFormField[]
  onSearch: (values: T) => void
  onReset?: () => void
  initialValues?: T
  col?: number
}

function QueryForm<T = Record<string, unknown>>({
  fields,
  onSearch,
  onReset,
  initialValues,
  col = 3,
}: QueryFormProps<T>) {
  const [form] = Form.useForm<T>()

  const handleSearch = () => {
    form.validateFields().then((values) => {
      onSearch(values)
    })
  }

  const handleReset = () => {
    form.resetFields()
    onReset?.()
  }

  const renderField = (field: QueryFormField) => {
    const placeholder = field.placeholder || `请输入${field.label}`

    switch (field.type) {
      case 'input':
        return <Input placeholder={placeholder} allowClear />
      case 'select':
        return <Select placeholder={placeholder} options={field.options} allowClear />
      case 'date':
        return <DatePicker placeholder={placeholder} style={{ width: '100%' }} />
      case 'dateRange':
        return <RangePicker placeholder={[placeholder, placeholder]} style={{ width: '100%' }} />
      default:
        return <Input placeholder={placeholder} allowClear />
    }
  }

  return (
    <Form<T>
      form={form}
      layout="inline"
      initialValues={initialValues}
      style={{ marginBottom: 16 }}
    >
      <Row gutter={16} align="bottom">
        {fields.map((field) => (
          <Col
            key={field.name}
            xs={24}
            sm={12}
            md={8}
            lg={24 / col}
            style={{ marginBottom: 12 }}
          >
            <Form.Item<T>
              name={field.name as keyof T}
              label={field.label}
              style={{ marginBottom: 0 }}
            >
              {renderField(field)}
            </Form.Item>
          </Col>
        ))}
        <Col xs={24} sm={24} md="flex" style={{ marginBottom: 12, marginLeft: 'auto' }}>
          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  )
}

export default QueryForm
