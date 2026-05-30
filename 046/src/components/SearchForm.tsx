import { Form, Input, Select, Button, Space } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { FormProps } from 'antd/es/form'

interface SearchFormProps extends Omit<FormProps, 'onFinish'> {
  onSearch: (values: any) => void
  onReset?: () => void
  children: React.ReactNode
  showReset?: boolean
}

export default function SearchForm({
  onSearch,
  onReset,
  children,
  showReset = true,
  ...formProps
}: SearchFormProps) {
  const [form] = Form.useForm()

  const handleReset = () => {
    form.resetFields()
    onReset?.()
  }

  const handleSearch = () => {
    form.validateFields().then((values) => {
      onSearch(values)
    })
  }

  return (
    <Form
      form={form}
      layout="inline"
      style={{ marginBottom: 16 }}
      {...formProps}
    >
      <Space wrap size="small">
        {children}
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
        {showReset && (
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        )}
      </Space>
    </Form>
  )
}

export const SearchInput = ({ name, label, placeholder }: { name: string; label?: string; placeholder?: string }) => (
  <Form.Item name={name} label={label}>
    <Input placeholder={placeholder || '请输入'} style={{ width: 200 }} allowClear />
  </Form.Item>
)

export const SearchSelect = ({
  name,
  label,
  placeholder,
  options,
  allowClear = true
}: {
  name: string
  label?: string
  placeholder?: string
  options: { label: string; value: string }[]
  allowClear?: boolean
}) => (
  <Form.Item name={name} label={label}>
    <Select placeholder={placeholder || '请选择'} style={{ width: 150 }} options={options} allowClear={allowClear} />
  </Form.Item>
)
