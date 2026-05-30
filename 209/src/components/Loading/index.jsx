import { Spin } from 'antd'

const Loading = ({ tip = '加载中...', fullscreen = true }) => {
  if (fullscreen) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        width: '100%'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  return <Spin />
}

export default Loading
