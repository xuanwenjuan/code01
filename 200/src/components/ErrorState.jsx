import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const ErrorState = ({ status = '500', title = '出错了', subTitle = '抱歉，系统发生错误，请稍后重试。', showBack = true }) => {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '60px 20px' }}>
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
  )
}

export default ErrorState
