import React from 'react';
import { Empty, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  description?: string;
  image?: React.ReactNode;
  actionText?: string;
  actionPath?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  description = '暂无数据',
  image,
  actionText,
  actionPath,
  onAction,
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionPath) {
      navigate(actionPath);
    }
  };

  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <Empty
        description={description}
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
      >
        {actionText && (
          <Button type="primary" onClick={handleAction}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
