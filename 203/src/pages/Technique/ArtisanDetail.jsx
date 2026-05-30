import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Typography, Tag, Button, Avatar, Card, Descriptions, Divider, List } from 'antd'
import { ArrowLeftOutlined, TrophyOutlined, EyeOutlined } from '@ant-design/icons'
import { fetchArtisanDetail, clearArtisanDetail } from '@/store/slices/artisanSlice'
import { fetchWorks } from '@/store/slices/workSlice'
import WorkCard from '@/components/WorkCard'
import Loading from '@/components/Loading'
import Empty from '@/components/Empty'

const { Title, Paragraph } = Typography

const ArtisanDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { detail } = useSelector(state => state.artisans)
  const { list: works } = useSelector(state => state.works)
  const { loading } = useSelector(state => state.ui)

  useEffect(() => {
    if (id) {
      dispatch(fetchArtisanDetail(Number(id)))
      dispatch(fetchWorks())
    }
    return () => {
      dispatch(clearArtisanDetail())
    }
  }, [id, dispatch])

  if (loading) return <Loading />
  if (!detail) return <Empty description="传承人不存在" />

  const artisanWorks = works.filter(w => detail.works.includes(w.id))

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: '24px' }}
      >
        返回
      </Button>

      <Card className="artisan-detail-card">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={6} style={{ textAlign: 'center' }}>
            <Avatar size={160} src={detail.avatar} />
            <Title level={3} style={{ marginTop: '16px', marginBottom: '8px' }}>{detail.name}</Title>
            <Tag color="gold">{detail.title}</Tag>
            <div style={{ marginTop: '16px', color: '#666' }}>
              <p><EyeOutlined /> 浏览量：{detail.views}</p>
            </div>
          </Col>
          <Col xs={24} md={18}>
            <Descriptions column={2} bordered size="middle">
              <Descriptions.Item label="从业年限">{detail.experience} 年</Descriptions.Item>
              <Descriptions.Item label="所在地区">{detail.region}</Descriptions.Item>
              <Descriptions.Item label="擅长领域" span={2}>
                {detail.specialty.map((s, i) => (
                  <Tag key={i} color="blue">{s}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>个人简介</Title>
            <Paragraph style={{ fontSize: '15px', lineHeight: '1.8' }}>{detail.bio}</Paragraph>

            <Divider />

            <Title level={4}><TrophyOutlined style={{ marginRight: '8px', color: '#faad14' }} />主要成就</Title>
            <List
              dataSource={detail.achievements}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta description={item} />
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Card>

      <Divider />

      <Title level={3} style={{ marginTop: '48px' }}>代表作品</Title>
      {artisanWorks.length > 0 ? (
        <Row gutter={[24, 24]}>
          {artisanWorks.map(work => (
            <Col key={work.id} xs={24} sm={12} md={8}>
              <WorkCard work={work} />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="暂无代表作品" />
      )}
    </div>
  )
}

export default ArtisanDetail
