import { Card, Tag, Tooltip, Rate, Button } from 'antd'
import { HeartOutlined, HeartFilled, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleFavoriteType, addToHistory } from '@/store/slices/userSlice'
import './index.css'

const TypeCard = ({ type }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const favorites = useSelector(state => state.user.favorites.types)
  const isFavorite = favorites.includes(type.id)

  const handleClick = () => {
    dispatch(addToHistory({ id: type.id, type: 'type', name: type.name, image: type.image }))
    navigate(`/types/${type.id}`)
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    dispatch(toggleFavoriteType(type.id))
  }

  return (
    <Card
      className="type-card"
      hoverable
      onClick={handleClick}
      cover={<img alt={type.name} src={type.image} className="type-card-image" />}
      actions={[
        <Tooltip title={isFavorite ? '取消收藏' : '收藏'}>
          <Button
            type="text"
            icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
            onClick={handleFavorite}
          />
        </Tooltip>,
        <span><EyeOutlined /> {type.views}</span>
      ]}
    >
      <Card.Meta
        title={
          <div className="type-card-title">
            {type.name}
            {type.isClassic && <Tag color="gold" size="small">经典</Tag>}
          </div>
        }
        description={
          <div className="type-card-meta">
            <Tag color="blue">{type.category}</Tag>
            <Tag color="purple">{type.era}</Tag>
            <div className="type-card-difficulty">
              难度：<Rate disabled count={5} value={type.difficulty} />
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default TypeCard
