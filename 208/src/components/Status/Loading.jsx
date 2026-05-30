import { Spin } from 'antd';
import './Status.css';

const Loading = ({ tip = '加载中...' }) => {
  return (
    <div className="status-container">
      <Spin size="large" tip={tip} />
    </div>
  );
};

export default Loading;
