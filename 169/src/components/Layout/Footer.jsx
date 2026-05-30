import React from 'react'
import { Layout, Row, Col, Space } from 'antd'
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons'

const { Footer } = Layout

const AppFooter = () => {
  return (
    <Footer className="app-footer">
      <div className="footer-container">
        <Row gutter={40}>
          <Col span={8}>
            <h3 className="footer-title">关于我们</h3>
            <p className="footer-desc">
              同城家电维修预约平台，致力于为用户提供专业、便捷、放心的家电维修服务。我们拥有经验丰富的维修师傅团队，覆盖全国主要城市。
            </p>
          </Col>
          <Col span={8}>
            <h3 className="footer-title">服务项目</h3>
            <ul className="footer-list">
              <li>空调维修 / 安装 / 加氟</li>
              <li>冰箱 / 洗衣机维修</li>
              <li>电视 / 热水器维修</li>
              <li>厨房家电 / 小家电维修</li>
            </ul>
          </Col>
          <Col span={8}>
            <h3 className="footer-title">联系我们</h3>
            <Space direction="vertical" size="middle">
              <p>
                <PhoneOutlined /> 400-888-8888
              </p>
              <p>
                <MailOutlined /> service@repair.com
              </p>
              <p>
                <EnvironmentOutlined /> 北京市朝阳区建国路88号
              </p>
            </Space>
          </Col>
        </Row>
        <div className="footer-bottom">
          <p>© 2024 同城家电维修预约平台 版权所有 | 京ICP备12345678号</p>
        </div>
      </div>
    </Footer>
  )
}

export default AppFooter
