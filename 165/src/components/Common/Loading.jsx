import { Spin } from 'antd'

const Loading = ({ tip = '加载中...', size = 'large', style }) => {
  return (
    <div className="flex-center" style={{ minHeight: 200, ...style }}>
      <Spin size={size} tip={tip} />
    </div>
  )
}

export default Loading
