import React from 'react'
import { Layout } from 'antd'
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons'
import './index.scss'

const { Footer: AntFooter } = Layout

const Footer = () => {
  return (
    <AntFooter className="site-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>关于我们</h3>
          <p>鲜到家 - 社区生鲜团购平台，致力于为您提供最新鲜、最优质的生鲜产品。</p>
        </div>
        <div className="footer-section">
          <h3>联系我们</h3>
          <p><PhoneOutlined /> 400-888-8888</p>
          <p><MailOutlined /> service@xiandaojia.com</p>
          <p><EnvironmentOutlined /> 北京市朝阳区科技园区</p>
        </div>
        <div className="footer-section">
          <h3>服务支持</h3>
          <p>配送说明</p>
          <p>退换货政策</p>
          <p>常见问题</p>
        </div>
        <div className="footer-section">
          <h3>关注我们</h3>
          <div className="qr-code">
            <div className="qr-placeholder">扫码关注</div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 鲜到家 版权所有 | 京ICP备12345678号</p>
      </div>
    </AntFooter>
  )
}

export default React.memo(Footer)
