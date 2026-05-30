import { Empty as AntEmpty } from 'antd'
import './index.css'

const Empty = ({ description = '暂无数据', image }) => {
  return (
    <div className="empty-container">
      <AntEmpty description={description} image={image} />
    </div>
  )
}

export default Empty
