import React, { useState, useMemo } from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Input,
  Select,
  Space,
  Button,
  Tag,
} from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import CourseCard from '@/components/common/CourseCard'
import EmptyState from '@/components/common/EmptyState'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

const Courses = () => {
  const { courses } = useSelector((state) => state.course)
  const { learningRecords, currentUser } = useSelector((state) => state.learning)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [sortBy, setSortBy] = useState('default')

  const categories = [
    { value: 'all', label: '全部分类' },
    { value: 'skill', label: '技能类' },
    { value: 'management', label: '管理类' },
    { value: 'compliance', label: '合规类' },
  ]

  const levels = [
    { value: 'all', label: '全部难度' },
    { value: 'beginner', label: '初级' },
    { value: 'intermediate', label: '中级' },
    { value: 'advanced', label: '高级' },
  ]

  const sortOptions = [
    { value: 'default', label: '默认排序' },
    { value: 'rating', label: '评分最高' },
    { value: 'students', label: '学习人数' },
    { value: 'newest', label: '最新发布' },
  ]

  const getProgress = (courseId) => {
    const record = learningRecords.find(
      (r) => r.courseId === courseId && r.userId === currentUser?.id
    )
    return record?.progress || 0
  }

  const filteredCourses = useMemo(() => {
    let result = [...courses]

    if (searchText) {
      const lowerSearch = searchText.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(lowerSearch) ||
          c.description.toLowerCase().includes(lowerSearch) ||
          c.instructor.toLowerCase().includes(lowerSearch)
      )
    }

    if (categoryFilter !== 'all') {
      result = result.filter((c) => c.category === categoryFilter)
    }

    if (levelFilter !== 'all') {
      result = result.filter((c) => c.level === levelFilter)
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'students':
        result.sort((a, b) => b.students - a.students)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      default:
        break
    }

    return result
  }, [courses, searchText, categoryFilter, levelFilter, sortBy])

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ marginBottom: '4px' }}>
          课程学习
        </Title>
        <Text type="secondary">探索优质课程，开启学习之旅</Text>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="搜索课程名称、讲师..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={16}>
            <Space wrap size={12}>
              <Space size={8}>
                <FilterOutlined />
                <Text type="secondary">筛选：</Text>
              </Space>
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 140 }}
              >
                {categories.map((cat) => (
                  <Option key={cat.value} value={cat.value}>
                    {cat.label}
                  </Option>
                ))}
              </Select>
              <Select
                value={levelFilter}
                onChange={setLevelFilter}
                style={{ width: 120 }}
              >
                {levels.map((level) => (
                  <Option key={level.value} value={level.value}>
                    {level.label}
                  </Option>
                ))}
              </Select>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 140 }}
              >
                {sortOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ marginBottom: '16px' }}>
        <Space size={8}>
          <Text type="secondary">找到 {filteredCourses.length} 个课程</Text>
          {searchText && (
            <Tag color="blue">关键词：{searchText}</Tag>
          )}
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={course.id}>
              <CourseCard
                course={course}
                progress={getProgress(course.id)}
                showProgress={getProgress(course.id) > 0}
              />
            </Col>
          ))
        ) : (
          <Col span={24}>
            <EmptyState
              description="没有找到符合条件的课程"
              actionText="清除筛选"
              onAction={() => {
                setSearchText('')
                setCategoryFilter('all')
                setLevelFilter('all')
                setSortBy('default')
              }}
            />
          </Col>
        )}
      </Row>
    </div>
  )
}

export default Courses
