import { Layout } from 'antd'
import './index.css'

const { Footer: AntFooter } = Layout

const Footer = () => {
  return (
    <AntFooter className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>🌸 香韵千年</h3>
          <p>传承千年香道文化，品味东方雅致生活</p>
        </div>
        <div className="footer-section">
          <h4>关于我们</h4>
          <p>小众传统香道数字化展示平台</p>
          <p>致力于香道文化的传承与创新</p>
        </div>
        <div className="footer-section">
          <h4>联系我们</h4>
          <p>邮箱：contact@xiangdao.com</p>
          <p>电话：400-888-8888</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 香韵千年 - 传统香道数字化展示平台 | 保留所有权利</p>
      </div>
    </AntFooter>
  )
}

export default Footer
