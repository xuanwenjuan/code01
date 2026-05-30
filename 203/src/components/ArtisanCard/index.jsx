import { Card, Tag, Avatar, Button } from 'antd'
import { EyeOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './index.css'

const ArtisanCard = ({ artisan }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/artisans/${artisan.id}`)
  }

  return (
    <Card className="artisan-card" hoverable onClick={handleClick}>
      <div className="artisan-card-header">
        <Avatar size={80} src={artisan.avatar} icon={<UserOutlined />} />
        <div className="artisan-card-info">
          <h3 className="artisan-name">{artisan.name}</h3>
          <Tag color="gold">{artisan.title}</Tag>
          <p className="artisan-region">
            <span>地区：{artisan.region}</span>
            <span>从业 {artisan.experience} 年</span>
          </p>
        </div>
      </div>
      <p className="artisan-bio">{artisan.bio}</p>
      <div className="artisan-card-footer">
        <div className="artisan-specialty">
          {artisan.specialty.slice(0, 3).map((s, i) => (
            <Tag key={i} color="blue">{s}</Tag>
          ))}
        </div>
        <div className="artisan-views">
          <EyeOutlined /> {artisan.views}
        </div>
      </div>
    </Card>
  )
}

export default ArtisanCard
