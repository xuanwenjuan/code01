import { Result, Button } from 'antd';

const ErrorState = ({ message = '加载失败', onRetry }) => {
  return (
    <Result
      status="warning"
      title="提示"
      subTitle={message}
      extra={
        onRetry && (
          <Button type="primary" onClick={onRetry}>
            重新加载
          </Button>
        )
      }
    />
  );
};

export default ErrorState;
