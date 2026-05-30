import { Empty } from 'antd'

const EmptyState = ({ description = '暂无数据', image, style }) => {
  return (
    <Empty
      description={description}
      image={image || Empty.PRESENTED_IMAGE_SIMPLE}
      style={style}
    />
  )
}

export default EmptyState
