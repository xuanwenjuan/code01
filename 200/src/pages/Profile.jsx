import { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Row,
  Col,
  Card,
  Avatar,
  Tabs,
  List,
  Button,
  Tag,
  message,
  Popconfirm,
  Descriptions,
  Empty,
  Badge,
  Segmented,
  Checkbox,
  DatePicker,
  Select,
  Modal,
  Progress,
  Statistic,
  Table,
  Space,
  Tooltip,
  notification,
  Alert,
  Divider
} from 'antd'
import {
  UserOutlined,
  HeartOutlined,
  HeartFilled,
  DeleteOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  EditOutlined,
  SettingOutlined,
  DownloadOutlined,
  BarChartOutlined,
  BellOutlined,
  BellFilled,
  EyeOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'
import { toggleFavorite, toggleFollow, removeBrowsingHistory, clearBrowsingHistory } from '@/store/slices/userSlice'
import MortiseCard from '@/components/MortiseCard'
import DesignerCard from '@/components/DesignerCard'
import EmptyState from '@/components/EmptyState'
import { allMortises } from '@/mock/mortises'
import { designers } from '@/mock/users'

const { TabPane } = Tabs
const { RangePicker } = DatePicker
const { Option } = Select
const { CheckableTag } = Tag

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'info'
  const [activeTab, setActiveTab] = useState(initialTab)

  const { user } = useSelector(state => state.auth)
  const { favorites, following, browsingHistory } = useSelector(state => state.user)

  const [favoriteCategory, setFavoriteCategory] = useState('all')
  const [designerFilter, setDesignerFilter] = useState('all')
  const [historyFilter, setHistoryFilter] = useState('all')
  const [historyDateRange, setHistoryDateRange] = useState(null)
  const [selectedFavorites, setSelectedFavorites] = useState([])
  const [downloadModalVisible, setDownloadModalVisible] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [notificationVisible, setNotificationVisible] = useState(false)

  const favoriteMortises = useMemo(() => {
    let data = allMortises.filter(m => favorites.includes(m.id))
    if (favoriteCategory !== 'all') {
      data = data.filter(m => m.category === favoriteCategory)
    }
    return data
  }, [favorites, favoriteCategory])

  const followingDesigners = useMemo(() => {
    let data = designers.filter(d => following.includes(d.id))
    if (designerFilter !== 'all') {
      if (designerFilter === 'master') {
        data = data.filter(d => d.experience && parseInt(d.experience) >= 20)
      } else if (designerFilter === 'young') {
        data = data.filter(d => d.experience && parseInt(d.experience) < 20)
      }
    }
    return data
  }, [following, designerFilter])

  const filteredHistory = useMemo(() => {
    let data = [...browsingHistory]
    if (historyFilter !== 'all') {
      if (historyFilter === 'week') {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        data = data.filter(item => new Date(item.viewTime) >= oneWeekAgo)
      } else if (historyFilter === 'month') {
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        data = data.filter(item => new Date(item.viewTime) >= oneMonthAgo)
      }
    }
    if (historyDateRange && historyDateRange.length === 2) {
      const [start, end] = historyDateRange
      data = data.filter(item => {
        const time = new Date(item.viewTime)
        return time >= start && time <= end
      })
    }
    return data
  }, [browsingHistory, historyFilter, historyDateRange])

  const viewStatistics = useMemo(() => {
    const mortiseMap = {}
    browsingHistory.forEach(item => {
      mortiseMap[item.id] = mortiseMap[item.id] || { ...item, count: 0 }
      mortiseMap[item.id].count++
    })
    return Object.values(mortiseMap).sort((a, b) => b.count - a.count).slice(0, 10)
  }, [browsingHistory])

  const totalViews = browsingHistory.length
  const uniqueViews = Object.keys(viewStatistics).length
  const mostViewed = viewStatistics[0]

  const updates = [
    { id: 1, title: '燕尾榫3D模型已更新', time: '2小时前', type: 'update' },
    { id: 2, title: '斗拱榫卯新增制作视频已上线', time: '1天前', type: 'video' },
    { id: 3, title: '您关注的设计师陈传统发布了新作品', time: '2天前', type: 'designer' },
    { id: 4, title: '模块化榫卯新增参数化设计文档', time: '3天前', type: 'doc' }
  ]

  const handleRemoveFavorite = (id) => {
    dispatch(toggleFavorite(id))
    setSelectedFavorites(selectedFavorites.filter(fid => fid !== id))
    message.success('已取消收藏')
  }

  const handleUnfollow = (id) => {
    dispatch(toggleFollow(id))
    message.success('已取消关注')
  }

  const handleRemoveHistory = (id) => {
    dispatch(removeBrowsingHistory(id))
    message.success('已删除记录')
  }

  const handleClearHistory = () => {
    dispatch(clearBrowsingHistory())
    message.success('已清空浏览记录')
  }

  const handleTabChange = (key) => {
    setActiveTab(key)
  }

  const handleFavoriteSelect = (id) => {
    setSelectedFavorites(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    )
  }

  const handleSelectAllFavorites = () => {
    if (selectedFavorites.length === favoriteMortises.length) {
      setSelectedFavorites([])
    } else {
      setSelectedFavorites(favoriteMortises.map(m => m.id))
    }
  }

  const handleBatchDownload = () => {
    if (selectedFavorites.length === 0) {
      message.warning('请先选择要下载的设计')
      return
    }
    setDownloadModalVisible(true)
  }

  const confirmDownload = () => {
    setDownloading(true)
    setDownloadProgress(0)
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setDownloading(false)
          setDownloadModalVisible(false)
          setSelectedFavorites([])
          message.success(`成功下载 ${selectedFavorites.length} 个设计素材`)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const getRoleName = (role) => {
    const names = {
      admin: '系统管理员',
      craftsman: '榫卯工艺从业者'
    }
    return names[role] || role
  }

  const getRoleColor = (role) => {
    return role === 'admin' ? '#faad14' : '#1890ff'
  }

  const getCategoryName = (category) => {
    const names = {
      all: '全部',
      classic: '经典榫卯',
      innovative: '创新榫卯',
      furniture: '家具榫卯',
      architecture: '建筑榫卯',
      decoration: '装饰榫卯'
    }
    return names[category] || category
  }

  const favoriteCategories = [
    { value: 'all', label: '全部' },
    { value: 'classic', label: '经典榫卯' },
    { value: 'innovative', label: '创新榫卯' },
    { value: 'furniture', label: '家具榫卯' },
    { value: 'architecture', label: '建筑榫卯' },
    { value: 'decoration', label: '装饰榫卯' }
  ]

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100%', padding: '24px 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={24}>
          <Col xs={24} lg={6}>
            <Card style={{ marginBottom: 24, borderRadius: 12, textAlign: 'center' }}>
              <Avatar size={100} src={user?.avatar} icon={<UserOutlined />} />
              <div style={{ marginTop: 16, fontSize: 20, fontWeight: 600 }}>
                {user?.name}
              </div>
              <div style={{ marginTop: 8 }}>
                <Tag color={getRoleColor(user?.role)} style={{ fontSize: 14 }}>
                  {getRoleName(user?.role)}
                </Tag>
              </div>
              <div style={{ color: '#888', marginTop: 8 }}>
                {user?.title || user?.department || ''}
              </div>

              <Row style={{ marginTop: 24, padding: '16px 0', borderTop: '1px solid #f0f0f0' }}>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>
                    {favorites.length}
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    收藏
                  </div>
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>
                    {following.length}
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    关注
                  </div>
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>
                    {browsingHistory.length}
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    浏览
                  </div>
                </Col>
              </Row>

              <Button type="primary" block icon={<EditOutlined />} style={{ marginTop: 16 }}>
                编辑资料
              </Button>

              <Button
                block
                icon={<BellOutlined />}
                onClick={() => setNotificationVisible(true)}
                style={{ marginTop: 8 }}
              >
                消息通知
                <Badge count={updates.length} style={{ marginLeft: 8 }} />
              </Button>
            </Card>

            {user?.role === 'admin' && (
              <Card style={{ borderRadius: 12 }}>
                <Button
                  type="primary"
                  danger
                  block
                  icon={<SettingOutlined />}
                  onClick={() => navigate('/admin')}
                >
                  进入管理后台
                </Button>
              </Card>
            )}

            {user?.role === 'craftsman' && (
              <Card style={{ borderRadius: 12, marginTop: 16 }}>
                <Alert
                  message="工艺师特权"
                  description="您可以下载高清设计图纸、参与专业教程视频等专属内容"
                  type="success"
                  showIcon
                />
              </Card>
            )}
          </Col>

          <Col xs={24} lg={18}>
            <Card style={{ borderRadius: 12 }}>
              <Tabs activeKey={activeTab} onChange={handleTabChange} size="large">
                <TabPane
                  tab={
                    <span>
                      <UserOutlined />
                      个人信息
                    </span>
                  }
                  key="info"
                >
                  <Descriptions column={1} bordered size="middle">
                    <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
                    <Descriptions.Item label="真实姓名">{user?.name}</Descriptions.Item>
                    <Descriptions.Item label="用户角色">
                      <Tag color={getRoleColor(user?.role)}>{getRoleName(user?.role)}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
                    <Descriptions.Item label="手机号">{user?.phone}</Descriptions.Item>
                    {user?.title && (
                      <Descriptions.Item label="职称">{user?.title}</Descriptions.Item>
                    )}
                    {user?.experience && (
                      <Descriptions.Item label="从业经验">{user?.experience}</Descriptions.Item>
                    )}
                    {user?.department && (
                      <Descriptions.Item label="所属部门">{user?.department}</Descriptions.Item>
                    )}
                    {user?.bio && (
                      <Descriptions.Item label="个人简介">{user?.bio}</Descriptions.Item>
                    )}
                    {user?.skills && user?.skills?.length > 0 && (
                      <Descriptions.Item label="技能">
                        {user.skills.map((skill, i) => (
                          <Tag key={i} color="blue" style={{ margin: 2 }}>{skill}</Tag>
                        ))}
                      </Descriptions.Item>
                    )}
                    {user?.certifications && user?.certifications?.length > 0 && (
                      <Descriptions.Item label="资质认证">
                        {user.certifications.map((cert, i) => (
                          <Tag key={i} color="gold" style={{ margin: 2 }}>{cert}</Tag>
                        ))}
                      </Descriptions.Item>
                    )}
                    {user?.permissions && user?.permissions?.length > 0 && (
                      <Descriptions.Item label="系统权限">
                        {user.permissions.map((p, i) => (
                        <Tag key={i} color="purple" style={{ margin: 2 }}>{p}</Tag>
                      ))}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <HeartOutlined />
                      我的收藏
                      <Badge count={favorites.length} style={{ marginLeft: 8 }} />
                    </span>
                  }
                  key="favorites"
                >
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ color: '#666' }}>分类筛选：</span>
                      <Segmented
                        options={favoriteCategories}
                        value={favoriteCategory}
                        onChange={setFavoriteCategory}
                        size="small"
                      />
                    </div>
                    <Space>
                      <Checkbox
                        checked={selectedFavorites.length === favoriteMortises.length && favoriteMortises.length > 0}
                        onChange={handleSelectAllFavorites}
                      >
                        全选
                      </Checkbox>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleBatchDownload}
                        disabled={selectedFavorites.length === 0}
                      >
                        批量下载 ({selectedFavorites.length})
                      </Button>
                    </Space>
                  </div>

                  {favoriteMortises.length > 0 ? (
                    <Row gutter={[16, 16]}>
                      {favoriteMortises.map(mortise => (
                        <Col xs={24} sm={12} md={8} key={mortise.id}>
                          <Card
                            hoverable
                            style={{ position: 'relative' }}
                            cover={
                              <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                                  <Checkbox
                                    checked={selectedFavorites.includes(mortise.id)}
                                    onChange={() => handleFavoriteSelect(mortise.id)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <img
                                  src={mortise.image}
                                  alt={mortise.name}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onClick={() => navigate(`/mortise/${mortise.id}`)}
                                />
                                <Button
                                  type="text"
                                  icon={<HeartFilled style={{ color: '#ff4d4f' }} />}
                                  onClick={() => handleRemoveFavorite(mortise.id)}
                                  style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    background: 'rgba(255,255,255,0.9)',
                                    borderRadius: '50%',
                                    padding: 0,
                                    width: 32,
                                    height: 32
                                  }}
                                />
                              </div>
                            }
                            onClick={() => navigate(`/mortise/${mortise.id}`)}
                          >
                            <Card.Meta
                              title={mortise.name}
                              description={
                                <div>
                                  <p style={{
                                    color: '#666',
                                    fontSize: 13,
                                    marginBottom: 8,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}>
                                    {mortise.description}
                                  </p>
                                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    <Tag color="blue">{getCategoryName(mortise.category)}</Tag>
                                    {mortise.tags?.slice(0, 2)?.map((t, i) => (
                                      <Tag key={i} style={{ margin: 2 }}>{t}</Tag>
                                    ))}
                                  </div>
                                </div>
                              }
                            />
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <EmptyState description="暂无收藏的榫卯设计" />
                  )}
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <UserAddOutlined />
                      我的关注
                      <Badge count={following.length} style={{ marginLeft: 8 }} />
                    </span>
                  }
                  key="following"
                >
                  <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>筛选：</span>
                    <Segmented
                      options={[
                        { value: 'all', label: '全部' },
                        { value: 'master', label: '大师级（20年以上）' },
                        { value: 'young', label: '新锐设计师' }
                      ]}
                      value={designerFilter}
                      onChange={setDesignerFilter}
                      size="small"
                    />
                  </div>

                  {followingDesigners.length > 0 ? (
                    <Row gutter={[16, 16]}>
                      {followingDesigners.map(designer => (
                        <Col xs={24} sm={12} md={8} key={designer.id}>
                          <Card hoverable style={{ position: 'relative' }}>
                            <div style={{ textAlign: 'center', padding: 16 }}>
                              <Avatar size={64} src={designer.avatar} icon={<UserOutlined />} />
                              <div style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>
                                {designer.name}
                              </div>
                              <div style={{ color: '#1890ff', marginTop: 4 }}>
                                {designer.title}
                              </div>
                              <div style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
                                {designer.experience}经验 · {designer.worksCount}件作品
                              </div>
                              <div style={{ marginTop: 12 }}>
                                <span style={{ color: '#666', fontSize: 13 }}>
                                  {designer.followers.toLocaleString()} 粉丝
                                </span>
                              </div>
                              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                                {designer.specialty?.slice(0, 2)?.map((s, i) => (
                                  <Tag key={i} color="blue">{s}</Tag>
                                ))}
                              </div>
                              <Button
                                type="default"
                                onClick={() => handleUnfollow(designer.id)}
                                style={{ marginTop: 12, width: '100%' }}
                              >
                                取消关注
                              </Button>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <EmptyState description="暂无关注的设计师" />
                  )}
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <ClockCircleOutlined />
                      浏览记录
                      <Badge count={browsingHistory.length} style={{ marginLeft: 8 }} />
                    </span>
                  }
                  key="history"
                >
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ color: '#666' }}>时间筛选：</span>
                      <Segmented
                        options={[
                          { value: 'all', label: '全部' },
                          { value: 'week', label: '近一周' },
                          { value: 'month', label: '近一月' }
                        ]}
                        value={historyFilter}
                        onChange={setHistoryFilter}
                        size="small"
                      />
                      <RangePicker
                        size="small"
                        value={historyDateRange}
                        onChange={setHistoryDateRange}
                      />
                    </div>
                    <Popconfirm
                      title="确定要清空浏览记录吗？"
                      onConfirm={handleClearHistory}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button danger size="small" icon={<DeleteOutlined />}>
                        清空记录
                      </Button>
                    </Popconfirm>
                  </div>

                  {filteredHistory.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={filteredHistory}
                      renderItem={item => (
                        <List.Item
                        actions={[
                          <Popconfirm
                            title="确定删除这条记录？"
                            onConfirm={() => handleRemoveHistory(item.id)}
                            okText="确定"
                            cancelText="取消"
                            key="delete"
                          >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<AppstoreOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                          title={
                            <a onClick={() => navigate(`/mortise/${item.id}`)}>
                              {item.name}
                            </a>
                          }
                          description={`浏览时间：${item.viewTime}`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <EmptyState description="暂无浏览记录" />
                )}
              </TabPane>

              <TabPane
                tab={
                <span>
                  <BarChartOutlined />
                  浏览统计
                </span>
                }
                key="statistics"
              >
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={8}>
                    <Card>
                      <Statistic
                        title="总浏览次数"
                        value={totalViews}
                        prefix={<EyeOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card>
                      <Statistic
                        title="浏览设计数"
                        value={uniqueViews}
                        prefix={<AppstoreOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card>
                      <Statistic
                        title="最常浏览"
                        value={mostViewed?.name || '-'}
                        prefix={<HeartOutlined />}
                        valueStyle={{ color: '#faad14' }}
                        suffix={mostViewed ? `${mostViewed.count}次` : null}
                      />
                    </Card>
                  </Col>
                </Row>

                <Card title="浏览排行">
                  {viewStatistics.length > 0 ? (
                    <Table
                      dataSource={viewStatistics}
                      rowKey="id"
                      pagination={false}
                    >
                      <Table.Column
                        title="排名"
                        key="rank"
                        width={80}
                        render={(_, __, index) => (
                          <Tag color={index < 3 ? 'gold' : 'default'}>
                            {index + 1}
                          </Tag>
                        )}
                      />
                      <Table.Column
                        title="设计名称"
                        dataIndex="name"
                        render={(text, record) => (
                          <a onClick={() => navigate(`/mortise/${record.id}`)}>{text}</a>
                        )}
                      />
                      <Table.Column
                        title="浏览次数"
                        dataIndex="count"
                        width={120}
                        render={(count) => (
                          <span style={{ color: '#1890ff', fontWeight: 600 }}>{count} 次</span>
                        )}
                      />
                      <Table.Column
                        title="最近浏览"
                        dataIndex="viewTime"
                        width={200}
                      />
                    </Table>
                  ) : (
                    <EmptyState description="暂无浏览数据" />
                  )}
                </Card>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>

    <Modal
      title="批量下载设计素材"
      open={downloadModalVisible}
      onCancel={() => !downloading && setDownloadModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setDownloadModalVisible(false)} disabled={downloading}>
          取消
        </Button>,
        <Button
          key="download"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={confirmDownload}
          loading={downloading}
        >
          {downloading ? '下载中...' : '开始下载'}
        </Button>
      ]}
      width={500}
    >
      <div style={{ marginBottom: 16 }}>
        <p style={{ marginBottom: 8 }}>已选择 <strong style={{ color: '#1890ff' }}>{selectedFavorites.length}</strong> 个设计素材</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {favoriteMortises.filter(m => selectedFavorites.includes(m.id)).map(m => (
            <Tag key={m.id} color="blue">{m.name}</Tag>
          ))}
        </div>
      </div>
      <Divider style={{ margin: '12px 0' }} />
      <div>
        <p style={{ marginBottom: 8 }}>下载内容包含：</p>
        <ul style={{ paddingLeft: 20, color: '#666' }}>
          <li>高清设计图纸（PDF格式）</li>
          <li>三维模型文件（STEP格式）</li>
          <li>制作工艺说明书</li>
          <li>材料清单</li>
        </ul>
      </div>
      {downloading && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={downloadProgress} status="active" />
          <p style={{ textAlign: 'center', marginTop: 8, color: '#888' }}>正在打包下载...</p>
        </div>
      )}
    </Modal>

    <Modal
      title={
        <span>
          <BellOutlined style={{ marginRight: 8 }} />
          消息通知
        </span>
      }
      open={notificationVisible}
      onCancel={() => setNotificationVisible(false)}
      footer={null}
      width={500}
    >
      {updates.map(update => (
        <div key={update.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ fontSize: 20 }}>
              {update.type === 'update' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
              {update.type === 'video' && <PlayCircleOutlined style={{ color: '#1890ff' }} />}
              {update.type === 'designer' && <UserOutlined style={{ color: '#722ed1' }} />}
              {update.type === 'doc' && <FileTextOutlined style={{ color: '#fa8c16' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{update.title}</div>
              <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{update.time}</div>
            </div>
          </div>
        </div>
      ))}
      {updates.length === 0 && (
        <EmptyState description="暂无新消息" />
      )}
    </Modal>
  </div>
  )
}

export default Profile
