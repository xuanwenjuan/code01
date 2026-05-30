import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Typography, Tag, Rate, Button, Card, Descriptions, Divider } from 'antd'
import { ArrowLeftOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons'
import { fetchTypeDetail, clearDetail } from '@/store/slices/typeSlice'
import { toggleFavoriteType } from '@/store/slices/userSlice'
import Loading from '@/components/Loading'
import Empty from '@/components/Empty'

const { Title, Paragraph } = Typography

const TypeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { detail } = useSelector(state => state.types)
  const favorites = useSelector(state => state.user.favorites.types)
  const { loading } = useSelector(state => state.ui)
  const isFavorite = favorites.includes(Number(id))

  useEffect(() => {
    if (id) {
      dispatch(fetchTypeDetail(Number(id)))
    }
    return () => {
      dispatch(clearDetail())
    }
  }, [id, dispatch])

  if (loading) return <Loading />
  if (!detail) return <Empty description="活字不存在" />

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
          <Card cover={<img alt={detail.name} src={detail.image} style={{ height: '400px', objectFit: 'cover' }} />} />
        </Col>
        <Col xs={24} md={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                {detail.name}
                {detail.isClassic && <Tag color="gold" style={{ marginLeft: '12px' }}>经典</Tag>}
              </Title>
              <div style={{ marginTop: '12px' }}>
                <Tag color="blue">{detail.category}</Tag>
                <Tag color="purple">{detail.era}</Tag>
              </div>
            </div>
            <Button
              type={isFavorite ? 'primary' : 'default'}
              icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
              onClick={() => dispatch(toggleFavoriteType(detail.id))}
            >
              {isFavorite ? '已收藏' : '收藏'}
            </Button>
          </div>

          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '24px' }}>
            {detail.description}
          </Paragraph>

          <Divider />

          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="难度等级">
              <Rate disabled count={5} value={detail.difficulty} />
            </Descriptions.Item>
            <Descriptions.Item label="特点">
              {detail.features.map((f, i) => (
                <Tag key={i} color="green">{f}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="常用材质">
              {detail.materials.join('、')}
            </Descriptions.Item>
            <Descriptions.Item label="浏览量">
              {detail.views}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </div>
  )
}

export default TypeDetail
