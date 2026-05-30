import { Spin } from 'antd'
import './index.css'

const PageLoading = ({ tip = '加载中...' }) => {
  return (
    <div className="page-loading">
      <Spin size="large" description={tip} />
    </div>
  )
}

export default PageLoading
