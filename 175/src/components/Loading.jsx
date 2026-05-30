import { Spin } from 'antd'

function Loading({ tip = '加载中...', size = 'large' }) {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <Spin size={size} />
      {tip && <div style={{ marginTop: 16, color: '#666' }}>{tip}</div>}
    </div>
  )
}

export default Loading
