import { Card, Avatar, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './ArtisanCard.css';

const ArtisanCard = ({ artisan }) => {
  return (
    <Card className="artisan-card" hoverable>
      <div className="artisan-header">
        <Avatar
          size={80}
          src={artisan.avatar}
          icon={<UserOutlined />}
        />
        <div className="artisan-info">
          <h3 className="artisan-name">{artisan.name}</h3>
          <Tag color="gold">{artisan.title}</Tag>
        </div>
      </div>
      <div className="artisan-stats">
        <div className="stat-item">
          <span className="stat-value">{artisan.experience}</span>
          <span className="stat-label">从业经验</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{artisan.specialty}</span>
          <span className="stat-label">擅长领域</span>
        </div>
      </div>
      <p className="artisan-bio">{artisan.bio}</p>
    </Card>
  );
};

export default ArtisanCard;
