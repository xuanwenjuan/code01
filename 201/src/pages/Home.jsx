import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Carousel, Input, Select, Button, Space, Tabs, Card, Avatar, Typography, Tag } from 'antd'
import { SearchOutlined, EnvironmentOutlined, FireOutlined, UserOutlined } from '@ant-design/icons'
import { fetchPigments, setFilters } from '@/store/slices/pigmentSlice'
import { fetchBanners, fetchCases } from '@/store/slices/contentSlice'
import PigmentCard from '@/components/PigmentCard'
import CaseCard from '@/components/CaseCard'
import Loading from '@/components/common/Loading'
import EmptyData from '@/components/common/EmptyData'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography
const { Search } = Input
const { Option } = Select

const colorOptions = ['全部颜色', '蓝色', '绿色', '红色', '褐色', '玫红色', '橙色', '黄色', '白色', '黑色']

function Home() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list, loading, error, filters } = useSelector(state => state.pigment)
  const { banners, cases } = useSelector(state => state.content)
  const [activeTab, setActiveTab] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    dispatch(fetchBanners())
    dispatch(fetchCases())
  }, [dispatch])

  useEffect(() => {
    loadPigments()
  }, [filters])

  const loadPigments = () => {
    dispatch(fetchPigments(filters))
  }

  const handleSearch = (value) => {
    dispatch(setFilters({ keyword: value }))
    setSearchKeyword(value)
  }

  const handleCategoryChange = (key) => {
    setActiveTab(key)
    if (key === 'all') {
      dispatch(setFilters({ category: '' }))
    } else {
      dispatch(setFilters({ category: key }))
    }
  }

  const handleColorChange = (value) => {
    dispatch(setFilters({ colorName: value === '全部颜色' ? '' : value }))
  }

  const tabItems = [
    { key: 'all', label: '全部颜料' },
    { key: 'natural', label: '天然矿物颜料' },
    { key: 'compound', label: '古法调配颜料' }
  ]

  const naturalPigments = list.filter(p => p.category === 'natural').slice(0, 4)
  const compoundPigments = list.filter(p => p.category === 'compound').slice(0, 4)
  const hotPigments = list.filter(p => p.isHot).slice(0, 4)

  return (
    <div>
      <Carousel autoplay effect="fade" style={{ marginBottom: 40 }}>
        {banners.map(banner => (
          <div key={banner.id}>
            <div
              style={{
                height: 400,
                backgroundImage: `url(${banner.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.4)'
              }} />
              <div style={{
                position: 'relative',
                zIndex: 1,
                textAlign: 'center',
                color: '#fff'
              }}>
                <Title level={1} style={{ color: '#fff', marginBottom: 16, fontSize: 42 }}>
                  {banner.title}
                </Title>
                <Paragraph style={{ color: '#ddd', fontSize: 18, marginBottom: 24 }}>
                  {banner.subtitle}
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  style={{ background: '#c9a96e', borderColor: '#c9a96e' }}
                  onClick={() => navigate(banner.link)}
                >
                  立即探索
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
        <Card
          style={{
            marginBottom: 40,
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)'
          }}
          bodyStyle={{ padding: 30 }}
        >
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Title level={4} style={{ margin: 0, color: '#5D4037' }}>
                探索传统矿物颜料
              </Title>
            </Col>
            <Col xs={24} sm={12} md={10}>
              <Search
                placeholder="搜索颜料名称、描述..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                size="large"
                defaultValue="全部颜色"
                style={{ width: '100%' }}
                onChange={handleColorChange}
              >
                {colorOptions.map(color => (
                  <Option key={color} value={color}>{color}</Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        <div style={{ marginBottom: 40 }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>颜料品类</span>
            <Tag icon={<FireOutlined />} color="red">共 {list.length} 种颜料</Tag>
          </div>
          <Tabs
            activeKey={activeTab}
            items={tabItems}
            onChange={handleCategoryChange}
            style={{ marginBottom: 24 }}
            size="large"
          />
          {loading ? (
            <Loading />
          ) : error ? (
            <div style={{ color: 'red', textAlign: 'center', padding: 40 }}>{error}</div>
          ) : list.length === 0 ? (
            <EmptyData description="没有找到符合条件的颜料" />
          ) : (
            <Row gutter={[24, 24]}>
              {list.map(pigment => (
                <Col key={pigment.id} xs={24} sm={12} md={8} lg={6}>
                  <PigmentCard pigment={pigment} />
                </Col>
              ))}
            </Row>
          )}
        </div>

        {naturalPigments.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div className="section-title">
              天然矿物颜料专区
              <span style={{ fontSize: 14, color: '#999', marginLeft: 12, fontWeight: 'normal' }}>
                源自天然矿石，历久弥新
              </span>
            </div>
            <Row gutter={[24, 24]}>
              {naturalPigments.map(pigment => (
                <Col key={pigment.id} xs={24} sm={12} md={8} lg={6}>
                  <PigmentCard pigment={pigment} />
                </Col>
              ))}
            </Row>
          </div>
        )}

        {compoundPigments.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div className="section-title">
              古法调配颜料专区
              <span style={{ fontSize: 14, color: '#999', marginLeft: 12, fontWeight: 'normal' }}>
                传统工艺，匠心调配
              </span>
            </div>
            <Row gutter={[24, 24]}>
              {compoundPigments.map(pigment => (
                <Col key={pigment.id} xs={24} sm={12} md={8} lg={6}>
                  <PigmentCard pigment={pigment} />
                </Col>
              ))}
            </Row>
          </div>
        )}

        {hotPigments.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div className="section-title">
              <Space>
                <span>热门颜料</span>
                <Tag icon={<FireOutlined />} color="red">热门</Tag>
              </Space>
            </div>
            <Row gutter={[24, 24]}>
              {hotPigments.map(pigment => (
                <Col key={pigment.id} xs={24} sm={12} md={8} lg={6}>
                  <PigmentCard pigment={pigment} />
                </Col>
              ))}
            </Row>
          </div>
        )}

        <div style={{ marginBottom: 40 }}>
          <div className="section-title">颜料应用案例推荐</div>
          <Row gutter={[24, 24]}>
            {cases.slice(0, 3).map(caseItem => (
              <Col key={caseItem.id} xs={24} md={8}>
                <CaseCard caseItem={caseItem} />
              </Col>
            ))}
          </Row>
        </div>

        <Card
          style={{
            borderRadius: 12,
            background: 'linear-gradient(135deg, #8B4513 0%, #5D4037 100%)',
            color: '#fff'
          }}
          bodyStyle={{ padding: 40, textAlign: 'center' }}
        >
          <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>
            传承千年匠心，探索色彩奥秘
          </Title>
          <Paragraph style={{ color: '#ddd', fontSize: 16, marginBottom: 24, maxWidth: 600, margin: '0 auto' }}>
            中国传统矿物颜料承载着千年的文化积淀，从敦煌壁画到千里江山图，
            这些天然的色彩见证了中华文明的辉煌。加入我们，一起探索这绚丽的色彩世界。
          </Paragraph>
          <Space size="large">
            <Button
              size="large"
              style={{ background: '#c9a96e', borderColor: '#c9a96e', color: '#fff' }}
              onClick={() => navigate('/pigment/1')}
            >
              开始探索
            </Button>
            <Button
              size="large"
              ghost
              onClick={() => navigate('/login')}
            >
              注册账号
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  )
}

export default Home
