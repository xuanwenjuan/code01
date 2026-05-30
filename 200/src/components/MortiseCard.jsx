import { Card, Tag, Avatar, Rate, Button, message } from 'antd'
import { EyeOutlined, HeartOutlined, HeartFilled, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleFavorite } from '@/store/slices/userSlice'
import { designers } from '@/mock/users'

const { Meta } = Card

const MortiseCard = ({ mortise, showActions = true }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { favorites } = useSelector(state => state.user)
  const { isAuthenticated } = useSelector(state => state.auth)

  const isFavorite = favorites.includes(mortise.id)
  const designer = designers.find(d => d.id === mortise.designerId)

  const handleClick = () => {
    navigate(`/mortise/${mortise.id}`)
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      message.warning('请先登录后再收藏')
      navigate('/login')
      return
    }
    dispatch(toggleFavorite(mortise.id))
    message.success(isFavorite ? '已取消收藏' : '收藏成功')
  }

  const getCategoryColor = (category) => {
    const colors = {
      classic: '#faad14',
      innovative: '#1890ff',
      furniture: '#52c41a',
      architecture: '#722ed1',
      decoration: '#eb2f96'
    }
    return colors[category] || '#8c8c8c'
  }

  const getCategoryName = (category) => {
    const names = {
      classic: '经典',
      innovative: '创新',
      furniture: '家具',
      architecture: '建筑',
      decoration: '装饰'
    }
    return names[category] || '其他'
  }

  return (
    <Card
      hoverable
      onClick={handleClick}
      style={{ height: '100%' }}
      cover={
        <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
          <img
            alt={mortise.name}
            src={mortise.image}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <Tag
            color={getCategoryColor(mortise.category)}
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              margin: 0
            }}
          >
            {getCategoryName(mortise.category)}
          </Tag>
          {showActions && (
            <Button
              type="text"
              icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
              onClick={handleFavorite}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '50%',
                padding: 0,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          )}
        </div>
      }
      actions={showActions ? [
        <span key="view"><EyeOutlined /> {mortise.views}</span>,
        <span key="rate"><Rate disabled allowHalf value={mortise.difficulty / 2} style={{ fontSize: 12 }} /></span>
      ] : null}
    >
      <Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{mortise.name}</span>
            <span style={{ color: '#ff4d4f', fontSize: 18 }}>★</span>
          </div>
        }
        description={
          <div style={{ marginTop: 8 }}>
            <p style={{ color: '#666', marginBottom: 8, fontSize: 13, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {mortise.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <Avatar size={24} src={designer?.avatar} icon={<UserOutlined />} />
              <span style={{ fontSize: 12, color: '#888' }}>{designer?.name || '未知设计师'}</span>
            </div>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {mortise.tags?.map((tag, index) => (
                <Tag key={index} style={{ margin: 2 }}>{tag}</Tag>
              ))}
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default MortiseCard
