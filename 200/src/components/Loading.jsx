import { Spin } from 'antd'

const Loading = ({ text = '加载中...' }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 20px',
      flexDirection: 'column',
      gap: 16
    }}>
      <Spin size="large" />
      <span style={{ color: '#666' }}>{text}</span>
    </div>
  )
}

export default Loading
