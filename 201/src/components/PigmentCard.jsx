import React from 'react'
import { Card, Tag, Space, Button } from 'antd'
import { EyeOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleFavorite } from '@/store/slices/userSlice'

const { Meta } = Card

function PigmentCard({ pigment }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser } = useSelector(state => state.user)
  const isFavorite = currentUser?.favorites?.includes(pigment.id)

  const handleClick = () => {
    navigate(`/pigment/${pigment.id}`)
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    if (!currentUser) {
      navigate('/login')
      return
    }
    dispatch(toggleFavorite(pigment.id))
  }

  return (
    <Card
      hoverable
      className="pigment-card card-hover"
      cover={
        <div onClick={handleClick} style={{ cursor: 'pointer' }}>
          <div
            style={{
              width: '100%',
              height: '160px',
              backgroundColor: pigment.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <span style={{
              color: '#fff',
              fontSize: '48px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              {pigment.chineseName}
            </span>
            {pigment.isHot && (
              <Tag color="red" style={{ position: 'absolute', top: 10, right: 10 }}>
                热门
              </Tag>
            )}
          </div>
        </div>
      }
      actions={[
        <Space key="views">
          <EyeOutlined />
          <span>{pigment.views}</span>
        </Space>,
        <Button
          key="favorite"
          type="text"
          icon={isFavorite ? <HeartFilled style={{ color: '#e74c3c' }} /> : <HeartOutlined />}
          onClick={handleFavorite}
        >
          {pigment.likes}
        </Button>
      ]}
    >
      <Meta
        title={
          <div onClick={handleClick} style={{ cursor: 'pointer' }}>
            <Space>
              <span style={{ color: '#5D4037', fontWeight: 600 }}>{pigment.name}</span>
              <Tag color={pigment.category === 'natural' ? 'green' : 'orange'}>
                {pigment.category === 'natural' ? '天然矿物' : '古法调配'}
              </Tag>
            </Space>
          </div>
        }
        description={
          <div>
            <div style={{ color: '#888', marginBottom: 8 }}>
              产地：{pigment.origin}
            </div>
            <div style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              color: '#666'
            }}>
              {pigment.description}
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default PigmentCard
