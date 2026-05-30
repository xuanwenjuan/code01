import { Empty as AntEmpty } from 'antd';
import './Status.css';

const Empty = ({ description = '暂无数据' }) => {
  return (
    <div className="status-container">
      <AntEmpty description={description} />
    </div>
  );
};

export default Empty;
