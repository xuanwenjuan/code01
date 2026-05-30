import { useEffect, useState, useMemo } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Avatar,
  Badge,
  Empty,
  Spin
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, FilterOutlined } from '@ant-design/icons'
import { Employee, EmployeePosition, EmployeeStatus, EmployeePositionMap, EmployeeStatusMap } from '@/types'
import { useEmployeeStore } from '@/stores'
import { mockApi } from '@/mock'
import CommonModal from '@/components/CommonModal'
import SearchForm, { SearchInput, SearchSelect } from '@/components/SearchForm'
import { useDebounce } from '@/hooks/useDebounce'

const { Option } = Select

const storeOptions = [
  { label: '中心广场店', value: '中心广场店' },
  { label: '大学城店', value: '大学城店' },
  { label: '科技园店', value: '科技园店' },
  { label: '步行街店', value: '步行街店' },
  { label: '高铁站店', value: '高铁站店' }
]

const positionOptions = Object.entries(EmployeePositionMap).map(([value, label]) => ({
  label,
  value
}))

const statusOptions = Object.entries(EmployeeStatusMap).map(([value, label]) => ({
  label,
  value
}))

interface FilterValues {
  name?: string
  position?: string
  status?: string
  storeName?: string
}

export default function EmployeeManagement() {
  const { employees, setEmployees, addEmployee, updateEmployee, deleteEmployee, updateEmployeeStatus } = useEmployeeStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const [submitLoading, setSubmitLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  const debouncedFilters = useDebounce(filters, 300)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await mockApi.getEmployees()
        if (employees.length === 0) setEmployees(data)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSearch = (values: FilterValues) => {
    setFilters(values)
  }

  const handleReset = () => {
    setFilters({})
    searchForm.resetFields()
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchSearch = !debouncedFilters.name || 
        employee.name.includes(debouncedFilters.name) || 
        employee.phone.includes(debouncedFilters.name)
      const matchPosition = !debouncedFilters.position || employee.position === debouncedFilters.position
      const matchStatus = !debouncedFilters.status || employee.status === debouncedFilters.status
      const matchStore = !debouncedFilters.storeName || employee.storeName === debouncedFilters.storeName
      return matchSearch && matchPosition && matchStatus && matchStore
    })
  }, [employees, debouncedFilters])

  const positionStats = useMemo(() => {
    const stats: Record<string, number> = {}
    employees.forEach((emp) => {
      stats[emp.position] = (stats[emp.position] || 0) + 1
    })
    return stats
  }, [employees])

  const columns = [
    {
      title: '员工信息',
      key: 'info',
      width: 200,
      render: (_: unknown, record: Employee) => (
        <Space>
          <Avatar size={40} icon={<UserOutlined />} src={record.avatar} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.phone}</div>
          </div>
        </Space>
      )
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName',
      width: 100,
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '门店',
      dataIndex: 'storeName',
      key: 'storeName',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: EmployeeStatus) => (
        <Badge
          status={status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning'}
          text={<Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange'}>{EmployeeStatusMap[status]}</Tag>}
        />
      )
    },
    {
      title: '入职日期',
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 120
    },
    {
      title: '排班',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule: string[]) => (
        <Space size={[0, 4]} wrap>
          {schedule.map((day, index) => (
            <Tag key={index} color="geekblue" style={{ margin: 2 }}>
              {day}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right' as const,
      render: (_: unknown, record: Employee) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Select
            size="small"
            value={record.status}
            style={{ width: 80 }}
            onChange={(value: EmployeeStatus) => {
              updateEmployeeStatus(record.id, value)
              message.success('状态已更新')
            }}
          >
            {statusOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
          <Popconfirm
            title="确定删除此员工？"
            onConfirm={() => {
              deleteEmployee(record.id)
              message.success('删除成功')
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const handleAdd = () => {
    setEditingEmployee(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: Employee) => {
    setEditingEmployee(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true)
      const values = await form.validateFields()
      const now = new Date().toISOString()

      if (editingEmployee) {
        updateEmployee({
          ...editingEmployee,
          ...values,
          positionName: EmployeePositionMap[values.position],
          statusName: EmployeeStatusMap[values.status]
        })
        message.success('更新成功')
      } else {
        addEmployee({
          id: Date.now().toString(),
          ...values,
          positionName: EmployeePositionMap[values.position],
          statusName: EmployeeStatusMap[values.status],
          schedule: ['周一', '周二', '周三', '周四', '周五'],
          createTime: now
        })
        message.success('添加成功')
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitLoading(false)
    }
  }

  const storeOptions = useMemo(() => {
    const stores = new Set(employees.map((emp) => emp.storeName))
    return Array.from(stores).map((name) => ({ label: name, value: name }))
  }, [employees])

  const handlePositionTagClick = (position: string) => {
    const newPosition = filters.position === position ? undefined : position
    setFilters((prev) => ({ ...prev, position: newPosition }))
    searchForm.setFieldsValue({ position: newPosition })
  }

  return (
    <div>
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Tag icon={<FilterOutlined />} color="cyan">
            按岗位筛选：
          </Tag>
          {positionOptions.map((opt) => (
            <Tag
              key={opt.value}
              color={filters.position === opt.value ? 'blue' : 'default'}
              onClick={() => handlePositionTagClick(opt.value)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              {opt.label} ({positionStats[opt.value] || 0})
            </Tag>
          ))}
        </Space>

        <SearchForm onSearch={handleSearch} onReset={handleReset}>
          <SearchInput name="name" placeholder="搜索姓名/电话" />
          <SearchSelect name="position" placeholder="选择职位" options={positionOptions} />
          <SearchSelect name="status" placeholder="选择状态" options={statusOptions} />
          <SearchSelect name="storeName" placeholder="选择门店" options={storeOptions} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加员工
          </Button>
        </SearchForm>

        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
          loading={
            loading ? {
              indicator: <Spin size="large" />,
              tip: '数据加载中...'
            } : false
          }
          locale={{
            emptyText: <Empty description="暂无员工数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          }}
        />
      </Card>

      <CommonModal
        visible={isModalOpen}
        title={editingEmployee ? '编辑员工' : '添加员工'}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        formProps={{ form }}
      >
        <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="电话"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>
        <Form.Item name="position" label="职位" rules={[{ required: true, message: '请选择职位' }]}>
          <Select placeholder="请选择职位">
            {positionOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="storeName" label="所属门店" rules={[{ required: true, message: '请选择门店' }]}>
          <Select placeholder="请选择门店">
            {storeOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder="请选择状态">
            {statusOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="hireDate" label="入职日期" rules={[{ required: true, message: '请选择入职日期' }]}>
          <Input type="date" />
        </Form.Item>
      </CommonModal>
    </div>
  )
}
