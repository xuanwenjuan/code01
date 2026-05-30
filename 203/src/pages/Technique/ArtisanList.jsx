import { useEffect } from 'react'
import { Row, Col, Typography } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { fetchArtisans } from '@/store/slices/artisanSlice'
import ArtisanCard from '@/components/ArtisanCard'
import Loading from '@/components/Loading'
import Empty from '@/components/Empty'

const { Title } = Typography

const ArtisanList = () => {
  const dispatch = useDispatch()
  const { list } = useSelector(state => state.artisans)
  const { loading } = useSelector(state => state.ui)

  useEffect(() => {
    if (list.length === 0) {
      dispatch(fetchArtisans())
    }
  }, [dispatch, list.length])

  if (loading) return <Loading />

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '32px' }}>非遗传承人</Title>

      {list.length > 0 ? (
        <Row gutter={[24, 24]}>
          {list.map(artisan => (
            <Col key={artisan.id} xs={24} sm={12} md={8}>
              <ArtisanCard artisan={artisan} />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="暂无传承人信息" />
      )}
    </div>
  )
}

export default ArtisanList
