import React, { useState, useEffect } from 'react'
import { Row, Col, Input, Select, Typography, Space, Button } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchWorks } from '@/store/slices/worksSlice'
import { mockCategories, mockTags } from '@/mock/data'
import WorkCard from '@/components/WorkCard'
import StatusHandler from '@/components/StatusHandler'

const { Title } = Typography
const { Option } = Select

const WorksList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [category, setCategory] = useState('all')
  const [tag, setTag] = useState('all')
  const { filteredWorks, status, error } = useSelector(state => state.works)
  const { currentUser } = useSelector(state => state.user)

  useEffect(() => {
    const filters = {}
    if (category !== 'all') filters.category = category
    if (searchText) filters.search = searchText
    dispatch(fetchWorks(filters))
  }, [dispatch, category, searchText])

  const filteredByTag = tag === 'all' 
    ? filteredWorks 
    : filteredWorks.filter(w => w.tags.includes(tag))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>作品展示</Title>
        {currentUser && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/creation')}>
            上传作品
          </Button>
        )}
      </div>
      
      <Space style={{ marginBottom: 24, width: '100%' }} wrap>
        <Input
          placeholder="搜索作品..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Select
          placeholder="选择品类"
          value={category}
          onChange={setCategory}
          style={{ width: 150 }}
        >
          <Option value="all">全部品类</Option>
          {mockCategories.map(cat => (
            <Option key={cat.id} value={cat.id}>{cat.name}</Option>
          ))}
        </Select>
        <Select
          placeholder="选择标签"
          value={tag}
          onChange={setTag}
          style={{ width: 150 }}
        >
          <Option value="all">全部标签</Option>
          {mockTags.map(t => (
            <Option key={t} value={t}>{t}</Option>
          ))}
        </Select>
      </Space>

      <StatusHandler status={status} error={error} data={filteredByTag}>
        <Row gutter={[16, 16]}>
          {filteredByTag.map(work => (
            <Col xs={24} sm={12} lg={6} key={work.id}>
              <WorkCard work={work} />
            </Col>
          ))}
        </Row>
      </StatusHandler>
    </div>
  )
}

export default WorksList
