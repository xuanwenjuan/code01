import { Result, Button } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

const ErrorState = ({ message = '加载失败', subMessage = '请稍后重试', onRetry }) => {
  return (
    <div className="flex items-center justify-center py-16">
      <Result
        icon={<WarningOutlined className="text-red-500" />}
        title={message}
        subTitle={subMessage}
        extra={
          onRetry && (
            <Button type="primary" className="bg-amber-600" onClick={onRetry}>
              重新加载
            </Button>
          )
        }
      />
    </div>
  );
};

export default ErrorState;
