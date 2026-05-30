import { Spin } from 'antd';
import './Loading.css';

const Loading = ({ text = '加载中...' }) => {
  return (
    <div className="loading-wrapper">
      <Spin size="large" description={text} />
    </div>
  );
};

export default Loading;
