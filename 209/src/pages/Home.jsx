import { useState, useEffect } from 'react'
import { Row, Col, Tabs, Typography, Button, Modal, Image, Tag, Space, Carousel } from 'antd'
import { EyeOutlined, HeartOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchWorks, fetchKilns } from '../store/slices/worksSlice'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import WorkCard from '../components/WorkCard'
import KilnCard from '../components/KilnCard'

const { Title, Paragraph, Text } = Typography

const Home = () => {
  const dispatch = useDispatch()
  const { works, kilns, loading, error } = useSelector(state => state.works)
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedWork, setSelectedWork] = useState(null)
  const [selectedKiln, setSelectedKiln] = useState(null)

  useEffect(() => {
    dispatch(fetchWorks())
    dispatch(fetchKilns())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchWorks(activeCategory === 'all' ? {} : { category: activeCategory }))
  }, [activeCategory, dispatch])

  const categoryTabs = [
    { key: 'all', label: '全部作品' },
    { key: 'qimin', label: '器皿类' },
    { key: 'baijian', label: '摆件类' },
    { key: 'wenchuang', label: '文创类' }
  ]

  if (loading && works.length === 0) {
    return <Loading />
  }

  if (error) {
    return <ErrorState onRetry={() => dispatch(fetchWorks())} />
  }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #D2691E 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        color: 'white'
      }}>
        <Title level={1} style={{ color: 'white', fontSize: 48, marginBottom: 16 }}>
          传承千年陶艺 匠心独运
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, maxWidth: 800, margin: '0 auto' }}>
          探索传统陶艺的魅力，学习精湛的制作技艺，记录您的创作历程，
          让古老的陶艺文化在数字时代焕发生机
        </Paragraph>
        <Space style={{ marginTop: 32 }}>
          <Button size="large" type="primary" style={{ background: 'white', color: '#8B4513' }}>
            开始学习
          </Button>
          <Button size="large" ghost style={{ color: 'white', borderColor: 'white' }}>
            浏览作品
          </Button>
        </Space>
      </div>

      <div style={{ padding: '48px 24px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>🏺 经典陶艺作品</Title>
          </div>
          <Tabs
            activeKey={activeCategory}
            onChange={setActiveCategory}
            items={categoryTabs}
            style={{ marginBottom: 24 }}
          />
          {works.length === 0 ? (
            <EmptyState description="暂无该分类的作品" />
          ) : (
            <Row gutter={[24, 24]}>
              {works.map(work => (
                <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
                  <WorkCard work={work} onClick={setSelectedWork} />
                </Col>
              ))}
            </Row>
          )}
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>🏭 名窑文化</Title>
          </div>
          {kilns.length === 0 ? (
            <EmptyState description="暂无窑口数据" />
          ) : (
            <Row gutter={[24, 24]}>
              {kilns.map(kiln => (
                <Col xs={24} md={12} lg={8} key={kiln.id}>
                  <KilnCard kiln={kiln} onClick={setSelectedKiln} />
                </Col>
              ))}
            </Row>
          )}
        </div>

        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 48,
          textAlign: 'center'
        }}>
          <Title level={2} style={{ marginBottom: 16 }}>📚 数据统计</Title>
          <Row gutter={[48, 24]} style={{ marginTop: 32 }}>
            <Col xs={12} md={6}>
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#8B4513' }}>{works.length}</div>
              <div style={{ color: '#666', marginTop: 8 }}>精美作品</div>
            </Col>
            <Col xs={12} md={6}>
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#8B4513' }}>{kilns.length}</div>
              <div style={{ color: '#666', marginTop: 8 }}>历史名窑</div>
            </Col>
            <Col xs={12} md={6}>
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#8B4513' }}>4</div>
              <div style={{ color: '#666', marginTop: 8 }}>核心技法</div>
            </Col>
            <Col xs={12} md={6}>
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#8B4513' }}>1000+</div>
              <div style={{ color: '#666', marginTop: 8 }}>陶艺爱好者</div>
            </Col>
          </Row>
        </div>
      </div>

      <Modal
        open={!!selectedWork}
        title={selectedWork?.title}
        onCancel={() => setSelectedWork(null)}
        footer={null}
        width={800}
      >
        {selectedWork && (
          <div>
            <Image
              src={selectedWork.image}
              alt={selectedWork.title}
              width="100%"
              style={{ borderRadius: 8, marginBottom: 16 }}
            />
            <Paragraph style={{ fontSize: 15, color: '#333' }}>{selectedWork.description}</Paragraph>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">作者：</Text>
                <Text strong>{selectedWork.author}</Text>
              </div>
              <div>
                <Text type="secondary">窑口：</Text>
                <Text strong>{selectedWork.kiln}</Text>
              </div>
              <div>
                <Text type="secondary">年代：</Text>
                <Text strong>{selectedWork.year}年</Text>
              </div>
              <div>
                <Text type="secondary">价格：</Text>
                <Text strong style={{ color: '#8B4513', fontSize: 18 }}>
                  ¥{selectedWork.price?.toLocaleString()}
                </Text>
              </div>
              <div>
                <Text type="secondary">标签：</Text>
                {selectedWork.tags?.map((tag, i) => (
                  <Tag key={i}>{tag}</Tag>
                ))}
              </div>
              <Space>
                <span><EyeOutlined /> {selectedWork.views} 浏览</span>
                <span><HeartOutlined /> {selectedWork.likes} 喜欢</span>
              </Space>
            </Space>
          </div>
        )}
      </Modal>

      <Modal
        open={!!selectedKiln}
        title={selectedKiln?.name}
        onCancel={() => setSelectedKiln(null)}
        footer={null}
        width={900}
      >
        {selectedKiln && (
          <div>
            <Image
              src={selectedKiln.image}
              alt={selectedKiln.name}
              width="100%"
              style={{ borderRadius: 8, marginBottom: 16 }}
            />
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <EnvironmentOutlined style={{ color: '#8B4513', marginRight: 8 }} />
                <Text strong>{selectedKiln.location}</Text>
                <Text type="secondary" style={{ marginLeft: 16 }}>{selectedKiln.history}</Text>
              </div>
              <Paragraph style={{ fontSize: 15, color: '#333' }}>{selectedKiln.description}</Paragraph>
              <div>
                <Text type="secondary">特色工艺：</Text>
                {selectedKiln.specialties?.map((item, i) => (
                  <Tag key={i} color="brown">{item}</Tag>
                ))}
              </div>
              <div>
                <Text type="secondary">代表作品：</Text>
                <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  {selectedKiln.famousWorks?.map((work, i) => (
                    <li key={i}>{work}</li>
                  ))}
                </ul>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Home
