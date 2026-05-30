import { useEffect, useState } from 'react'
import {
  Row, Col, Typography, Tabs, Card, Avatar, Button, Menu, Tag,
  Empty, Checkbox, Popconfirm, Select, Space, message
} from 'antd'
import {
  HeartOutlined, DeleteOutlined, UserOutlined, BookOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTypes } from '@/store/slices/typeSlice'
import { fetchWorks } from '@/store/slices/workSlice'
import {
  toggleFavoriteType, toggleFavoriteWork,
  batchRemoveFavoriteTypes, batchRemoveFavoriteWorks,
  logout
} from '@/store/slices/userSlice'
import TypeCard from '@/components/TypeCard'
import WorkCard from '@/components/WorkCard'
import Loading from '@/components/Loading'

const { Title } = Typography
const { Option } = Select

const Favorites = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { currentUser, role, favorites } = useSelector(state => state.user)
  const { list: types } = useSelector(state => state.types)
  const { list: works } = useSelector(state => state.works)
  const { loading } = useSelector(state => state.ui)

  const [activeTab, setActiveTab] = useState('types')
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedWorks, setSelectedWorks] = useState([])
  const [selectAllTypes, setSelectAllTypes] = useState(false)
  const [selectAllWorks, setSelectAllWorks] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchTypes())
    dispatch(fetchWorks())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const favoriteTypes = types.filter(t => favorites.types.includes(t.id))
  const favoriteWorks = works.filter(w => favorites.works.includes(w.id))

  const filteredFavoriteTypes = favoriteTypes.filter(t => {
    if (categoryFilter === 'all') return true
    return t.category === categoryFilter
  })

  const filteredFavoriteWorks = favoriteWorks.filter(w => {
    if (typeFilter === 'all') return true
    return w.type === typeFilter
  })

  const handleSelectType = (id) => {
    setSelectedTypes(prev => {
      if (prev.includes(id)) {
        return prev.filter(tid => tid !== id)
      }
      return [...prev, id]
    })
  }

  const handleSelectWork = (id) => {
    setSelectedWorks(prev => {
      if (prev.includes(id)) {
        return prev.filter(wid => wid !== id)
      }
      return [...prev, id]
    })
  }

  const handleSelectAllTypes = () => {
    if (selectAllTypes) {
      setSelectedTypes([])
      setSelectAllTypes(false)
    } else {
      setSelectedTypes(filteredFavoriteTypes.map(t => t.id))
      setSelectAllTypes(true)
    }
  }

  const handleSelectAllWorks = () => {
    if (selectAllWorks) {
      setSelectedWorks([])
      setSelectAllWorks(false)
    } else {
      setSelectedWorks(filteredFavoriteWorks.map(w => w.id))
      setSelectAllWorks(true)
    }
  }

  const handleBatchDeleteTypes = () => {
    if (selectedTypes.length === 0) {
      message.warning('请先选择要取消收藏的活字')
      return
    }
    dispatch(batchRemoveFavoriteTypes(selectedTypes))
    setSelectedTypes([])
    setSelectAllTypes(false)
    message.success(`已取消收藏 ${selectedTypes.length} 个活字`)
  }

  const handleBatchDeleteWorks = () => {
    if (selectedWorks.length === 0) {
      message.warning('请先选择要取消收藏的作品')
      return
    }
    dispatch(batchRemoveFavoriteWorks(selectedWorks))
    setSelectedWorks([])
    setSelectAllWorks(false)
    message.success(`已取消收藏 ${selectedWorks.length} 个作品`)
  }

  const categories = [...new Set(types.map(t => t.category))]
  const workTypes = [...new Set(works.map(w => w.type))]

  const menuItems = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/profile')
    },
    {
      key: '/profile/favorites',
      icon: <HeartOutlined />,
      label: `我的收藏 (${favorites.types.length + favorites.works.length})`,
      onClick: () => navigate('/profile/favorites')
    },
    {
      key: '/profile/history',
      icon: <BookOutlined />,
      label: `浏览记录`,
      onClick: () => navigate('/profile/history')
    }
  ]

  const tabItems = [
    {
      key: 'types',
      label: `活字收藏 (${favoriteTypes.length})`,
      children: (
        <>
          {favoriteTypes.length > 0 ? (
            <>
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                background: '#f9f9f9',
                borderRadius: '8px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center'
              }}>
                <Checkbox
                  checked={selectAllTypes}
                  onChange={handleSelectAllTypes}
                >
                  全选
                </Checkbox>

                <Select
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  style={{ width: 150 }}
                  size="small"
                >
                  <Option value="all">全部品类</Option>
                  {categories.map(cat => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
                </Select>

                <Button
                  type="primary"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDeleteTypes}
                  disabled={selectedTypes.length === 0}
                >
                  批量取消 ({selectedTypes.length})
                </Button>
              </div>

              {filteredFavoriteTypes.length > 0 ? (
                <Row gutter={[24, 24]}>
                  {filteredFavoriteTypes.map(type => (
                    <Col key={type.id} xs={24} sm={12} md={8}>
                      <div style={{ position: 'relative' }}>
                        <Checkbox
                          checked={selectedTypes.includes(type.id)}
                          onChange={() => handleSelectType(type.id)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            zIndex: 10,
                            background: 'rgba(255,255,255,0.9)',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                        />
                        <TypeCard type={type} />
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="没有符合条件的活字" />
              )}
            </>
          ) : (
            <Empty description="暂无收藏的活字" />
          )}
        </>
      )
    },
    {
      key: 'works',
      label: `作品收藏 (${favoriteWorks.length})`,
      children: (
        <>
          {favoriteWorks.length > 0 ? (
            <>
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                background: '#f9f9f9',
                borderRadius: '8px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center'
              }}>
                <Checkbox
                  checked={selectAllWorks}
                  onChange={handleSelectAllWorks}
                >
                  全选
                </Checkbox>

                <Select
                  value={typeFilter}
                  onChange={setTypeFilter}
                  style={{ width: 150 }}
                  size="small"
                >
                  <Option value="all">全部类型</Option>
                  {workTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>

                <Button
                  type="primary"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDeleteWorks}
                  disabled={selectedWorks.length === 0}
                >
                  批量取消 ({selectedWorks.length})
                </Button>
              </div>

              {filteredFavoriteWorks.length > 0 ? (
                <Row gutter={[24, 24]}>
                  {filteredFavoriteWorks.map(work => (
                    <Col key={work.id} xs={24} sm={12} md={8}>
                      <div style={{ position: 'relative' }}>
                        <Checkbox
                          checked={selectedWorks.includes(work.id)}
                          onChange={() => handleSelectWork(work.id)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            zIndex: 10,
                            background: 'rgba(255,255,255,0.9)',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                        />
                        <WorkCard work={work} />
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="没有符合条件的作品" />
              )}
            </>
          ) : (
            <Empty description="暂无收藏的作品" />
          )}
        </>
      )
    }
  ]

  if (loading) return <Loading />

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={6}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar size={100} src={currentUser?.avatar} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: '16px', marginBottom: '8px' }}>
                {currentUser?.name}
              </Title>
              <Tag color={role === 'admin' ? 'red' : 'blue'}>
                {role === 'admin' ? '平台管理员' : '木活字印刷研究者'}
              </Tag>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{ border: 'none' }}
            />
            <Button
              danger
              block
              icon={<DeleteOutlined />}
              onClick={handleLogout}
              style={{ marginTop: '16px' }}
            >
              退出登录
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={18}>
          <Card title="我的收藏">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Favorites
