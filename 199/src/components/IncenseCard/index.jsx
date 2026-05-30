import { Card, Tag, Button, message } from 'antd'
import { HeartOutlined, HeartFilled, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleFavorite } from '@/store/slices/userSlice'
import './index.css'

const { Meta } = Card

const IncenseCard = ({ incense }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.user.currentUser)
  const favorites = currentUser?.favorites || []
  const isFavorited = favorites.includes(incense.id)

  const handleClick = () => {
    navigate(`/incense/${incense.id}`)
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    dispatch(toggleFavorite(incense.id))
    message.success(isFavorited ? '已取消收藏' : '收藏成功')
  }

  return (
    <Card
      className="incense-card"
      hoverable
      cover={
        <div className="card-cover" onClick={handleClick}>
          <img src={incense.coverImage} alt={incense.name} />
          {incense.type === 'new' && (
            <Tag color="red" className="card-tag-new">新品</Tag>
          )}
          {incense.type === 'ancient' && (
            <Tag color="gold" className="card-tag-ancient">古法</Tag>
          )}
        </div>
      }
      actions={[
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={handleClick}
          key="view"
        >
          查看详情
        </Button>,
        <Button
          type="text"
          icon={isFavorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
          onClick={handleFavorite}
          key="favorite"
        >
          {isFavorited ? '已收藏' : '收藏'}
        </Button>
      ]}
    >
      <Meta
        title={
          <div className="card-title" onClick={handleClick}>
            <span>{incense.name}</span>
            <span className="card-price">¥{incense.price}</span>
          </div>
        }
        description={
          <div className="card-desc">
            <p>{incense.description}</p>
            <p className="card-origin">产地：{incense.origin}</p>
          </div>
        }
      />
    </Card>
  )
}

export default IncenseCard
