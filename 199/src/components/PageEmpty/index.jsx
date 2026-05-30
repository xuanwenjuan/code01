import { Empty } from 'antd'
import './index.css'

const PageEmpty = ({ description = '暂无数据' }) => {
  return (
    <div className="page-empty">
      <Empty description={description} />
    </div>
  )
}

export default PageEmpty
