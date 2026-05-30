import { Dropdown, List, Badge, Typography, Button, Space } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store'
import type { SystemNotification } from '@/types'

const { Text, Paragraph } = Typography

const getTypeColor = (type: SystemNotification['type']) => {
  switch (type) {
    case 'success':
      return 'green'
    case 'warning':
      return 'orange'
    case 'error':
      return 'red'
    default:
      return 'blue'
  }
}

const NotificationDropdown = ({ children }: { children: React.ReactNode }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppStore()

  const items = [
    {
      key: 'notifications',
      label: (
        <div style={{ width: 320 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>通知中心</Text>
            <Button type="link" size="small" onClick={() => markAllNotificationsAsRead()}>
              全部已读
            </Button>
          </div>
          <List
            dataSource={notifications.slice(0, 10)}
            renderItem={(item) => (
              <List.Item
                style={{ padding: '12px 16px', cursor: 'pointer' }}
                onClick={() => markNotificationAsRead(item.id)}
              >
                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge status={item.status === 'unread' ? 'processing' : 'default'}>
                      <Text strong style={{ color: getTypeColor(item.type) }}>
                        {item.title}
                      </Text>
                    </Badge>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.createdAt}
                    </Text>
                  </div>
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{ marginBottom: 0, fontSize: 13 }}
                    type="secondary"
                  >
                    {item.content}
                  </Paragraph>
                </Space>
              </List.Item>
            )}
          />
        </div>
      )
    }
  ]

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      {children}
    </Dropdown>
  )
}

export default NotificationDropdown
