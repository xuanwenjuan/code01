import { Empty, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

function EmptyState({ description = '暂无数据', actionText, actionPath }) {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <Empty description={description}>
        {actionText && actionPath && (
          <Button type="primary" onClick={() => navigate(actionPath)}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  )
}

export default EmptyState
