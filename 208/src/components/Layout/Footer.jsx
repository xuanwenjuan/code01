import { Layout } from 'antd';
import './Layout.css';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter className="site-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>关于我们</h4>
          <p>传承千年剪纸技艺，弘扬中华传统文化</p>
        </div>
        <div className="footer-section">
          <h4>联系我们</h4>
          <p>邮箱：contact@papercut.com</p>
          <p>电话：400-123-4567</p>
        </div>
        <div className="footer-section">
          <h4>友情链接</h4>
          <p>中国非物质文化遗产网</p>
          <p>中国剪纸协会</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 传统剪纸技艺数字化展示与交流平台 版权所有</p>
      </div>
    </AntFooter>
  );
};

export default Footer;
