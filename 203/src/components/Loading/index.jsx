import { Spin } from 'antd'
import './index.css'

const Loading = ({ text = '加载中...', size = 'large' }) => {
  return (
    <div className="loading-container">
      <Spin size={size} description={text} />
    </div>
  )
}

export default Loading
