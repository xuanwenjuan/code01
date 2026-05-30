import React from 'react'
import { Layout, Space } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons'

const { Footer } = Layout

function AppFooter() {
  return (
    <Footer style={{
      background: '#5D4037',
      color: '#fff',
      padding: '40px 50px 20px'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 30
      }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <h3 style={{ color: '#c9a96e', marginBottom: 16, fontSize: 18 }}>
            关于我们
          </h3>
          <p style={{ color: '#ddd', lineHeight: 1.8, fontSize: 14 }}>
            传统矿物颜料数字化展示平台致力于保护和传承中国传统矿物颜料制作技艺，
            通过数字化手段让更多人了解和热爱这一珍贵的非物质文化遗产。
          </p>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ color: '#c9a96e', marginBottom: 16, fontSize: 18 }}>
            联系方式
          </h3>
          <Space direction="vertical" size="middle" style={{ color: '#ddd', fontSize: 14 }}>
            <div><EnvironmentOutlined style={{ marginRight: 8 }} /> 北京市朝阳区文化创意产业园</div>
            <div><PhoneOutlined style={{ marginRight: 8 }} /> 400-123-4567</div>
            <div><MailOutlined style={{ marginRight: 8 }} /> contact@pigment.com</div>
          </Space>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ color: '#c9a96e', marginBottom: 16, fontSize: 18 }}>
            友情链接
          </h3>
          <Space direction="vertical" size="middle" style={{ color: '#ddd', fontSize: 14 }}>
            <div style={{ cursor: 'pointer' }}>故宫博物院</div>
            <div style={{ cursor: 'pointer' }}>中国美术学院</div>
            <div style={{ cursor: 'pointer' }}>敦煌研究院</div>
            <div style={{ cursor: 'pointer' }}>非物质文化遗产网</div>
          </Space>
        </div>
      </div>
      <div style={{
        borderTop: '1px solid #6D5047',
        marginTop: 30,
        paddingTop: 20,
        textAlign: 'center',
        color: '#aaa',
        fontSize: 13
      }}>
        © 2024 传统矿物颜料数字化展示平台 版权所有 | 京ICP备12345678号
      </div>
    </Footer>
  )
}

export default AppFooter
