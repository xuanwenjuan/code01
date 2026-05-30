import { Result, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

const ErrorState = ({ 
  title = '加载失败', 
  subTitle = '抱歉，数据加载失败，请稍后重试',
  onRetry,
  status = 'error'
}) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px'
    }}>
      <Result
        status={status}
        title={title}
        subTitle={subTitle}
        extra={onRetry && (
          <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
            重新加载
          </Button>
        )}
      />
    </div>
  )
}

export default ErrorState
