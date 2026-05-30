import { useState, useEffect } from 'react'
import { Row, Col, Typography, Modal, Image, Tag, Carousel } from 'antd'
import { EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchKilns } from '../store/slices/worksSlice'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import KilnCard from '../components/KilnCard'

const { Title, Paragraph, Text } = Typography

const KilnCulture = () => {
  const dispatch = useDispatch()
  const { kilns, loading, error } = useSelector(state => state.works)
  const [selectedKiln, setSelectedKiln] = useState(null)

  useEffect(() => {
    dispatch(fetchKilns())
  }, [dispatch])

  if (loading && kilns.length === 0) {
    return <Loading />
  }

  if (error) {
    return <ErrorState onRetry={() => dispatch(fetchKilns())} />
  }

  return (
    <div>
      <div className="page-header">
        <h1>🏭 窑口文化</h1>
        <p>探索中国六大名窑的历史渊源与独特魅力</p>
      </div>

      {kilns.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <Carousel autoplay effect="fade">
            {kilns.slice(0, 4).map(kiln => (
              <div key={kiln.id} onClick={() => setSelectedKiln(kiln)} style={{ cursor: 'pointer' }}>
                <div style={{
                  height: 400,
                  backgroundImage: `url(${kiln.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    padding: '60px 48px 48px',
                    color: 'white'
                  }}>
                    <Title level={2} style={{ color: 'white', margin: 0 }}>{kiln.name}</Title>
                    <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, fontSize: 16 }}>
                      {kiln.location} · {kiln.history}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      )}

      <div style={{ padding: '0 24px 48px', maxWidth: 1400, margin: '0 auto' }}>
        <Row gutter={[24, 24]}>
          {kilns.map(kiln => (
            <Col xs={24} md={12} lg={8} key={kiln.id}>
              <KilnCard kiln={kiln} onClick={setSelectedKiln} />
            </Col>
          ))}
        </Row>
      </div>

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
            <div style={{ marginBottom: 16 }}>
              <Tag icon={<EnvironmentOutlined />} color="blue">
                {selectedKiln.location}
              </Tag>
              <Tag icon={<CalendarOutlined />} color="green">
                {selectedKiln.history}
              </Tag>
            </div>
            <Paragraph style={{ fontSize: 15, color: '#333', marginBottom: 24 }}>
              {selectedKiln.description}
            </Paragraph>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ color: '#8B4513', fontSize: 16 }}>特色工艺：</Text>
              <div style={{ marginTop: 8 }}>
                {selectedKiln.specialties?.map((item, i) => (
                  <Tag key={i} color="brown" style={{ fontSize: 14, padding: '4px 12px' }}>
                    {item}
                  </Tag>
                ))}
              </div>
            </div>
            <div>
              <Text strong style={{ color: '#8B4513', fontSize: 16 }}>代表作品：</Text>
              <ul style={{ marginTop: 12, paddingLeft: 24 }}>
                {selectedKiln.famousWorks?.map((work, i) => (
                  <li key={i} style={{ marginBottom: 8, fontSize: 15 }}>{work}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default KilnCulture
