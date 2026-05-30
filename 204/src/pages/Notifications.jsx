import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { List, Empty, Button, Tag, Tabs, Badge, Card, message } from 'antd'
import { BellOutlined, CheckCircleOutlined, CloseCircleOutlined, CommentOutlined, LikeOutlined, UserOutlined, ReadOutlined } from '@ant-design/icons'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../store/slices/dataSlice'
import LoadingState from '../components/LoadingState'

const typeConfig = {
  review: {
    icon: <BellOutlined />,
    color: 'blue',
    label: '审核通知'
  },
  comment: {
    icon: <CommentOutlined />,
    color: 'green',
    label: '评论通知'
  },
  like: {
    icon: <LikeOutlined />,
    color: 'red',
    label: '点赞通知'
  },
  follow: {
    icon: <UserOutlined />,
    color: 'purple',
    label: '关注通知'
  }
}

const Notifications = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { notifications, loading } = useSelector(state => state.data)
  const currentUser = useSelector(state => state.user.currentUser)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchNotifications(currentUser.id))
    }
  }, [dispatch, currentUser])

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id))
  }

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead(currentUser.id))
    message.success('全部标记为已读')
  }

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab)

  const unreadCount = notifications.filter(n => !n.read).length

  const getTabItems = () => {
    const items = [
      { key: 'all', label: `全部 (${notifications.length})` }
    ]
    Object.keys(typeConfig).forEach(type => {
      const count = notifications.filter(n => n.type === type).length
      if (count > 0) {
        items.push({ key: type, label: `${typeConfig[type].label} (${count})` })
      }
    })
    return items
  }

  if (loading.notifications) {
    return <LoadingState />
  }

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Empty description="请先登录查看通知" />
        <Button type="primary" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>
          去登录
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>消息通知</h1>
              <p>
                共 {notifications.length} 条消息
                {unreadCount > 0 && (
                  <span style={{ marginLeft: 12 }}>
                    <Badge count={unreadCount} /> 条未读
                  </span>
                )}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button 
                type="primary" 
                icon={<ReadOutlined />}
                onClick={handleMarkAllRead}
              >
                全部已读
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={getTabItems()}
          />
          
          {filteredNotifications.length > 0 ? (
            <List
              dataSource={[...filteredNotifications].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))}
              renderItem={notification => (
                <List.Item
                  key={notification.id}
                  onClick={() => handleMarkRead(notification.id)}
                  style={{
                    background: notification.read ? 'transparent' : '#f6ffed',
                    borderRadius: 8,
                    marginBottom: 8,
                    padding: '12px 16px',
                    cursor: 'pointer',
                    border: notification.read ? '1px solid transparent' : '1px solid #b7eb8f'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: `${typeConfig[notification.type]?.color || '#999'}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: typeConfig[notification.type]?.color || '#999',
                        fontSize: 20
                      }}>
                        {typeConfig[notification.type]?.icon}
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {notification.title}
                        {!notification.read && (
                          <Badge status="processing" color="green" />
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ color: '#666', marginBottom: 4, lineHeight: 1.6 }}>
                          {notification.content}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Tag color={typeConfig[notification.type]?.color}>
                            {typeConfig[notification.type]?.label}
                          </Tag>
                          <span style={{ color: '#999', fontSize: 12 }}>
                            {notification.createTime}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="暂无通知消息" style={{ padding: '60px 0' }} />
          )}
        </Card>

        <Card style={{ marginTop: 24 }} title="通知说明">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>审核通过</div>
                <div style={{ color: '#666', fontSize: 13 }}>您的作品/教程通过管理员审核，已在平台展示</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>审核未通过</div>
                <div style={{ color: '#666', fontSize: 13 }}>您的作品/教程未通过审核，请根据反馈修改后重新提交</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <CommentOutlined style={{ color: '#1890ff', fontSize: 20, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>评论通知</div>
                <div style={{ color: '#666', fontSize: 13 }}>您的作品/教程收到新的评论回复</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <LikeOutlined style={{ color: '#f5222d', fontSize: 20, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>点赞通知</div>
                <div style={{ color: '#666', fontSize: 13 }}>您的作品获得了新的点赞</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Notifications
