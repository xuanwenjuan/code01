import React, { useState, useEffect } from 'react'
import { Row, Col, Input, Select, Typography, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchTutorials } from '@/store/slices/tutorialsSlice'
import { mockCategories } from '@/mock/data'
import TutorialCard from '@/components/TutorialCard'
import StatusHandler from '@/components/StatusHandler'

const { Title } = Typography
const { Option } = Select

const TutorialsList = () => {
  const dispatch = useDispatch()
  const [searchText, setSearchText] = useState('')
  const [category, setCategory] = useState('all')
  const [level, setLevel] = useState('all')
  const { filteredTutorials, status, error } = useSelector(state => state.tutorials)

  useEffect(() => {
    const filters = {}
    if (category !== 'all') filters.category = category
    if (level !== 'all') filters.level = level
    if (searchText) filters.search = searchText
    dispatch(fetchTutorials(filters))
  }, [dispatch, category, level, searchText])

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>技艺教程</Title>
      
      <Space style={{ marginBottom: 24, width: '100%' }} wrap>
        <Input
          placeholder="搜索教程..."
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
          placeholder="难度等级"
          value={level}
          onChange={setLevel}
          style={{ width: 150 }}
        >
          <Option value="all">全部等级</Option>
          <Option value="入门">入门</Option>
          <Option value="中级">中级</Option>
          <Option value="高级">高级</Option>
        </Select>
      </Space>

      <StatusHandler status={status} error={error} data={filteredTutorials}>
        <Row gutter={[16, 16]}>
          {filteredTutorials.map(tutorial => (
            <Col xs={24} sm={12} lg={6} key={tutorial.id}>
              <TutorialCard tutorial={tutorial} />
            </Col>
          ))}
        </Row>
      </StatusHandler>
    </div>
  )
}

export default TutorialsList
