import { Layout, Row, Col } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons'
import './index.css'

const { Footer: AntFooter } = Layout

const Footer = () => {
  return (
    <AntFooter className="site-footer">
      <div className="footer-content">
        <Row gutter={[48, 24]}>
          <Col xs={24} md={8}>
            <h3 className="footer-title">关于我们</h3>
            <p className="footer-desc">
              传统木活字印刷数字化展示平台，致力于传承和弘扬中国传统印刷技艺，
              让千年活字文化在数字时代焕发新生。
            </p>
          </Col>
          <Col xs={24} md={8}>
            <h3 className="footer-title">联系我们</h3>
            <ul className="footer-contact">
              <li><PhoneOutlined /> 400-123-4567</li>
              <li><MailOutlined /> contact@muhuozi.com</li>
              <li><EnvironmentOutlined /> 北京市海淀区文化科技园</li>
            </ul>
          </Col>
          <Col xs={24} md={8}>
            <h3 className="footer-title">友情链接</h3>
            <ul className="footer-links">
              <li>中国非物质文化遗产网</li>
              <li>国家图书馆</li>
              <li>故宫博物院</li>
              <li>中国印刷博物馆</li>
            </ul>
          </Col>
        </Row>
        <div className="footer-bottom">
          <p>© 2024 传统木活字印刷数字化展示平台 版权所有</p>
          <p>传承千年技艺·弘扬中华文化</p>
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer
