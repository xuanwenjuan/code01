import { Spin } from 'antd';

const Loading = ({ tip = '加载中...', size = 'large' }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default Loading;
