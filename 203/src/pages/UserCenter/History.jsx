import { useState, useMemo } from 'react'
import {
  Row, Col, Typography, Card, Avatar, Button, Menu, Tag, List,
  Empty, Popconfirm, Checkbox, DatePicker, Select, Space, message
} from 'antd'
import {
  HistoryOutlined, DeleteOutlined, UserOutlined, HeartOutlined,
  ClockCircleOutlined, CheckOutlined, CloseOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearHistory, removeFromHistory, logout } from '@/store/slices/userSlice'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const History = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { currentUser, role, history } = useSelector(state => state.user)

  const [selectedItems, setSelectedItems] = useState([])
  const [dateRange, setDateRange] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectAll, setSelectAll] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const handleItemClick = (item) => {
    const path = item.type === 'type' ? '/types' : item.type === 'work' ? '/works' : '/technique'
    navigate(`${path}/${item.id}`)
  }

  const handleRemove = (e, item) => {
    e.stopPropagation()
    dispatch(removeFromHistory({ id: item.id, type: item.type }))
    setSelectedItems(prev => prev.filter(id => id !== `${item.type}-${item.id}`))
    message.success('删除成功')
  }

  const handleClearAll = () => {
    dispatch(clearHistory())
    setSelectedItems([])
    setSelectAll(false)
    message.success('已清空所有浏览记录')
  }

  const handleSelectItem = (e, item) => {
    e.stopPropagation()
    const itemId = `${item.type}-${item.id}`
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      }
      return [...prev, itemId]
    })
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([])
      setSelectAll(false)
    } else {
      const allIds = filteredHistory.map(item => `${item.type}-${item.id}`)
      setSelectedItems(allIds)
      setSelectAll(true)
    }
  }

  const handleBatchDelete = () => {
    if (selectedItems.length === 0) {
      message.warning('请先选择要删除的记录')
      return
    }
    selectedItems.forEach(itemId => {
      const [type, id] = itemId.split('-')
      dispatch(removeFromHistory({ id: Number(id), type }))
    })
    setSelectedItems([])
    setSelectAll(false)
    message.success(`已删除 ${selectedItems.length} 条记录`)
  }

  const filteredHistory = useMemo(() => {
    let result = [...history]

    if (typeFilter !== 'all') {
      result = result.filter(item => item.type === typeFilter)
    }

    if (dateRange && dateRange.length === 2) {
      const start = dayjs(dateRange[0]).startOf('day')
      const end = dayjs(dateRange[1]).endOf('day')
      result = result.filter(item => {
        const itemTime = dayjs(item.timestamp || item.time)
        return itemTime.isAfter(start) && itemTime.isBefore(end)
      })
    }

    return result.sort((a, b) => dayjs(b.timestamp || b.time) - dayjs(a.timestamp || a.time))
  }, [history, typeFilter, dateRange])

  const menuItems = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/profile')
    },
    {
      key: '/profile/favorites',
      icon: <HeartOutlined />,
      label: '我的收藏',
      onClick: () => navigate('/profile/favorites')
    },
    {
      key: '/profile/history',
      icon: <HistoryOutlined />,
      label: `浏览记录 (${history.length})`,
      onClick: () => navigate('/profile/history')
    }
  ]

  const getTypeTag = (type) => {
    const typeMap = {
      type: { color: 'blue', text: '活字' },
      work: { color: 'green', text: '作品' },
      process: { color: 'orange', text: '工艺' }
    }
    return typeMap[type] || { color: 'default', text: '其他' }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={6}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar size={100} src={currentUser?.avatar} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: '16px', marginBottom: '8px' }}>
                {currentUser?.name}
              </Title>
              <Tag color={role === 'admin' ? 'red' : 'blue'}>
                {role === 'admin' ? '平台管理员' : '木活字印刷研究者'}
              </Tag>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{ border: 'none' }}
            />
            <Button
              danger
              block
              icon={<DeleteOutlined />}
              onClick={handleLogout}
              style={{ marginTop: '16px' }}
            >
              退出登录
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={18}>
          <Card
            title="浏览记录"
            extra={
              <Space>
                {history.length > 0 && (
                  <Popconfirm
                    title="确定要清空所有浏览记录吗？"
                    onConfirm={handleClearAll}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button danger size="small" icon={<DeleteOutlined />}>
                      清空记录
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            }
          >
            {history.length > 0 ? (
              <>
                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                  >
                    全选
                  </Checkbox>

                  <Select
                    value={typeFilter}
                    onChange={setTypeFilter}
                    style={{ width: 120 }}
                    size="small"
                  >
                    <Option value="all">全部类型</Option>
                    <Option value="type">活字</Option>
                    <Option value="work">作品</Option>
                    <Option value="process">工艺</Option>
                  </Select>

                  <RangePicker
                    size="small"
                    onChange={setDateRange}
                    placeholder={['开始日期', '结束日期']}
                  />

                  <Button
                    type="primary"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={handleBatchDelete}
                    disabled={selectedItems.length === 0}
                  >
                    批量删除 ({selectedItems.length})
                  </Button>
                </div>

                {filteredHistory.length > 0 ? (
                  <List
                    dataSource={filteredHistory}
                    renderItem={item => {
                      const typeInfo = getTypeTag(item.type)
                      const itemId = `${item.type}-${item.id}`
                      const isSelected = selectedItems.includes(itemId)

                      return (
                        <List.Item
                          actions={[
                            <Popconfirm
                              key="delete"
                              title="删除这条记录？"
                              onConfirm={(e) => handleRemove(e, item)}
                              okText="确定"
                              cancelText="取消"
                            >
                              <Button type="text" danger size="small" icon={<DeleteOutlined />}>
                                删除
                              </Button>
                            </Popconfirm>
                          ]}
                          style={{
                            cursor: 'pointer',
                            background: isSelected ? '#e6f7ff' : 'transparent',
                            borderRadius: '8px',
                            padding: '12px 16px !important'
                          }}
                          onClick={() => handleItemClick(item)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleSelectItem(e, item)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginRight: '12px' }}
                          />
                          <List.Item.Meta
                            avatar={<Avatar src={item.image} size={48} />}
                            title={
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Tag color={typeInfo.color}>
                                  {typeInfo.text}
                                </Tag>
                                <span>{item.title || item.name}</span>
                              </div>
                            }
                            description={
                              <span style={{ color: '#999', fontSize: '13px' }}>
                                <ClockCircleOutlined style={{ marginRight: '4px' }} />
                                {dayjs(item.timestamp || item.time).format('YYYY-MM-DD HH:mm')}
                              </span>
                            }
                          />
                        </List.Item>
                      )
                    }}
                  />
                ) : (
                  <Empty description="没有符合条件的浏览记录" />
                )}
              </>
            ) : (
              <Empty description="暂无浏览记录" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default History
