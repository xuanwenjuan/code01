import React from 'react'
import { Layout } from 'antd'

const { Footer } = Layout

const AppFooter = () => {
  return (
    <Footer style={{
      background: 'linear-gradient(135deg, #1a3a17 0%, #2d5a27 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '24px 0'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
          🌿 传统草木染技艺数字化交流平台
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
          传承千年技艺 · 绽放草木芳华
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          © 2024 草木染交流平台 版权所有 | 非物质文化遗产保护
        </div>
      </div>
    </Footer>
  )
}

export default AppFooter
