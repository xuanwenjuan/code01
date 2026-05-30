import React from 'react'
import { Card } from 'antd'
import { EyeOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleFavorite } from '../store/slices/userSlice'

const HeritageCard = ({ heritage }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser, favorites } = useSelector(state => state.user)
  const isFavorite = favorites.includes(heritage.id)

  const handleClick = () => {
    navigate(`/heritage/${heritage.id}`)
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    if (!currentUser) {
      navigate('/login')
      return
    }
    dispatch(toggleFavorite(heritage.id))
  }

  return (
    <Card
      hoverable
      className="heritage-card"
      cover={
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          {heritage.isEndangered && <span className="endangered-badge">濒危</span>}
          {heritage.isHot && !heritage.isEndangered && <span className="hot-badge">热门</span>}
          <img
            src={heritage.cover}
            alt={heritage.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      }
      onClick={handleClick}
      actions={[
        <span key="views" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <EyeOutlined /> {heritage.views}
        </span>,
        <span
          key="favorite"
          onClick={handleFavorite}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            cursor: 'pointer',
            color: isFavorite ? '#d4380d' : 'inherit'
          }}
        >
          {isFavorite ? <HeartFilled /> : <HeartOutlined />} 收藏
        </span>
      ]}
    >
      <Card.Meta
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{heritage.name}</span>
            <span style={{
              fontSize: 11,
              padding: '2px 8px',
              background: heritage.level === '世界级' ? '#fff2e8' : '#f6ffed',
              color: heritage.level === '世界级' ? '#d4380d' : '#52c41a',
              borderRadius: 4
            }}>
              {heritage.level}
            </span>
          </div>
        }
        description={
          <div style={{ marginTop: 8 }}>
            <span className="category-tag">{heritage.categoryName}</span>
            <p style={{
              marginTop: 8,
              color: '#666',
              fontSize: 13,
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {heritage.description}
            </p>
          </div>
        }
      />
    </Card>
  )
}

export default HeritageCard
