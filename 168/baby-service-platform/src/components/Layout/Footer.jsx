import React from 'react'
import { Layout } from 'antd'

const { Footer: AntFooter } = Layout

const Footer = () => {
  return (
    <AntFooter style={{ background: '#fff', marginTop: 40, borderTop: '1px solid #f0f0f0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '30px 0' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#ff6b9d', marginBottom: 12 }}>
              💕 母婴服务平台
            </div>
            <div style={{ color: '#666', fontSize: 14, lineHeight: 1.8 }}>
              专业的同城母婴服务预约平台，为您提供月嫂、育儿嫂、催乳、早教等一站式母婴服务。
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>服务项目</div>
            <div style={{ color: '#666', fontSize: 14, lineHeight: 2 }}>
              <div>月嫂服务</div>
              <div>育儿嫂服务</div>
              <div>催乳服务</div>
              <div>早教课程</div>
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>关于我们</div>
            <div style={{ color: '#666', fontSize: 14, lineHeight: 2 }}>
              <div>公司介绍</div>
              <div>加入我们</div>
              <div>联系我们</div>
              <div>帮助中心</div>
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>联系方式</div>
            <div style={{ color: '#666', fontSize: 14, lineHeight: 2 }}>
              <div>客服热线：400-123-4567</div>
              <div>服务时间：9:00 - 21:00</div>
              <div>邮箱：service@baby.com</div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid #f0f0f0', color: '#999', fontSize: 12 }}>
          © 2024 母婴服务平台 版权所有 | 京ICP备12345678号
        </div>
      </div>
    </AntFooter>
  )
}

export default React.memo(Footer)
