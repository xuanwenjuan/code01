import { Result, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import './index.css'

const PageError = ({ title = '加载失败', subTitle = '请稍后重试', onRetry }) => {
  return (
    <div className="page-error">
      <Result
        status="error"
        title={title}
        subTitle={subTitle}
        extra={
          onRetry && (
            <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
              重新加载
            </Button>
          )
        }
      />
    </div>
  )
}

export default PageError
