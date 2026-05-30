import React from 'react'
import { Layout, Row, Col, Space } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons'

const { Footer: AntFooter } = Layout

const Footer = () => {
  return (
    <AntFooter style={{
      background: '#1a1a2e',
      color: 'rgba(255,255,255,0.7)',
      padding: '48px 24px 24px',
      marginTop: 48
    }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 16 }}>
              🏛️ 非遗文化遗产数字化平台
            </div>
            <p style={{ lineHeight: 1.8 }}>
              传承千年文化，守护非遗瑰宝。我们致力于通过数字化技术，让更多人了解和爱上中国非物质文化遗产。
            </p>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'white', marginBottom: 16 }}>
              快速链接
            </div>
            <Space direction="vertical" size="small" style={{ display: 'flex' }}>
              <a href="/" style={{ color: 'rgba(255,255,255,0.7)' }}>首页</a>
              <a href="/category" style={{ color: 'rgba(255,255,255,0.7)' }}>非遗分类</a>
              <a href="/login" style={{ color: 'rgba(255,255,255,0.7)' }}>用户登录</a>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'white', marginBottom: 16 }}>
              联系我们
            </div>
            <Space direction="vertical" size="small" style={{ display: 'flex' }}>
              <span><EnvironmentOutlined style={{ marginRight: 8 }} />北京市朝阳区文化中心</span>
              <span><PhoneOutlined style={{ marginRight: 8 }} />400-888-8888</span>
              <span><MailOutlined style={{ marginRight: 8 }} />contact@heritage.com</span>
            </Space>
          </Col>
        </Row>
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginTop: 32,
          paddingTop: 24,
          textAlign: 'center'
        }}>
          © 2024 非遗文化遗产数字化平台 版权所有 | 京ICP备12345678号
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer
