import React from 'react'
import { Card, Tag, Button } from 'antd'
import { FireOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './index.css'

const PackageCard = ({ pkg }) => {
  const navigate = useNavigate()

  return (
    <Card className="package-card card-hover" cover={
      <div className="package-cover">
        <img src={pkg.image} alt={pkg.name} />
        {pkg.hot && (
          <div className="hot-badge">
            <FireOutlined /> 热门
          </div>
        )}
        <div className="save-badge">
          省¥{pkg.save}
        </div>
      </div>
    }>
      <div className="package-info">
        <h3 className="package-name">{pkg.name}</h3>
        <p className="package-desc">{pkg.description}</p>
        <div className="package-price">
          <span className="price-label">套餐价</span>
          <span className="current-price">¥{pkg.price}</span>
          <span className="original-price">¥{pkg.originalPrice}</span>
        </div>
        <Button 
          type="primary" 
          block 
          className="book-btn"
          onClick={() => navigate(`/service/${pkg.services[0]}`)}
        >
          立即预约
        </Button>
      </div>
    </Card>
  )
}

export default PackageCard
