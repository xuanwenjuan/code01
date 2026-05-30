import React from 'react'
import { Layout, Space, Typography } from 'antd'
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons'

const { Footer } = Layout
const { Text, Title } = Typography

const AppFooter = () => {
  return (
    <Footer
      style={{
        background: 'linear-gradient(135deg, #2c2416 0%, #1a160d 100%)',
        color: '#d4c4a0',
        padding: '40px 24px 20px',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '30px',
          }}
        >
          <div>
            <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
              📜 古法造纸技艺数字化档案平台
            </Title>
            <Text style={{ color: '#d4c4a0', lineHeight: '1.8' }}>
              传承千年造纸技艺，弘扬中华传统文化。我们致力于通过数字化手段，保护和传播古法造纸这一珍贵的非物质文化遗产。
            </Text>
          </div>

          <div>
            <Title level={5} style={{ color: '#fff', marginBottom: '16px' }}>
              联系方式
            </Title>
            <Space direction="vertical" size="middle">
              <span>
                <PhoneOutlined style={{ marginRight: '8px' }} />
                400-888-8888
              </span>
              <span>
                <MailOutlined style={{ marginRight: '8px' }} />
                contact@papermuseum.com
              </span>
              <span>
                <EnvironmentOutlined style={{ marginRight: '8px' }} />
                安徽省宣城市泾县宣纸文化园
              </span>
            </Space>
          </div>

          <div>
            <Title level={5} style={{ color: '#fff', marginBottom: '16px' }}>
              友情链接
            </Title>
            <Space direction="vertical" size="middle">
              <a href="#" style={{ color: '#d4c4a0' }}>
                中国非物质文化遗产网
              </a>
              <a href="#" style={{ color: '#d4c4a0' }}>
                中国宣纸博物馆
              </a>
              <a href="#" style={{ color: '#d4c4a0' }}>
                故宫博物院
              </a>
              <a href="#" style={{ color: '#d4c4a0' }}>
                中国国家图书馆
              </a>
            </Space>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #443a24',
            paddingTop: '20px',
            textAlign: 'center',
            color: '#8b7a56',
          }}
        >
          <Text>© 2024 古法造纸技艺数字化档案平台 版权所有</Text>
        </div>
      </div>
    </Footer>
  )
}

export default AppFooter
