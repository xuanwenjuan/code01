import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Layout,
  Menu,
  Card,
  Avatar,
  Button,
  List,
  Tag,
  Empty,
  Typography,
  Row,
  Col,
  Modal,
  message,
  Popconfirm,
  Checkbox,
  Select,
  Tabs,
  Statistic,
  Progress,
  Table,
  Space,
  Divider,
  Badge,
  Alert,
  List as AntList
} from 'antd'
import {
  UserOutlined,
  HeartOutlined,
  HistoryOutlined,
  TeamOutlined,
  SettingOutlined,
  DeleteOutlined,
  DownloadOutlined,
  BarChartOutlined,
  BellOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined as DownloadIcon
} from '@ant-design/icons'
import { toggleFavorite, toggleFollow, clearHistory, removeHistoryItem } from '@/store/slices/userSlice'
import { categories, mockIncenses } from '@/mock/incenses'
import { mockInheritors } from '@/mock/inheritors'
import { mockCraftCases } from '@/mock/craftCases'
import PageEmpty from '@/components/PageEmpty'
import './index.css'

const { Content, Sider } = Layout
const { Title, Text } = Typography
const { TabPane } = Tabs
const { Option } = Select

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.user.currentUser)
  const [selectedKey, setSelectedKey] = useState('favorites')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedHistoryItems, setSelectedHistoryItems] = useState([])
  const [downloadModalVisible, setDownloadModalVisible] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [selectedDownloadItems, setSelectedDownloadItems] = useState([])
  const [noticeVisible, setNoticeVisible] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: '/profile' } } })
    }
  }, [currentUser, navigate])

  if (!currentUser) return null

  const favorites = currentUser.favorites || []
  const following = currentUser.following || []
  const history = currentUser.history || []
  const likes = currentUser.likes || []

  const favoriteIncenses = mockIncenses.filter(i => favorites.includes(i.id))
  const filteredFavorites = categoryFilter === 'all'
    ? favoriteIncenses
    : favoriteIncenses.filter(i => i.category === categoryFilter)

  const followingInheritors = mockInheritors.filter(i => following.includes(i.id))
  const adminInheritors = followingInheritors
  const userInheritors = followingInheritors

  const historyItems = history.map(h => ({
    ...h,
    incense: mockIncenses.find(i => i.id === h.incenseId)
  })).filter(h => h.incense)

  const handleRemoveFavorite = (id) => {
    dispatch(toggleFavorite(id))
    message.success('已取消收藏')
  }

  const handleUnfollow = (id) => {
    dispatch(toggleFollow(id))
    message.success('已取消关注')
  }

  const handleClearHistory = () => {
    dispatch(clearHistory())
    setSelectedHistoryItems([])
    message.success('浏览记录已清空')
  }

  const handleHistoryItemSelect = (id) => {
    setSelectedHistoryItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id)
      }
      return [...prev, id]
    })
  }

  const handleSelectAllHistory = () => {
    if (selectedHistoryItems.length === historyItems.length) {
      setSelectedHistoryItems([])
    } else {
      setSelectedHistoryItems(historyItems.map(h => h.incenseId))
    }
  }

  const handleBatchDeleteHistory = () => {
    if (selectedHistoryItems.length === 0) {
      message.warning('请先选择要删除的记录')
      return
    }
    selectedHistoryItems.forEach(id => {
      dispatch(removeHistoryItem(id))
    })
    setSelectedHistoryItems([])
    message.success(`已删除 ${selectedHistoryItems.length} 条浏览记录`)
  }

  const handleDownload = () => {
    if (selectedDownloadItems.length === 0) {
      message.warning('请先选择要下载的素材')
      return
    }
    setDownloading(true)
    setDownloadProgress(0)
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setDownloading(false)
          setDownloadModalVisible(false)
          message.success(`成功下载 ${selectedDownloadItems.length} 个素材包`)
          setSelectedDownloadItems([])
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const downloadMaterials = [
    { id: 1, name: '沉香制作工艺图谱', size: '25.6MB', type: 'PDF' },
    { id: 2, name: '檀香品鉴指南', size: '18.2MB', type: 'PDF' },
    { id: 3, name: '传统和香配方大全', size: '32.1MB', type: 'PDF' },
    { id: 4, name: '香道器具使用教程', size: '45.8MB', type: '视频' },
    { id: 5, name: '历代香谱文献合集', size: '128.5MB', type: 'PDF' },
    { id: 6, name: '香道入门教学视频', size: '256.3MB', type: '视频' }
  ]

  const viewStatistics = [
    { name: '奇楠沉香', views: 1258, category: '沉香' },
    { name: '老山檀香', views: 986, category: '檀香' },
    { name: '古法和香·清越', views: 756, category: '合香' },
    { name: '海南沉香线香', views: 623, category: '沉香' },
    { name: '澳洲檀香盘香', views: 512, category: '檀香' }
  ]

  const newProducts = [
    { id: 101, name: '龙涎香合香新品', date: '2024-01-18' },
    { id: 102, name: '芽庄沉香礼盒', date: '2024-01-16' },
    { id: 103, name: '便携香道套装', date: '2024-01-15' }
  ]

  const menuItems = [
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: '我的收藏'
    },
    {
      key: 'following',
      icon: <TeamOutlined />,
      label: '我的关注'
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: '浏览记录'
    },
    {
      key: 'downloads',
      icon: <DownloadOutlined />,
      label: '素材下载'
    },
    ...(currentUser.role === 'admin' ? [
      {
        key: 'statistics',
        icon: <BarChartOutlined />,
        label: '数据统计'
      }
    ] : [])
  ]

  const statColumns = [
    {
      title: '香品名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '品类',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (text) => <span style={{ fontWeight: 600, color: '#d4af37' }}>{text}</span>,
      sorter: (a, b) => a.views - b.views
    }
  ]

  return (
    <div className="profile-page">
      {noticeVisible && (
        <Alert
          message="香道新品更新提醒"
          description={
            <div>
              <p>近期上新：</p>
              {newProducts.map(p => (
                <div key={p.id}>
                  <span style={{ marginRight: 12 }}>• {p.name}</span>
                  <Text type="secondary">{p.date}</Text>
                </div>
              ))}
            </div>
          }
          type="info"
          showIcon
          closable
          onClose={() => setNoticeVisible(false)}
          className="profile-notice"
        />
      )}

      <Layout className="profile-layout">
        <Sider width={240} className="profile-sider">
          <div className="profile-user-card">
            <Avatar src={currentUser.avatar} size={80} className="profile-avatar" />
            <Title level={4} className="profile-name">{currentUser.nickname}</Title>
            <Tag color={currentUser.role === 'admin' ? 'red' : 'blue'} className="profile-role">
              {currentUser.role === 'admin' ? '平台管理员' : '香道爱好者'}
            </Tag>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{favorites.length}</span>
                <span className="stat-label">收藏</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{following.length}</span>
                <span className="stat-label">关注</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{history.length}</span>
                <span className="stat-label">浏览</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{likes.length}</span>
                <span className="stat-label">点赞</span>
              </div>
            </div>
            {currentUser.role === 'admin' && (
              <Button type="primary" block style={{ marginTop: 16 }} onClick={() => navigate('/admin')}>
                进入管理后台
              </Button>
            )}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key)}
            className="profile-menu"
          />
        </Sider>
        <Content className="profile-content">
          {selectedKey === 'favorites' && (
            <Card
              title="我的收藏"
              className="profile-section"
              extra={
                <Select
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  style={{ width: 150 }}
                  placeholder="筛选品类"
                >
                  <Option value="all">全部品类</Option>
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </Option>
                  ))}
                </Select>
              }
            >
              {filteredFavorites.length === 0 ? (
                <PageEmpty description="暂无收藏的香品" />
              ) : (
                <>
                  <div className="filter-info">
                    <Text type="secondary">共 {filteredFavorites.length} 件收藏</Text>
                  </div>
                  <Row gutter={[24, 24]}>
                    {filteredFavorites.map(incense => (
                      <Col key={incense.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                          hoverable
                          cover={<img alt={incense.name} src={incense.coverImage} onClick={() => navigate(`/incense/${incense.id}`)} />}
                          actions={[
                            <Button type="link" onClick={() => navigate(`/incense/${incense.id}`)}>查看详情</Button>,
                            <Popconfirm
                              title="确定要取消收藏吗？"
                              onConfirm={() => handleRemoveFavorite(incense.id)}
                              okText="确定"
                              cancelText="取消"
                            >
                              <Button type="link" danger>取消收藏</Button>
                            </Popconfirm>
                          ]}
                        >
                          <Card.Meta
                            title={incense.name}
                            description={
                              <div>
                                <p style={{ color: '#f5222d', margin: 0 }}>¥{incense.price}</p>
                                <p style={{ color: '#999', margin: '4px 0 0' }}>{incense.origin}</p>
                                <Tag color="gold" style={{ marginTop: 4 }}>
                                  {categories.find(c => c.id === incense.category)?.name}
                                </Tag>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </Card>
          )}

          {selectedKey === 'following' && (
            <Card title="我的关注" className="profile-section">
              {followingInheritors.length === 0 ? (
                <PageEmpty description="暂无关注的传承人" />
              ) : (
                <>
                  <Tabs defaultActiveKey="all">
                    <TabPane tab="全部传承人" key="all">
                      <Row gutter={[24, 24]}>
                        {followingInheritors.map(inheritor => (
                          <Col key={inheritor.id} xs={24} sm={12} md={8}>
                            <Card className="inheritor-card">
                              <div className="inheritor-info">
                                <Avatar src={inheritor.avatar} size={64} />
                                <div className="inheritor-detail">
                                  <Title level={5}>{inheritor.name}</Title>
                                  <Tag color="gold">{inheritor.title}</Tag>
                                  <p className="inheritor-bio">{inheritor.description}</p>
                                  <div className="inheritor-stats">
                                    <span><AppstoreOutlined /> 作品 {mockIncenses.filter(i => i.inheritorId === inheritor.id).length}</span>
                                    <span><UserOutlined /> 粉丝 {Math.floor(Math.random() * 1000) + 100}</span>
                                  </div>
                                  <div className="inheritor-actions">
                                    <Button size="small" onClick={() => navigate('/incense')}>查看作品</Button>
                                    <Popconfirm
                                      title="确定要取消关注吗？"
                                      onConfirm={() => handleUnfollow(inheritor.id)}
                                      okText="确定"
                                      cancelText="取消"
                                    >
                                      <Button size="small" danger>取消关注</Button>
                                    </Popconfirm>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </TabPane>
                    {currentUser.role === 'admin' && (
                      <TabPane tab="认证传承人" key="admin">
                        <Row gutter={[24, 24]}>
                          {adminInheritors.map(inheritor => (
                            <Col key={inheritor.id} xs={24} sm={12} md={8}>
                              <Card className="inheritor-card" bordered>
                                <div className="inheritor-info">
                                  <Badge.Ribbon text="认证" color="gold">
                                    <Avatar src={inheritor.avatar} size={64} />
                                  </Badge.Ribbon>
                                  <div className="inheritor-detail">
                                    <Title level={5}>{inheritor.name}</Title>
                                    <Tag color="gold">{inheritor.title}</Tag>
                                    <p className="inheritor-bio">{inheritor.description}</p>
                                    <div className="inheritor-actions">
                                      <Button size="small" type="primary">编辑资料</Button>
                                      <Button size="small">管理作品</Button>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </TabPane>
                    )}
                  </Tabs>
                </>
              )}
            </Card>
          )}

          {selectedKey === 'history' && (
            <Card
              title="浏览记录"
              extra={
                historyItems.length > 0 && (
                  <Space>
                    <Checkbox
                      checked={selectedHistoryItems.length === historyItems.length && historyItems.length > 0}
                      onChange={handleSelectAllHistory}
                    >
                      全选
                    </Checkbox>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleBatchDeleteHistory}
                      disabled={selectedHistoryItems.length === 0}
                    >
                      批量删除 ({selectedHistoryItems.length})
                    </Button>
                    <Popconfirm
                      title="确定要清空所有浏览记录吗？"
                      onConfirm={handleClearHistory}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="text" danger>清空记录</Button>
                    </Popconfirm>
                  </Space>
                )
              }
              className="profile-section"
            >
              {historyItems.length === 0 ? (
                <PageEmpty description="暂无浏览记录" />
              ) : (
                <List
                  dataSource={historyItems}
                  renderItem={(item) => (
                    <List.Item
                      className="history-item"
                      onClick={() => navigate(`/incense/${item.incenseId}`)}
                      actions={[
                        <Checkbox
                          checked={selectedHistoryItems.includes(item.incenseId)}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleHistoryItemSelect(item.incenseId)
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<img src={item.incense.coverImage} alt={item.incense.name} className="history-thumb" />}
                        title={item.incense.name}
                        description={
                          <div>
                            <Text type="secondary">{item.incense.description}</Text>
                            <div style={{ marginTop: 4 }}>
                              <Tag color="blue">¥{item.incense.price}</Tag>
                              <Tag color="gold">{categories.find(c => c.id === item.incense.category)?.name}</Tag>
                              <Text type="secondary" style={{ marginLeft: 8 }}>浏览时间：{item.viewTime}</Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          )}

          {selectedKey === 'downloads' && (
            <Card
              title="制作素材下载"
              className="profile-section"
              extra={
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => setDownloadModalVisible(true)}
                >
                  批量下载
                </Button>
              }
            >
              <Row gutter={[16, 16]}>
                {downloadMaterials.map(material => (
                  <Col key={material.id} xs={24} sm={12} md={8}>
                    <Card className="download-card" hoverable>
                      <div className="download-icon">
                        <FileTextOutlined style={{ fontSize: 48, color: '#d4af37' }} />
                      </div>
                      <div className="download-info">
                        <h4>{material.name}</h4>
                        <div className="download-meta">
                          <Tag color={material.type === 'PDF' ? 'blue' : 'purple'}>{material.type}</Tag>
                          <Text type="secondary">{material.size}</Text>
                        </div>
                        <Button type="primary" size="small" icon={<DownloadOutlined />}>
                          下载
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {selectedKey === 'statistics' && currentUser.role === 'admin' && (
            <div className="statistics-page">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card">
                    <Statistic
                      title="总香品数"
                      value={mockIncenses.length}
                      prefix={<AppstoreOutlined />}
                      valueStyle={{ color: '#d4af37' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card">
                    <Statistic
                      title="总传承人"
                      value={mockInheritors.length}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card">
                    <Statistic
                      title="总案例数"
                      value={mockCraftCases.length}
                      prefix={<FileTextOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card">
                    <Statistic
                      title="总浏览量"
                      value={12580}
                      prefix={<BarChartOutlined />}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="香品浏览量排行" className="profile-section" style={{ marginTop: 24 }}>
                <Table
                  columns={statColumns}
                  dataSource={viewStatistics}
                  rowKey="name"
                  pagination={false}
                />
              </Card>

              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} md={12}>
                  <Card title="品类占比" className="profile-section">
                    {categories.filter(c => c.id !== 'all').map(cat => {
                      const count = mockIncenses.filter(i => i.category === cat.id).length
                      const percent = Math.round((count / mockIncenses.length) * 100)
                      return (
                        <div key={cat.id} className="category-stat">
                          <div className="category-stat-header">
                            <span>{cat.icon} {cat.name}</span>
                            <span>{count} 件</span>
                          </div>
                          <Progress percent={percent} showInfo={false} strokeColor="#d4af37" />
                        </div>
                      )
                    })}
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="技艺案例浏览量" className="profile-section">
                    <AntList
                      dataSource={mockCraftCases}
                      renderItem={(item, index) => (
                        <AntList.Item>
                          <AntList.Item.Meta
                            avatar={<span style={{ fontSize: 20, fontWeight: 600, color: index < 3 ? '#d4af37' : '#999' }}>{index + 1}</span>}
                            title={item.title}
                            description={`${item.popularity || Math.floor(Math.random() * 500) + 50} 次浏览`}
                          />
                        </AntList.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Content>
      </Layout>

      <Modal
        title="批量下载制作素材"
        open={downloadModalVisible}
        onCancel={() => {
          if (!downloading) {
            setDownloadModalVisible(false)
            setSelectedDownloadItems([])
          }
        }}
        footer={[
          <Button key="cancel" onClick={() => setDownloadModalVisible(false)} disabled={downloading}>
            取消
          </Button>,
          <Button key="download" type="primary" onClick={handleDownload} loading={downloading}>
            开始下载
          </Button>
        ]}
        width={600}
      >
        {downloading ? (
          <div className="download-progress">
            <Progress
              percent={downloadProgress}
              status={downloadProgress === 100 ? 'success' : 'active'}
              strokeColor="#d4af37"
            />
            <p style={{ textAlign: 'center', marginTop: 16, color: '#999' }}>
              正在下载 {selectedDownloadItems.length} 个素材...
            </p>
          </div>
        ) : (
          <div className="download-list">
            <Checkbox
              checked={selectedDownloadItems.length === downloadMaterials.length}
              onChange={() => {
                if (selectedDownloadItems.length === downloadMaterials.length) {
                  setSelectedDownloadItems([])
                } else {
                  setSelectedDownloadItems(downloadMaterials.map(m => m.id))
                }
              }}
              style={{ marginBottom: 16 }}
            >
              全选
            </Checkbox>
            {downloadMaterials.map(material => (
              <div
                key={material.id}
                className={`download-list-item ${selectedDownloadItems.includes(material.id) ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedDownloadItems(prev => {
                    if (prev.includes(material.id)) {
                      return prev.filter(id => id !== material.id)
                    }
                    return [...prev, material.id]
                  })
                }}
              >
                <Checkbox checked={selectedDownloadItems.includes(material.id)} />
                <FileTextOutlined className="list-icon" />
                <div className="list-info">
                  <span className="list-name">{material.name}</span>
                  <span className="list-meta">
                    <Tag color={material.type === 'PDF' ? 'blue' : 'purple'}>{material.type}</Tag>
                    {material.size}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Profile
