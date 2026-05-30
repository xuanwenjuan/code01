import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Row, Col, Input, Select, Pagination } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { fetchIncenses, setCategory } from '@/store/slices/incenseSlice'
import IncenseCard from '@/components/IncenseCard'
import PageLoading from '@/components/PageLoading'
import PageEmpty from '@/components/PageEmpty'
import PageError from '@/components/PageError'
import { useState } from 'react'
import './index.css'

const { Search } = Input
const { Option } = Select

const IncenseList = () => {
  const dispatch = useDispatch()
  const { list, categories, currentCategory, status, error } = useSelector(state => state.incense)
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    dispatch(fetchIncenses(currentCategory))
  }, [dispatch, currentCategory])

  const handleCategoryChange = (value) => {
    dispatch(setCategory(value))
    setCurrentPage(1)
  }

  const handleSearch = (value) => {
    setSearchText(value)
    setCurrentPage(1)
  }

  const filteredList = list.filter(incense =>
    incense.name.includes(searchText) || incense.description.includes(searchText)
  )

  const paginatedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (status === 'loading') return <PageLoading />
  if (status === 'failed') return <PageError onRetry={() => dispatch(fetchIncenses(currentCategory))} />

  return (
    <div className="incense-list-page">
      <div className="list-header">
        <h1>香品列表</h1>
        <div className="list-filters">
          <div className="category-tabs">
            {categories.map(category => (
              <div
                key={category.id}
                className={`category-tab ${currentCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </div>
            ))}
          </div>
          <Search
            placeholder="搜索香品名称或描述"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </div>
      </div>

      {filteredList.length === 0 ? (
        <PageEmpty description="暂无符合条件的香品" />
      ) : (
        <>
          <Row gutter={[24, 24]} className="incense-grid">
            {paginatedList.map(incense => (
              <Col key={incense.id} xs={24} sm={12} md={8} lg={6}>
                <IncenseCard incense={incense} />
              </Col>
            ))}
          </Row>

          <div className="pagination-wrapper">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredList.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total) => `共 ${total} 件香品`}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default IncenseList
