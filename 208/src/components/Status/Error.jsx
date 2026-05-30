import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import './Status.css';

const Error = ({ status = '500', title = '出错了', subTitle = '抱歉，页面加载出现错误', showBack = true }) => {
  const navigate = useNavigate();

  return (
    <div className="status-container">
      <Result
        status={status}
        title={title}
        subTitle={subTitle}
        extra={showBack && (
          <Button type="primary" onClick={() => navigate('/')}>
            返回首页
          </Button>
        )}
      />
    </div>
  );
};

export default Error;
