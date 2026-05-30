import React from 'react'
import { Card, Rate, Tag, Avatar } from 'antd'
import { TeamOutlined, StarOutlined } from '@ant-design/icons'

const { Meta } = Card

const TechnicianCard = ({ technician }) => {
  return (
    <Card className="technician-card" hoverable>
      <Meta
        avatar={
          <Avatar 
            size={64} 
            style={{ backgroundColor: technician.color, fontSize: '24px', fontWeight: 'bold' }}
          >
            {technician.name.charAt(0)}
          </Avatar>
        }
        title={
          <div className="tech-title">
            <span className="tech-name">{technician.name}</span>
            <Tag color="green">{technician.experience}年经验</Tag>
          </div>
        }
        description={
          <div className="tech-desc">
            <div className="tech-rating">
              <Rate disabled value={technician.rating} allowHalf />
              <span className="rating-num">{technician.rating}</span>
            </div>
            <div className="tech-orders">
              <TeamOutlined /> 已服务 {technician.orders} 单
            </div>
            <div className="tech-skills">
              {technician.skills.map((skill, index) => (
                <Tag key={index} color="blue" size="small">
                  {skill}
                </Tag>
              ))}
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default React.memo(TechnicianCard)
