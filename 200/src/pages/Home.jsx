import { useEffect, useMemo } from 'react'
import { Row, Col, Carousel, Button, Segmented, Card, Tag } from 'antd'
import {
  AppstoreOutlined,
  CrownOutlined,
  BulbOutlined,
  HomeOutlined,
  BuildOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchMortises, setCategory } from '@/store/slices/mortiseSlice'
import { addBrowsingHistory } from '@/store/slices/userSlice'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import MortiseCard from '@/components/MortiseCard'
import DesignerCard from '@/components/DesignerCard'
import { classicMortises, innovativeMortises, allMortises } from '@/mock/mortises'
import { designers } from '@/mock/users'

const iconMap = {
  AppstoreOutlined: <AppstoreOutlined />,
  CrownOutlined: <CrownOutlined />,
  BulbOutlined: <BulbOutlined />,
  HomeOutlined: <HomeOutlined />,
  BuildOutlined: <BuildOutlined />
}

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { list, categories, currentCategory, loading } = useSelector(state => state.mortise)

  useEffect(() => {
    dispatch(fetchMortises(currentCategory))
  }, [currentCategory, dispatch])

  const handleCategoryChange = (value) => {
    dispatch(setCategory(value))
  }

  const topDesigners = useMemo(() => {
    return [...designers].sort((a, b) => b.followers - a.followers).slice(0, 4)
  }, [])

  const featuredMortises = useMemo(() => {
    return [...allMortises].sort((a, b) => b.views - a.views).slice(0, 4)
  }, [])

  const handleMortiseClick = (mortise) => {
    dispatch(addBrowsingHistory({ id: mortise.id, name: mortise.name }))
    navigate(`/mortise/${mortise.id}`)
  }

  const bannerData = [
    {
      title: '传统榫卯，千年智慧',
      subtitle: '探索中国古代工匠的精湛技艺',
      bg: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
      action: () => handleCategoryChange('classic')
    },
    {
      title: '创新榫卯，现代演绎',
      subtitle: '传统技艺与现代设计的完美融合',
      bg: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
      action: () => handleCategoryChange('innovative')
    },
    {
      title: '数字化传承',
      subtitle: '让古老技艺在数字时代焕发新生',
      bg: 'linear-gradient(135deg, #52c41a 0%, #13c2c2 100%)',
      action: () => navigate('/category/innovative')
    }
  ]

  if (loading) {
    return <Loading />
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100%' }}>
      <div style={{ background: '#fff', padding: '24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Carousel autoplay effect="fade" style={{ borderRadius: 12, overflow: 'hidden' }}>
            {bannerData.map((banner, index) => (
              <div key={index}>
                <div
                  style={{
                    height: 320,
                    background: banner.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    textAlign: 'center',
                    padding: '0 40px'
                  }}
                >
                  <h1 style={{ color: '#fff', fontSize: 36, marginBottom: 16, fontWeight: 'bold' }}>
                    {banner.title}
                  </h1>
                  <p style={{ fontSize: 18, marginBottom: 24, opacity: 0.9 }}>
                    {banner.subtitle}
                  </p>
                  <Button type="primary" size="large" onClick={banner.action}>
                    立即探索 <ArrowRightOutlined />
                  </Button>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span>榫卯品类</span>
            <Button type="link" onClick={() => handleCategoryChange('all')}>
              查看全部 <ArrowRightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {categories.map(cat => (
              <Col xs={12} sm={8} md={4} key={cat.id}>
                <Card
                  hoverable
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: currentCategory === cat.id ? '2px solid #1890ff' : '1px solid #f0f0f0'
                  }}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <div style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }}>
                    {iconMap[cat.icon]}
                  </div>
                  <div style={{ fontWeight: 500 }}>{cat.name}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span>
              <CrownOutlined style={{ color: '#faad14', marginRight: 8 }} />
              经典榫卯专区
            </span>
            <Button type="link" onClick={() => handleCategoryChange('classic')}>
              更多经典 <ArrowRightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {classicMortises.slice(0, 4).map(mortise => (
              <Col xs={24} sm={12} md={6} key={mortise.id}>
                <MortiseCard mortise={mortise} />
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span>
              <BulbOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              创新榫卯专区
            </span>
            <Button type="link" onClick={() => handleCategoryChange('innovative')}>
              更多创新 <ArrowRightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {innovativeMortises.slice(0, 3).map(mortise => (
              <Col xs={24} sm={12} md={8} key={mortise.id}>
                <MortiseCard mortise={mortise} />
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span>
              <BuildOutlined style={{ color: '#722ed1', marginRight: 8 }} />
              精选设计案例
            </span>
            <Button type="link">查看全部案例 <ArrowRightOutlined /></Button>
          </div>
          <Row gutter={[16, 16]}>
            {featuredMortises.map(mortise => (
              <Col xs={24} sm={12} md={6} key={mortise.id}>
                <MortiseCard mortise={mortise} />
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span>
              <CrownOutlined style={{ color: '#faad14', marginRight: 8 }} />
              人气设计师
            </span>
            <Button type="link">更多设计师 <ArrowRightOutlined /></Button>
          </div>
          <Row gutter={[16, 16]}>
            {topDesigners.map(designer => (
              <Col xs={24} sm={12} md={6} key={designer.id}>
                <DesignerCard designer={designer} />
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 20 }}>
            按品类浏览
          </div>
          <Segmented
            block
            options={categories.map(c => ({ label: c.name, value: c.id }))}
            value={currentCategory}
            onChange={handleCategoryChange}
            style={{ marginBottom: 24 }}
          />
          {list.length > 0 ? (
            <Row gutter={[16, 16]}>
              {list.map(mortise => (
                <Col xs={24} sm={12} md={6} lg={6} key={mortise.id}>
                  <MortiseCard mortise={mortise} />
                </Col>
              ))}
            </Row>
          ) : (
            <EmptyState description="该分类下暂无榫卯设计" />
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
