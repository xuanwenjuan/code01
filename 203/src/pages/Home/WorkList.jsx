import { useEffect, useState } from 'react'
import { Row, Col, Input, Select, Pagination, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchWorks } from '@/store/slices/workSlice'
import WorkCard from '@/components/WorkCard'
import Loading from '@/components/Loading'
import Empty from '@/components/Empty'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const WorkList = () => {
  const dispatch = useDispatch()
  const { list } = useSelector(state => state.works)
  const { loading } = useSelector(state => state.ui)
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 9

  useEffect(() => {
    if (list.length === 0) {
      dispatch(fetchWorks())
    }
  }, [dispatch, list.length])

  const types = [...new Set(list.map(w => w.type))]
  let filteredList = list
  if (keyword) {
    filteredList = filteredList.filter(w =>
      w.title.includes(keyword) || w.description.includes(keyword) || w.artisan.includes(keyword)
    )
  }
  if (type && type !== 'all') {
    filteredList = filteredList.filter(w => w.type === type)
  }

  const paginatedList = filteredList.slice((page - 1) * pageSize, page * pageSize)

  if (loading) return <Loading />

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '32px' }}>印刷作品</Title>

      <div style={{ marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Search
          placeholder="搜索作品名称、描述或传承人"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          style={{ width: 350 }}
          onSearch={value => {
            setKeyword(value)
            setPage(1)
          }}
        />
        <Select
          placeholder="作品类型"
          allowClear
          size="large"
          style={{ width: 160 }}
          value={type === 'all' ? undefined : type}
          onChange={value => {
            setType(value || 'all')
            setPage(1)
          }}
        >
          <Option value="all">全部类型</Option>
          {types.map(t => (
            <Option key={t} value={t}>{t}</Option>
          ))}
        </Select>
      </div>

      {paginatedList.length > 0 ? (
        <>
          <Row gutter={[24, 24]}>
            {paginatedList.map(work => (
              <Col key={work.id} xs={24} sm={12} md={8}>
                <WorkCard work={work} />
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
        <Empty description="没有找到相关作品" />
      )}
    </div>
  )
}

export default WorkList
