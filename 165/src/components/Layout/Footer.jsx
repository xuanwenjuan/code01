import { Layout } from 'antd'

const { Footer: AntFooter } = Layout

const Footer = () => {
  return (
    <AntFooter
      style={{
        background: '#fff',
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0',
        marginTop: 40
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h4 style={{ marginBottom: 12 }}>关于我们</h4>
            <p style={{ color: '#666', margin: '4px 0' }}>平台介绍</p>
            <p style={{ color: '#666', margin: '4px 0' }}>联系我们</p>
            <p style={{ color: '#666', margin: '4px 0' }}>加入我们</p>
          </div>
          <div>
            <h4 style={{ marginBottom: 12 }}>服务支持</h4>
            <p style={{ color: '#666', margin: '4px 0' }}>帮助中心</p>
            <p style={{ color: '#666', margin: '4px 0' }}>服务协议</p>
            <p style={{ color: '#666', margin: '4px 0' }}>隐私政策</p>
          </div>
          <div>
            <h4 style={{ marginBottom: 12 }}>商家入驻</h4>
            <p style={{ color: '#666', margin: '4px 0' }}>师傅入驻</p>
            <p style={{ color: '#666', margin: '4px 0' }}>商家合作</p>
            <p style={{ color: '#666', margin: '4px 0' }}>招商说明</p>
          </div>
          <div>
            <h4 style={{ marginBottom: 12 }}>联系方式</h4>
            <p style={{ color: '#666', margin: '4px 0' }}>客服热线：400-888-8888</p>
            <p style={{ color: '#666', margin: '4px 0' }}>工作时间：9:00-21:00</p>
            <p style={{ color: '#666', margin: '4px 0' }}>邮箱：service@tongcheng.com</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, color: '#999' }}>
          © 2024 同城生活家政服务平台 版权所有
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer
