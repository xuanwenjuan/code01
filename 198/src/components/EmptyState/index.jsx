import React from 'react';
import { Empty, Button } from 'antd';
import { FileTextOutlined, SearchOutlined, HeartOutlined } from '@ant-design/icons';
import './index.css';

const iconMap = {
  default: <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />,
  search: <SearchOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />,
  favorite: <HeartOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
};

const EmptyState = ({ 
  description = '暂无数据', 
  type = 'default', 
  action, 
  actionText 
}) => {
  return (
    <div className="empty-state-container">
      <Empty
        image={iconMap[type] || Empty.PRESENTED_IMAGE_SIMPLE}
        description={description}
      >
        {action && (
          <Button type="primary" onClick={action}>
            {actionText || '去添加'}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
