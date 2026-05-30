import { useEffect, useState } from 'react'
import { Row, Col, Input, Select, Pagination, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTypes, filterTypes } from '@/store/slices/typeSlice'
import TypeCard from '@/components/TypeCard'
import Loading from '@/components/Loading'
import Empty from '@/components/Empty'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const TypeList = () => {
  const dispatch = useDispatch()
  const { list, filteredList, categories } = useSelector(state => state.types)
  const { loading } = useSelector(state => state.ui)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('all')
  const [era, setEra] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    if (list.length === 0) {
      dispatch(fetchTypes())
    }
  }, [dispatch, list.length])

  useEffect(() => {
    dispatch(filterTypes({ category, keyword, era }))
    setPage(1)
  }, [category, keyword, era, dispatch])

  const eras = [...new Set(list.map(t => t.era))]
  const paginatedList = filteredList.slice((page - 1) * pageSize, page * pageSize)

  if (loading) return <Loading />

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '32px' }}>活字品类</Title>

      <div style={{ marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Search
          placeholder="搜索活字名称或描述"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          style={{ width: 300 }}
          onSearch={value => setKeyword(value)}
        />
        <Select
          placeholder="选择品类"
          allowClear
          size="large"
          style={{ width: 160 }}
          value={category === 'all' ? undefined : category}
          onChange={value => setCategory(value || 'all')}
        >
          <Option value="all">全部品类</Option>
          {categories.map(cat => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
        </Select>
        <Select
          placeholder="选择年代"
          allowClear
          size="large"
          style={{ width: 160 }}
          value={era === 'all' ? undefined : era}
          onChange={value => setEra(value || 'all')}
        >
          <Option value="all">全部年代</Option>
          {eras.map(e => (
            <Option key={e} value={e}>{e}</Option>
          ))}
        </Select>
      </div>

      {paginatedList.length > 0 ? (
        <>
          <Row gutter={[24, 24]}>
            {paginatedList.map(type => (
              <Col key={type.id} xs={24} sm={12} md={8} lg={6}>
                <TypeCard type={type} />
              </Col>
            ))}
          </Row>
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={filteredList.length}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <Empty description="没有找到相关活字品类" />
      )}
    </div>
  )
}

export default TypeList
