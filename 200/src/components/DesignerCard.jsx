import { Card, Tag, Avatar, Button, message } from 'antd'
import { UserOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleFollow } from '@/store/slices/userSlice'

const DesignerCard = ({ designer }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { following } = useSelector(state => state.user)
  const { isAuthenticated } = useSelector(state => state.auth)

  const isFollowing = following.includes(designer.id)

  const handleFollow = (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    dispatch(toggleFollow(designer.id))
    message.success(isFollowing ? '已取消关注' : '关注成功')
  }

  return (
    <Card hoverable style={{ textAlign: 'center', padding: 16 }}>
      <Avatar size={80} src={designer.avatar} icon={<UserOutlined />} />
      <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600 }}>
        {designer.name}
      </div>
      <div style={{ color: '#1890ff', marginTop: 4 }}>
        {designer.title}
      </div>
      <div style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
        从业 {designer.experience} · {designer.worksCount} 件作品
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16, color: '#666', fontSize: 13 }}>
        <div>
          <div style={{ fontWeight: 600, color: '#333' }}>{designer.followers.toLocaleString()}</div>
          <div>粉丝</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#333' }}>{designer.worksCount}</div>
          <div>作品</div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
        {designer.specialty?.map((s, i) => (
          <Tag key={i} color="blue">{s}</Tag>
        ))}
      </div>
      <Button
        type={isFollowing ? 'default' : 'primary'}
        icon={isFollowing ? <CheckOutlined /> : <PlusOutlined />}
        onClick={handleFollow}
        style={{ marginTop: 16, width: '100%' }}
      >
        {isFollowing ? '已关注' : '+ 关注'}
      </Button>
    </Card>
  )
}

export default DesignerCard
