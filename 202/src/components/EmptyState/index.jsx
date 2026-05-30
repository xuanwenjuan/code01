import React from 'react'
import { Empty, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const EmptyState = ({ description = '暂无数据', showBack = false, backText = '返回首页' }) => {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <Empty description={description}>
        {showBack && (
          <Button type="primary" onClick={() => navigate('/')}>
            {backText}
          </Button>
        )}
      </Empty>
    </div>
  )
}

export default EmptyState
