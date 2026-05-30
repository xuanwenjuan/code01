import React, { useEffect, useState } from 'react'
import { Layout, Row, Col, Typography, Button, Carousel, Tabs, Tag, Space, Select, Input } from 'antd'
import {
  FireOutlined,
  RightOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPapers } from '../../store/slices/paperSlice'
import { fetchSkills } from '../../store/slices/skillSlice'
import Loading from '../../components/Loading'
import PaperCard from '../../components/PaperCard'
import SkillCard from '../../components/SkillCard'

const { Content } = Layout
const { Title, Paragraph } = Typography
const { TabPane } = Tabs
const { Option } = Select

const Home = () => {
  const dispatch = useDispatch()
  const { list: papers, categories, loading: papersLoading } = useSelector(
    (state) => state.papers
  )
  const { list: skills, loading: skillsLoading } = useSelector((state) => state.skills)

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    dispatch(fetchPapers({ isFeatured: true }))
    dispatch(fetchSkills({ isRecommended: true }))
  }, [dispatch])

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    const filters = { isFeatured: true }
    if (value) {
      filters.categoryId = value
    }
    if (searchKeyword) {
      filters.keyword = searchKeyword
    }
    dispatch(fetchPapers(filters))
  }

  const handleSearch = (value) => {
    setSearchKeyword(value)
    const filters = { isFeatured: true }
    if (selectedCategory) {
      filters.categoryId = selectedCategory
    }
    if (value) {
      filters.keyword = value
    }
    dispatch(fetchPapers(filters))
  }

  const handleTabChange = (key) => {
    setActiveTab(key)
    if (key === 'xuanzhi') {
      dispatch(fetchPapers({ isXuanzhi: true }))
    } else if (key === 'featured') {
      dispatch(fetchPapers({ isFeatured: true }))
    } else {
      dispatch(fetchPapers({ isFeatured: true }))
    }
  }

  const carouselImages = [
    {
      url: 'https://images.unsplash.com/photo-1596487169606-ca8054f2c9ed?w=1200&h=400&fit=crop',
      title: '千年宣纸 匠心传承',
      subtitle: '探索古法造纸的奥秘',
    },
    {
      url: 'https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=1200&h=400&fit=crop',
      title: '竹影书香 纸韵悠长',
      subtitle: '品味传统技艺之美',
    },
    {
      url: 'https://images.unsplash.com/photo-1605814251066-5e434e7474e8?w=1200&h=400&fit=crop',
      title: '桑皮古纸 非遗瑰宝',
      subtitle: '传承千年的手工技艺',
    },
  ]

  if (papersLoading && skillsLoading) {
    return <Loading />
  }

  return (
    <Layout style={{ background: '#f5f0e8' }}>
      <Content>
        {/* 轮播图 */}
        <Carousel autoplay effect="fade" style={{ maxHeight: '400px', overflow: 'hidden' }}>
          {carouselImages.map((item, index) => (
            <div key={index}>
              <div
                style={{
                  height: '400px',
                  background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${item.url}) center/cover no-repeat`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#fff',
                }}
              >
                <Title style={{ color: '#fff', fontSize: '48px', marginBottom: '16px' }}>
                  {item.title}
                </Title>
                <Paragraph style={{ color: '#fff', fontSize: '20px', marginBottom: 0 }}>
                  {item.subtitle}
                </Paragraph>
              </div>
            </div>
          ))}
        </Carousel>

        <div className="page-container">
          {/* 品类筛选区 */}
          <div
            className="paper-bg"
            style={{
              padding: '32px',
              borderRadius: '12px',
              marginBottom: '32px',
            }}
          >
            <Space style={{ marginBottom: '24px', width: '100%', justifyContent: 'space-between' }}>
              <Title level={3} style={{ marginBottom: 0, color: '#8B6914' }}>
                <FilterOutlined style={{ marginRight: '8px' }} />
                纸品品类筛选
              </Title>
              <Input.Search
                placeholder="搜索纸品名称..."
                allowClear
                enterButton
                size="large"
                onSearch={handleSearch}
                style={{ width: '300px' }}
                prefix={<SearchOutlined />}
              />
            </Space>

            <Space wrap size="middle" style={{ marginBottom: '24px' }}>
              <Button
                type={!selectedCategory ? 'primary' : 'default'}
                onClick={() => handleCategoryChange(null)}
              >
                全部
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  type={selectedCategory === cat.id ? 'primary' : 'default'}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </Space>

            {papersLoading ? (
              <Loading tip="加载纸品中..." size="default" />
            ) : (
              <Row gutter={[16, 16]}>
                {papers.slice(0, 4).map((paper) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={paper.id}>
                    <PaperCard paper={paper} />
                  </Col>
                ))}
              </Row>
            )}
          </div>

          {/* 专区展示 */}
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <Title level={3} style={{ marginBottom: 0 }}>
                <FireOutlined style={{ color: '#faad14', marginRight: '8px' }} />
                特色专区
              </Title>
            </div>

            <Tabs activeKey={activeTab} onChange={handleTabChange} size="large">
              <TabPane
                tab={
                  <span>
                    <span role="img" aria-label="xuanzhi">
                      📜
                    </span>
                    古法宣纸专区
                  </span>
                }
                key="xuanzhi"
              >
                {papersLoading ? (
                  <Loading tip="加载中..." size="default" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {papers
                      .filter((p) => p.isXuanzhi)
                      .slice(0, 4)
                      .map((paper) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={paper.id}>
                          <PaperCard paper={paper} />
                        </Col>
                      ))}
                  </Row>
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <span role="img" aria-label="featured">
                      ✨
                    </span>
                    特色纸品专区
                  </span>
                }
                key="featured"
              >
                {papersLoading ? (
                  <Loading tip="加载中..." size="default" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {papers
                      .filter((p) => p.isFeatured)
                      .slice(0, 4)
                      .map((paper) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={paper.id}>
                          <PaperCard paper={paper} />
                        </Col>
                      ))}
                  </Row>
                )}
              </TabPane>
            </Tabs>
          </div>

          {/* 造纸技艺案例推荐 */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <Title level={3} style={{ marginBottom: 0 }}>
                <span role="img" aria-label="star">
                  ⭐
                </span>
                造纸技艺案例推荐
              </Title>
              <Button type="link" href="#/skills">
                查看更多 <RightOutlined />
              </Button>
            </div>

            {skillsLoading ? (
              <Loading tip="加载技艺中..." size="default" />
            ) : (
              <Row gutter={[16, 16]}>
                {skills.slice(0, 4).map((skill) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={skill.id}>
                    <SkillCard skill={skill} />
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default Home
