import { Empty } from 'antd'

const EmptyState = ({ description = '暂无数据', image, children }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '300px',
      padding: '40px'
    }}>
      <Empty
        description={description}
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
      >
        {children}
      </Empty>
    </div>
  )
}

export default EmptyState
