import React from 'react'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const ErrorState = ({ status = '500', title, subTitle, showBack = true }) => {
  const navigate = useNavigate()

  const getStatusConfig = () => {
    switch (status) {
      case '403':
        return { title: '403', subTitle: '抱歉，您没有权限访问此页面' }
      case '404':
        return { title: '404', subTitle: '抱歉，您访问的页面不存在' }
      case '500':
        return { title: '500', subTitle: '抱歉，服务器出错了' }
      default:
        return { title: '错误', subTitle: '发生了未知错误' }
    }
  }

  const config = getStatusConfig()

  return (
    <div style={{ padding: '60px 0' }}>
      <Result
        status={status}
        title={title || config.title}
        subTitle={subTitle || config.subTitle}
        extra={
          showBack && (
            <Button type="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          )
        }
      />
    </div>
  )
}

export default ErrorState
