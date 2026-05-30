import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Tree,
  Table,
  Input,
  Select,
  Tag,
  Avatar,
  Badge,
  Space,
  Button,
  Empty,
  Skeleton
} from 'antd'
import {
  TeamOutlined,
  UserOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { useAppStore } from '@/store'
import type { Employee, Department } from '@/types'
import styles from './Organization.module.css'

const { Search } = Input
const { Option } = Select

const Organization = () => {
  const [selectedDept, setSelectedDept] = useState<string[]>([])
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  const { departments, employees, setLoading, loading } = useAppStore()

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const countEmployees = useCallback((deptId: string): number => {
    const dept = departments.find(d => d.id === deptId)
    if (!dept) return 0

    let count = employees.filter(e => e.departmentId === deptId).length
    dept.children?.forEach(childId => {
      count += countEmployees(childId)
    })
    return count
  }, [departments, employees])

  const buildTreeData = useCallback((depts: Department[]): any[] => {
    return depts.map(dept => ({
      title: (
        <Space>
          <span>{dept.name}</span>
          <Tag color="blue" size="small">{countEmployees(dept.id)}人</Tag>
        </Space>
      ),
      key: dept.id,
      children: dept.children ? buildTreeData(departments.filter(d => dept.children?.includes(d.id))) : undefined
    }))
  }, [departments, countEmployees])

  const treeData = useMemo(() => buildTreeData(departments), [buildTreeData, departments])

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    vacation: employees.filter(e => e.status === 'vacation').length,
    currentDept: selectedDept.length > 0
      ? employees.filter(e => selectedDept.includes(e.departmentId)).length
      : employees.length
  }), [employees, selectedDept])

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesDept = selectedDept.length === 0 || selectedDept.includes(emp.departmentId)
      const matchesSearch = emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchText.toLowerCase())
      const matchesStatus = filterStatus === 'all' || emp.status === filterStatus
      return matchesDept && matchesSearch && matchesStatus
    })
  }, [employees, selectedDept, searchText, filterStatus])

  const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
    active: { color: 'success', text: '在职', icon: <CheckCircleOutlined /> },
    vacation: { color: 'warning', text: '休假', icon: <ClockCircleOutlined /> },
    resigned: { color: 'error', text: '离职', icon: <CloseCircleOutlined /> }
  }

  const columns = [
    {
      title: '员工',
      key: 'employee',
      width: 200,
      render: (_: any, record: Employee) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div>{record.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.position}</div>
          </div>
        </Space>
      )
    },
    {
      title: '工号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      width: 120
    },
    {
      title: '部门',
      key: 'department',
      width: 150,
      render: (_: any, record: Employee) =>
        departments.find(d => d.id === record.departmentId)?.name || '-'
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: Employee) => (
        <Tag color={statusConfig[record.status].color} icon={statusConfig[record.status].icon}>
          {statusConfig[record.status].text}
        </Tag>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130
    }
  ]

  return (
    <div className={styles.container}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 1, width: '100%' }} />
            ) : (
              <Statistic
                title="总人数"
                value={stats.total}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 1, width: '100%' }} />
            ) : (
              <Statistic
                title="在职"
                value={stats.active}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 1, width: '100%' }} />
            ) : (
              <Statistic
                title="休假"
                value={stats.vacation}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 1, width: '100%' }} />
            ) : (
              <Statistic
                title="当前部门"
                value={stats.currentDept}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={6}>
          <Card title="组织架构" className={styles.treeCard}>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : (
              <Tree
                treeData={treeData}
                selectedKeys={selectedDept}
                onSelect={(keys) => setSelectedDept(keys as string[])}
                showLine
                defaultExpandAll
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={18}>
          <Card
            title="员工列表"
            extra={
              <Space>
                <Search
                  placeholder="搜索员工"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="middle"
                  style={{ width: 240 }}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: 120 }}
                  allowClear
                >
                  <Option value="all">全部状态</Option>
                  <Option value="active">在职</Option>
                  <Option value="vacation">休假</Option>
                  <Option value="resigned">离职</Option>
                </Select>
              </Space>
            }
          >
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : filteredEmployees.length === 0 ? (
              <Empty description="暂无员工数据" style={{ padding: '60px 0' }} />
            ) : (
              <Table
                columns={columns}
                dataSource={filteredEmployees}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条`
                }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Organization
