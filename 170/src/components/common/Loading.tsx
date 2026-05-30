import React from 'react';
import { Spin } from 'antd';

interface LoadingProps {
  text?: string;
  size?: 'small' | 'default' | 'large';
}

const Loading: React.FC<LoadingProps> = ({ text = '加载中...', size = 'large' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 0',
      }}
    >
      <Spin size={size} />
      <p style={{ marginTop: '16px', color: '#999' }}>{text}</p>
    </div>
  );
};

export default Loading;
