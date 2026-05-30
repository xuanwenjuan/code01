import { Layout } from 'antd'

const { Footer } = Layout

function AppFooter() {
  return (
    <Footer
      style={{
        textAlign: 'center',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        marginTop: 24,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 24, marginRight: 8 }}>🧹</span>
          <span style={{ fontSize: 18, fontWeight: 600 }}>洁家上门保洁</span>
        </div>
        <p style={{ color: '#999', margin: '8px 0' }}>
          专业、高效、放心的上门保洁服务平台
        </p>
        <p style={{ color: '#666', margin: 0 }}>
          ©2024 洁家保洁 版权所有 | 服务热线：400-888-8888
        </p>
      </div>
    </Footer>
  )
}

export default AppFooter
