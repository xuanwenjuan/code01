import { Empty } from 'antd';

const EmptyState = ({ description = '暂无数据' }) => {
  return (
    <Empty
      description={description}
      style={{ padding: '60px 0' }}
    />
  );
};

export default EmptyState;
