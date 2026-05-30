import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Tag, Button, Space, Avatar, Typography } from 'antd';
import {
  BellOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { mockBooks } from '@/mock/books';
import { RESTORATION_STATUS, USER_ROLES } from '@/types';
import './index.css';

const { Text, Paragraph } = Typography;

const mockUpdates = [
  {
    id: 1,
    type: 'status',
    bookId: 2,
    bookName: '本草纲目',
    message: '修复进度已更新至 65%',
    time: '刚刚',
    read: false,
    icon: <ToolOutlined />,
    color: 'blue'
  },
  {
    id: 2,
    type: 'complete',
    bookId: 3,
    bookName: '红楼梦手抄本',
    message: '修复完成，已入库保存',
    time: '2小时前',
    read: false,
    icon: <CheckCircleOutlined />,
    color: 'green'
  },
  {
    id: 3,
    type: 'new',
    bookId: 4,
    bookName: '永乐大典残卷',
    message: '新的修复案例已发布',
    time: '5小时前',
    read: true,
    icon: <BookOutlined />,
    color: 'purple'
  },
  {
    id: 4,
    type: 'status',
    bookId: 6,
    bookName: '康熙字典',
    message: '修复进度已更新至 40%',
    time: '1天前',
    read: true,
    icon: <ToolOutlined />,
    color: 'blue'
  },
  {
    id: 5,
    type: 'complete',
    bookId: 8,
    bookName: '敦煌遗书残卷',
    message: '修复完成，成功拼接碎片200余片',
    time: '3天前',
    read: true,
    icon: <CheckCircleOutlined />,
    color: 'green'
  }
];

const UpdateNotification = () => {
  const { userInfo } = useSelector((state) => state.user);
  const [updates, setUpdates] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let filteredUpdates = [...mockUpdates];
    
    if (userInfo?.role === USER_ROLES.RESTORER) {
      filteredUpdates = filteredUpdates.filter(
        (u) => u.type === 'new' || u.type === 'status'
      );
    } else if (userInfo?.role === USER_ROLES.ADMIN) {
      filteredUpdates = filteredUpdates;
    }
    
    setUpdates(filteredUpdates);
    setUnreadCount(filteredUpdates.filter((u) => !u.read).length);
  }, [userInfo]);

  const handleMarkAllRead = () => {
    setUpdates(updates.map((u) => ({ ...u, read: true })));
    setUnreadCount(0);
  };

  const menuItems = {
    items: [
      {
        key: 'header',
        label: (
          <div className="notification-header">
            <Space>
              <BellOutlined style={{ color: '#1890ff' }} />
              <span>修复案例更新提醒</span>
            </Space>
            {unreadCount > 0 && (
              <Button type="link" size="small" onClick={handleMarkAllRead}>
                全部已读
              </Button>
            )}
          </div>
        ),
        type: 'group'
      },
      {
        type: 'divider'
      },
      {
        key: 'list',
        label: (
          <List
            dataSource={updates.slice(0, 5)}
            renderItem={(item) => (
              <List.Item className="notification-item">
                <List.Item.Meta
                  avatar={
                    <div className={`notification-icon ${item.color}`}>
                      {item.icon}
                    </div>
                  }
                  title={
                    <Space>
                      <Text strong>{item.bookName}</Text>
                      {!item.read && <Badge status="processing" size="small" />}
                    </Space>
                  }
                  description={
                    <div>
                      <Paragraph ellipsis={{ rows: 1 }} style={{ margin: 0 }}>
                        {item.message}
                      </Paragraph>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined /> {item.time}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ),
        type: 'group'
      },
      {
        type: 'divider'
      },
      {
        key: 'footer',
        label: (
          <div className="notification-footer">
            <Text type="secondary">共 {updates.length} 条提醒</Text>
          </div>
        ),
        type: 'group'
      }
    ]
  };

  return (
    <Dropdown menu={menuItems} placement="bottomRight" trigger={['click']}>
      <div className="notification-trigger">
        <Badge count={unreadCount} offset={[0, 2]} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            className="notification-btn"
          />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default UpdateNotification;
