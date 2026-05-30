import React from 'react'
import { Spin } from 'antd'
import './index.scss'

const Loading = ({ tip = '加载中...', size = 'large', fullHeight = true }) => {
  return (
    <div className={`loading-wrapper ${fullHeight ? 'full-height' : ''}`}>
      <Spin size={size} tip={tip} />
    </div>
  )
}

export default React.memo(Loading)
