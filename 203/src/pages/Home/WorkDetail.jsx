import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Typography, Tag, Button, Card, Descriptions, Divider } from 'antd'
import { ArrowLeftOutlined, HeartOutlined, HeartFilled, EyeOutlined, LikeOutlined, UserOutlined } from '@ant-design/icons'
import { fetchWorkDetail, clearWorkDetail } from '@/store/slices/workSlice'
import { toggleFavoriteWork } from '@/store/slices/userSlice'
import Loading from '@/components/Loading'
import Empty from '@/components/Empty'

const { Title, Paragraph } = Typography

const WorkDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { detail } = useSelector(state => state.works)
  const favorites = useSelector(state => state.user.favorites.works)
  const { loading } = useSelector(state => state.ui)
  const isFavorite = favorites.includes(Number(id))

  useEffect(() => {
    if (id) {
      dispatch(fetchWorkDetail(Number(id)))
    }
    return () => {
      dispatch(clearWorkDetail())
    }
  }, [id, dispatch])

  if (loading) return <Loading />
  if (!detail) return <Empty description="作品不存在" />

  const artisanLink = `/artisans/${detail.artisanId}`

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: '24px' }}
      >
        返回
      </Button>

      <Row gutter={[32, 32]}>
        <Col xs={24} md={10}>
          <Card
            cover={
              <img
                alt={detail.title}
                src={detail.image}
                style={{ height: '400px', objectFit: 'cover' }}
              />
            }
          />
        </Col>
        <Col xs={24} md={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                {detail.title}
                {detail.recommended && <Tag color="red" style={{ marginLeft: '12px' }}>推荐</Tag>}
              </Title>
              <div style={{ marginTop: '12px' }}>
                <Tag color="green">{detail.type}</Tag>
                <Tag color="blue">{detail.year}</Tag>
              </div>
            </div>
            <Button
              type={isFavorite ? 'primary' : 'default'}
              icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
              onClick={() => dispatch(toggleFavoriteWork(detail.id))}
            >
              {isFavorite ? '已收藏' : '收藏'}
            </Button>
          </div>

          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '24px' }}>
            {detail.description}
          </Paragraph>

          <Divider />

          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="传承人">
              <span
                onClick={() => navigate(artisanLink)}
                style={{ color: '#1890ff', cursor: 'pointer' }}
              >
                <UserOutlined /> {detail.artisan}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="作品内容">
              {detail.content}
            </Descriptions.Item>
            <Descriptions.Item label="使用材料">
              {detail.materials.join('、')}
            </Descriptions.Item>
            <Descriptions.Item label="作品尺寸">
              {detail.size}
            </Descriptions.Item>
            <Descriptions.Item label="浏览量">
              <EyeOutlined /> {detail.views}
            </Descriptions.Item>
            <Descriptions.Item label="点赞数">
              <LikeOutlined /> {detail.likes}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </div>
  )
}

export default WorkDetail
