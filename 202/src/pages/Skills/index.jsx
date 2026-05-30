import React, { useEffect, useState } from 'react'
import { Layout, Row, Col, Typography, Input, Select, Space, Pagination } from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSkills } from '../../store/slices/skillSlice'
import Loading from '../../components/Loading'
import SkillCard from '../../components/SkillCard'
import EmptyState from '../../components/EmptyState'

const { Content } = Layout
const { Title } = Typography
const { Option } = Select

const Skills = () => {
  const dispatch = useDispatch()
  const { list, loading } = useSelector((state) => state.skills)

  const [category, setCategory] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    loadSkills()
  }, [dispatch])

  const loadSkills = (filters = {}) => {
    dispatch(fetchSkills(filters))
    setCurrentPage(1)
  }

  const handleCategoryChange = (value) => {
    setCategory(value)
    const filters = {}
    if (value) {
      filters.category = value
    }
    if (keyword) {
      filters.keyword = keyword
    }
    loadSkills(filters)
  }

  const handleSearch = (value) => {
    setKeyword(value)
    const filters = {}
    if (category) {
      filters.category = category
    }
    if (value) {
      filters.keyword = value
    }
    loadSkills(filters)
  }

  const categories = [
    { value: '宣纸', label: '宣纸' },
    { value: '皮纸', label: '皮纸' },
    { value: '竹纸', label: '竹纸' },
    { value: '麻纸', label: '麻纸' },
    { value: '棉纸', label: '棉纸' },
    { value: '特色纸', label: '特色纸' },
  ]

  const paginatedList = list.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <Layout style={{ background: '#f5f0e8', minHeight: '100vh' }}>
      <Content className="page-container">
        <Title level={2} style={{ marginBottom: '24px', color: '#8B6914' }}>
          <span role="img" aria-label="books">
            📚
          </span>
          技艺档案库
        </Title>

        {/* 筛选栏 */}
        <div
          className="paper-bg"
          style={{
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          <Space wrap size="large" style={{ width: '100%' }}>
            <Space>
              <FilterOutlined style={{ fontSize: '18px', color: '#8B6914' }} />
              <span style={{ fontWeight: '500' }}>分类筛选：</span>
              <Select
                placeholder="全部类别"
                style={{ width: '160px' }}
                allowClear
                onChange={handleCategoryChange}
                value={category}
              >
                {categories.map((cat) => (
                  <Option key={cat.value} value={cat.value}>
                    {cat.label}
                  </Option>
                ))}
              </Select>
            </Space>

            <Input.Search
              placeholder="搜索技艺名称..."
              allowClear
              enterButton
              size="middle"
              onSearch={handleSearch}
              style={{ width: '300px' }}
              prefix={<SearchOutlined />}
            />
          </Space>
        </div>

        {/* 技艺列表 */}
        {loading ? (
          <Loading tip="加载技艺档案中..." />
        ) : paginatedList.length > 0 ? (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              {paginatedList.map((skill) => (
                <Col xs={24} sm={12} md={8} lg={6} key={skill.id}>
                  <SkillCard skill={skill} />
                </Col>
              ))}
            </Row>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={list.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total) => `共 ${total} 条技艺档案`}
              />
            </div>
          </>
        ) : (
          <EmptyState description="暂无符合条件的技艺档案" />
        )}
      </Content>
    </Layout>
  )
}

export default Skills
