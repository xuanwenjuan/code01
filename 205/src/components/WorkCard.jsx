import { Card, Tag } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '@/store/userSlice';
import './WorkCard.css';

const WorkCard = ({ work }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { favorites } = useSelector(state => state.user);
  const isFavorite = favorites.some(f => f.id === work.id);

  const handleClick = () => {
    navigate(`/work/${work.id}`);
  };

  const handleFavorite = e => {
    e.stopPropagation();
    dispatch(toggleFavorite(work.id));
  };

  return (
    <Card
      hoverable
      className="work-card"
      onClick={handleClick}
      cover={
        <div className="work-card-cover">
          <img src={work.image} alt={work.name} />
          {work.featured && (
            <Tag color="gold" className="featured-tag">
              精选
            </Tag>
          )}
          <div
            className="favorite-btn"
            onClick={handleFavorite}
          >
            {isFavorite ? (
              <HeartFilled style={{ color: '#ff4d4f' }} />
            ) : (
              <HeartOutlined />
            )}
          </div>
        </div>
      }
    >
      <Card.Meta
        title={
          <div className="work-card-title">
            <span>{work.name}</span>
            <span className="work-price">{work.price}</span>
          </div>
        }
        description={
          <div className="work-card-meta">
            <p>{work.description}</p>
            <div className="work-card-info">
              <Tag color="blue">{work.category}</Tag>
              <span className="artist">作者：{work.artist}</span>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default WorkCard;
