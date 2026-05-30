import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter style={{ textAlign: 'center', background: '#fff', marginTop: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
        <p style={{ margin: 0, color: '#666' }}>
          © 2026 文具礼品商城 | 专业的在线文具礼品选购平台
        </p>
        <p style={{ margin: '8px 0 0', color: '#999', fontSize: 12 }}>
          客服热线：400-123-4567 | 工作时间：9:00-21:00
        </p>
      </div>
    </AntFooter>
  );
};

export default Footer;
