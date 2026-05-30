import React, { useState } from 'react'
import {
  Table, Button, Space, Tag, Input, Select, message, Popconfirm
} from 'antd'
import { SearchOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { users as initialUsers } from '@/mock'

const { Option } = Select

function AdminUsers() {
  const [users, setUsers] = useState(initialUsers)
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.includes(searchText) || u.username.includes(searchText)
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleDelete = (id) => {
    setUsers(users.filter(u => u.id !== id))
    message.success('删除成功')
  }

  const handleToggleStatus = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const newStatus = u.status === 'active' ? 'inactive' : 'active'
        message.success(`用户已${newStatus === 'active' ? '启用' : '禁用'}`)
        return { ...u, status: newStatus }
      }
      return u
    }))
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ fontSize: 20 }} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.name}</div>
            <div style={{ color: '#999', fontSize: 12 }}>@{record.username}</div>
          </div>
        </Space>
      )
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '研究员'}
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
      key: 'phone'
    },
    {
      title: '机构',
      dataIndex: 'organization',
      key: 'organization',
      render: (text) => text || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '活跃' : '禁用'}
        </Tag>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.status === 'active' ? '禁用' : '启用'}
          </Button>
          <Popconfirm
            title="确定删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Space size="middle">
          <Input
            placeholder="搜索用户名称"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="角色筛选"
            style={{ width: 150 }}
            value={roleFilter || undefined}
            onChange={setRoleFilter}
            allowClear
          >
            <Option value="admin">管理员</Option>
            <Option value="user">研究员</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />
    </div>
  )
}

export default AdminUsers
