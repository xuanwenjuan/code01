import React from 'react';
import { Spin, Space } from 'antd';
import './index.css';

const Loading = ({ text = '加载中...', size = 'large', fullscreen = false }) => {
  return (
    <div className={`loading-container ${fullscreen ? 'fullscreen' : ''}`}>
      <Space direction="vertical" align="center">
        <Spin size={size} />
        {text && <span className="loading-text">{text}</span>}
      </Space>
    </div>
  );
};

export default Loading;
