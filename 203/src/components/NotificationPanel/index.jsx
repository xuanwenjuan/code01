import { useState, useEffect } from 'react'
import { Badge, Dropdown, List, Avatar, Button, message, Tag, Empty } from 'antd'
import { BellOutlined, CheckOutlined, GiftOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'
import './index.css'

const mockNotifications = [
  {
    id: 1,
    type: 'new_type',
    title: '新品活字上线',
    content: '新上线了12个复刻活字，来自《兰亭序》经典复刻',
    time: dayjs().subtract(1, 'hour').toISOString(),
    read: false,
    link: '/types?category=复刻活字'
  },
  {
    id: 2,
    type: 'new_work',
    title: '新作品发布',
    content: '传承人李大师发布了新作品《道德经》木活字印刷版',
    time: dayjs().subtract(3, 'hour').toISOString(),
    read: false,
    link: '/works'
  },
  {
    id: 3,
    type: 'update',
    title: '技艺教程更新',
    content: '新增了梨木选材与雕刻工艺的详细教程视频',
    time: dayjs().subtract(1, 'day').toISOString(),
    read: true,
    link: '/technique'
  },
  {
    id: 4,
    type: 'activity',
    title: '线上活动通知',
    content: '木活字印刷知识竞赛即将开始，参与赢取非遗周边',
    time: dayjs().subtract(2, 'day').toISOString(),
    read: true,
    link: '/'
  }
]

const NotificationPanel = () => {
  const { currentUser } = useSelector(state => state.user)
  const [notifications, setNotifications] = useState([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setNotifications(mockNotifications)
    }
  }, [currentUser])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleItemClick = (item) => {
    if (!item.read) {
      setNotifications(prev => prev.map(n =>
        n.id === item.id ? { ...n, read: true } : n
      ))
    }
    setVisible(false)
    message.success('通知已标记为已读')
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    message.success('已全部标记为已读')
  }

  const getTypeIcon = (type) => {
    const iconMap = {
      new_type: <GiftOutlined style={{ color: '#52c41a' }} />,
      new_work: <GiftOutlined style={{ color: '#1890ff' }} />,
      update: <GiftOutlined style={{ color: '#722ed1' }} />,
      activity: <GiftOutlined style={{ color: '#fa8c16' }} />
    }
    return iconMap[type] || <BellOutlined />
  }

  const getTypeTag = (type) => {
    const tagMap = {
      new_type: { color: 'green', text: '新品' },
      new_work: { color: 'blue', text: '作品' },
      update: { color: 'purple', text: '更新' },
      activity: { color: 'orange', text: '活动' }
    }
    return tagMap[type] || { color: 'default', text: '通知' }
  }

  const menu = {
    items: [
      {
        key: '1',
        label: (
          <div className="notification-dropdown">
            <div className="notification-header">
              <span style={{ fontWeight: 600 }}>消息通知</span>
              {unreadCount > 0 && (
                <Button
                  type="link"
                  size="small"
                  onClick={handleMarkAllRead}
                  icon={<CheckOutlined />}
                >
                  全部已读
                </Button>
              )}
            </div>
            {notifications.length > 0 ? (
              <List
                dataSource={notifications}
                renderItem={(item) => {
                  const typeTag = getTypeTag(item.type)
                  return (
                    <List.Item
                      className={`notification-item ${!item.read ? 'unread' : ''}`}
                      onClick={() => handleItemClick(item)}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={getTypeIcon(item.type)} />}
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{item.title}</span>
                            <Tag color={typeTag.color} style={{ margin: 0 }}>
                              {typeTag.text}
                            </Tag>
                          </div>
                        }
                        description={
                          <div>
                            <div style={{ color: '#666', fontSize: '13px' }}>
                              {item.content}
                            </div>
                            <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                              {dayjs(item.time).fromNow()}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            ) : (
              <Empty description="暂无通知" style={{ padding: '24px 0' }} />
            )}
          </div>
        )
      }
    ]
  }

  if (!currentUser) return null

  return (
    <Dropdown
      menu={menu}
      trigger={['click']}
      open={visible}
      onOpenChange={setVisible}
      placement="bottomRight"
      overlayClassName="notification-overlay"
    >
      <Badge count={unreadCount} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: '18px' }} />}
          className="notification-btn"
        />
      </Badge>
    </Dropdown>
  )
}

export default NotificationPanel
