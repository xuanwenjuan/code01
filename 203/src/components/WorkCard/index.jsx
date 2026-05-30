import { Card, Tag, Tooltip, Button } from 'antd'
import { HeartOutlined, HeartFilled, EyeOutlined, LikeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleFavoriteWork, addToHistory } from '@/store/slices/userSlice'
import './index.css'

const WorkCard = ({ work }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const favorites = useSelector(state => state.user.favorites.works)
  const isFavorite = favorites.includes(work.id)

  const handleClick = () => {
    dispatch(addToHistory({ id: work.id, type: 'work', name: work.title, image: work.image }))
    navigate(`/works/${work.id}`)
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    dispatch(toggleFavoriteWork(work.id))
  }

  return (
    <Card
      className="work-card"
      hoverable
      onClick={handleClick}
      cover={<img alt={work.title} src={work.image} className="work-card-image" />}
      actions={[
        <Tooltip title={isFavorite ? '取消收藏' : '收藏'}>
          <Button
            type="text"
            icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
            onClick={handleFavorite}
          />
        </Tooltip>,
        <span><EyeOutlined /> {work.views}</span>,
        <span><LikeOutlined /> {work.likes}</span>
      ]}
    >
      <Card.Meta
        title={
          <div className="work-card-title">
            {work.title}
            {work.recommended && <Tag color="red">推荐</Tag>}
          </div>
        }
        description={
          <div className="work-card-meta">
            <Tag color="green">{work.type}</Tag>
            <span className="work-card-artisan">传承人：{work.artisan}</span>
            <p className="work-card-description">{work.description}</p>
          </div>
        }
      />
    </Card>
  )
}

export default WorkCard
