import { Empty } from 'antd'

const EmptyState = ({ description = '暂无数据' }) => {
  return (
    <div style={{ padding: '60px 20px' }}>
      <Empty description={description} />
    </div>
  )
}

export default EmptyState
