import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Row,
  Col,
  Menu,
  Avatar,
  List,
  Button,
  Card,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Tabs,
  Tag,
  Empty,
  Select,
  DatePicker,
  Checkbox,
  Progress,
  Table,
  Statistic,
  Badge,
  Alert,
  notification as antdNotification,
  Space,
  Tooltip,
  Divider,
  Switch
} from 'antd'
import {
  UserOutlined,
  HeartOutlined,
  HistoryOutlined,
  SettingOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  BarChartOutlined,
  BellOutlined,
  AppstoreOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DashboardOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import HeritageCard from '../components/HeritageCard'
import EmptyState from '../components/EmptyState'
import { clearViewHistory, removeViewHistoryItem, removeFavoriteItem, toggleFavorite } from '../store/slices/userSlice'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser, favorites, viewHistory, favoriteMedia } = useSelector(state => state.user)
  const { heritages, categories } = useSelector(state => state.heritage)
  const [activeTab, setActiveTab] = useState('favorites')
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [downloadModalVisible, setDownloadModalVisible] = useState(false)
  const [statsModalVisible, setStatsModalVisible] = useState(false)
  const [notificationModalVisible, setNotificationModalVisible] = useState(false)
  const [form] = Form.useForm()

  const [favoriteCategory, setFavoriteCategory] = useState('all')
  const [historyFilter, setHistoryFilter] = useState({ category: 'all', keyword: '' })
  const [selectedMedia, setSelectedMedia] = useState([])
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  useEffect(() => {
    if (currentUser) {
      const mockNotification = {
        id: 1,
        title: '非遗项目更新提醒',
        content: '您收藏的"昆曲"项目有新的数字化展品更新！',
        time: dayjs().format('YYYY-MM-DD HH:mm'),
        read: false
      }
      setNotification(mockNotification)
    }
  }, [currentUser])

  if (!currentUser) {
    return null
  }

  const favoriteHeritages = heritages.filter(h => favorites.includes(h.id))
  const historyHeritages = heritages.filter(h => viewHistory.includes(h.id))

  const filteredFavorites = useMemo(() => {
    if (favoriteCategory === 'all') return favoriteHeritages
    return favoriteHeritages.filter(h => h.category === favoriteCategory)
  }, [favoriteHeritages, favoriteCategory])

  const filteredHistory = useMemo(() => {
    let result = historyHeritages
    if (historyFilter.category !== 'all') {
      result = result.filter(h => h.category === historyFilter.category)
    }
    if (historyFilter.keyword) {
      const keyword = historyFilter.keyword.toLowerCase()
      result = result.filter(h =>
        h.name.toLowerCase().includes(keyword) ||
        h.description.toLowerCase().includes(keyword)
      )
    }
    return result
  }, [historyHeritages, historyFilter])

  const favoriteStats = useMemo(() => {
    const stats = {}
    favoriteHeritages.forEach(h => {
      if (!stats[h.category]) {
        stats[h.category] = { count: 0, name: h.categoryName }
      }
      stats[h.category].count++
    })
    return stats
  }, [favoriteHeritages])

  const viewStats = useMemo(() => {
    const totalViews = heritages.reduce((sum, h) => sum + h.views, 0)
    const myViewed = historyHeritages.length
    const categoryViews = {}
    historyHeritages.forEach(h => {
      if (!categoryViews[h.category]) {
        categoryViews[h.category] = { count: 0, name: h.categoryName }
      }
      categoryViews[h.category].count++
    })
    return { totalViews, myViewed, categoryViews }
  }, [heritages, historyHeritages])

  const allMedia = useMemo(() => {
    const media = []
    favoriteHeritages.forEach(h => {
      if (h.media) {
        h.media.forEach(m => {
          media.push({ ...m, heritageName: h.name, heritageId: h.id })
        })
      }
    })
    return media
  }, [favoriteHeritages])

  const handleClearHistory = () => {
    dispatch(clearViewHistory())
    message.success('浏览历史已清空')
  }

  const handleRemoveHistoryItem = (id) => {
    dispatch(removeViewHistoryItem(id))
    message.success('已删除该记录')
  }

  const handleRemoveFavorite = (id) => {
    dispatch(removeFavoriteItem(id))
    message.success('已取消收藏')
  }

  const handleInfoSubmit = (values) => {
    message.success('个人信息更新成功')
    setInfoModalVisible(false)
  }

  const handleDownload = () => {
    if (selectedMedia.length === 0) {
      message.warning('请选择要下载的展品')
      return
    }
    setDownloading(true)
    setDownloadProgress(0)

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setDownloading(false)
          message.success(`成功下载 ${selectedMedia.length} 个展品（本地模拟）`)
          setSelectedMedia([])
          setDownloadModalVisible(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleMediaSelect = (mediaId, checked) => {
    if (checked) {
      setSelectedMedia([...selectedMedia, mediaId])
    } else {
      setSelectedMedia(selectedMedia.filter(id => id !== mediaId))
    }
  }

  const handleSelectAllMedia = (checked) => {
    if (checked) {
      setSelectedMedia(allMedia.map(m => m.id))
    } else {
      setSelectedMedia([])
    }
  }

  const menuItems = [
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: `我的收藏 (${favorites.length})`
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: `浏览历史 (${viewHistory.length})`
    },
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: '展品下载'
    },
    {
      key: 'stats',
      icon: <BarChartOutlined />,
      label: '浏览统计'
    },
    ...(currentUser.role === 'admin' ? [{
      key: 'notifications',
      icon: <BellOutlined />,
      label: '更新提醒'
    }] : []),
    {
      key: 'info',
      icon: <SettingOutlined />,
      label: '个人信息'
    }
  ]

  const renderFavorites = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>我的收藏</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#999', fontSize: 13 }}>按分类筛选：</span>
          <Select
            value={favoriteCategory}
            onChange={setFavoriteCategory}
            style={{ width: 160 }}
          >
            <Option value="all">全部分类</Option>
            {categories.filter(c => c.id !== 'all').map(c => (
              <Option key={c.id} value={c.id}>
                {c.name} ({favoriteStats[c.id]?.count || 0})
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {Object.keys(favoriteStats).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Row gutter={[16, 16]}>
              <Col xs={12} md={6}>
                <Statistic title="收藏总数" value={favoriteHeritages.length} valueStyle={{ color: '#d4380d' }} />
              </Col>
              {Object.entries(favoriteStats).slice(0, 3).map(([key, stat]) => (
                <Col xs={12} md={6} key={key}>
                  <Statistic title={stat.name} value={stat.count} />
                </Col>
              ))}
            </Row>
          </Card>
        </div>
      )}

      {filteredFavorites.length > 0 ? (
        <Row gutter={[24, 24]}>
          {filteredFavorites.map(heritage => (
            <Col xs={24} sm={12} lg={6} key={heritage.id}>
              <div style={{ position: 'relative' }}>
                <HeritageCard heritage={heritage} />
                <Popconfirm
                  title="确定取消收藏吗？"
                  onConfirm={() => handleRemoveFavorite(heritage.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    danger
                    size="small"
                    style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
                    icon={<CloseCircleOutlined />}
                  />
                </Popconfirm>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyState
          description="暂无收藏内容"
          actionText="去浏览非遗"
          onAction={() => navigate('/category')}
        />
      )}
    </div>
  )

  const renderHistory = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>浏览历史</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input.Search
            placeholder="搜索历史记录"
            value={historyFilter.keyword}
            onChange={e => setHistoryFilter({ ...historyFilter, keyword: e.target.value })}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            value={historyFilter.category}
            onChange={v => setHistoryFilter({ ...historyFilter, category: v })}
            style={{ width: 140 }}
          >
            <Option value="all">全部分类</Option>
            {categories.filter(c => c.id !== 'all').map(c => (
              <Option key={c.id} value={c.id}>{c.name}</Option>
            ))}
          </Select>
          {filteredHistory.length > 0 && (
            <Popconfirm
              title="确定要清空浏览历史吗？"
              onConfirm={handleClearHistory}
              okText="确定"
              cancelText="取消"
            >
              <Button danger>
                <DeleteOutlined /> 清空
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>

      {filteredHistory.length > 0 ? (
        <List
          dataSource={filteredHistory}
          renderItem={heritage => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  key="view"
                  onClick={() => navigate(`/heritage/${heritage.id}`)}
                >
                  <EyeOutlined /> 查看
                </Button>,
                <Popconfirm
                  key="delete"
                  title="删除该记录？"
                  onConfirm={() => handleRemoveHistoryItem(heritage.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger>
                    <DeleteOutlined /> 删除
                  </Button>
                </Popconfirm>
              ]}
              style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}
            >
              <List.Item.Meta
                avatar={
                  <img
                    src={heritage.cover}
                    alt={heritage.name}
                    style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 4 }}
                  />
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500 }}>{heritage.name}</span>
                    <Tag color={heritage.level === '世界级' ? 'red' : 'green'}>{heritage.level}</Tag>
                    <span className="category-tag">{heritage.categoryName}</span>
                  </div>
                }
                description={
                  <div>
                    <p style={{ color: '#666', margin: '4px 0 0' }}>{heritage.description}</p>
                    <p style={{ color: '#999', fontSize: 12, margin: '4px 0 0' }}>
                      浏览量：{heritage.views} | 发源地：{heritage.origin}
                    </p>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <EmptyState
          description="暂无浏览历史"
          actionText="去浏览非遗"
          onAction={() => navigate('/category')}
        />
      )}
    </div>
  )

  const renderDownload = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>数字化展品下载</h2>
        <Button type="primary" onClick={() => setDownloadModalVisible(true)}>
          <DownloadOutlined /> 批量下载
        </Button>
      </div>

      <Alert
        message="下载说明"
        description="本功能为本地模拟，展示数字化展品批量下载流程。实际应用中会从服务器下载高清资源。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {allMedia.length > 0 ? (
        <Row gutter={[16, 16]}>
          {allMedia.map(media => (
            <Col xs={24} sm={12} md={8} key={media.id}>
              <Card
                hoverable
                cover={
                  <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
                    <img
                      src={media.url}
                      alt={media.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {media.type === 'video' && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.3)',
                        color: 'white',
                        fontSize: 32
                      }}>
                        ▶
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      padding: '16px 12px 8px',
                      color: 'white',
                      fontSize: 12
                    }}>
                      <span style={{
                        background: media.type === 'video' ? '#1890ff' : '#52c41a',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11
                      }}>
                        {media.type === 'video' ? '视频' : '图片'}
                      </span>
                    </div>
                  </div>
                }
                actions={[
                  <Button type="link" size="small" key="download">
                    <DownloadOutlined /> 下载
                  </Button>
                ]}
              >
                <Card.Meta
                  title={<div style={{ fontSize: 14, fontWeight: 500 }}>{media.title}</div>}
                  description={
                    <div>
                      <p style={{ color: '#999', fontSize: 12, margin: '4px 0 0' }}>
                        所属：{media.heritageName}
                      </p>
                      {media.description && (
                        <p style={{ color: '#666', fontSize: 12, margin: '4px 0 0' }}>
                          {media.description}
                        </p>
                      )}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyState
          description="暂无下载资源"
          actionText="去收藏非遗"
          onAction={() => navigate('/category')}
        />
      )}

      <Modal
        title="批量下载展品"
        open={downloadModalVisible}
        onCancel={() => {
          setDownloadModalVisible(false)
          setSelectedMedia([])
          setDownloadProgress(0)
        }}
        footer={null}
        width={800}
      >
        {downloading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ marginBottom: 16 }}>正在下载 {selectedMedia.length} 个展品...</p>
            <Progress percent={downloadProgress} status="active" />
            <p style={{ marginTop: 16, color: '#999' }}>请勿关闭页面</p>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox
                checked={selectedMedia.length === allMedia.length && allMedia.length > 0}
                onChange={e => handleSelectAllMedia(e.target.checked)}
              >
                全选 ({selectedMedia.length}/{allMedia.length})
              </Checkbox>
            </div>
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              <List
                dataSource={allMedia}
                renderItem={media => (
                  <List.Item
                    style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}
                    extra={
                      <Checkbox
                        checked={selectedMedia.includes(media.id)}
                        onChange={e => handleMediaSelect(media.id, e.target.checked)}
                      />
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        <img
                          src={media.url}
                          alt={media.title}
                          style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 4 }}
                        />
                      }
                      title={
                        <span>
                          {media.title}
                          <Tag style={{ marginLeft: 8 }} color={media.type === 'video' ? 'blue' : 'green'}>
                            {media.type === 'video' ? '视频' : '图片'}
                          </Tag>
                        </span>
                      }
                      description={`所属：${media.heritageName}`}
                    />
                  </List.Item>
                )}
              />
            </div>
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => setDownloadModalVisible(false)} style={{ marginRight: 8 }}>
                取消
              </Button>
              <Button type="primary" onClick={handleDownload} disabled={selectedMedia.length === 0}>
                <DownloadOutlined /> 下载选中 ({selectedMedia.length})
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )

  const renderStats = () => (
    <div>
      <h2 style={{ marginBottom: 20 }}>浏览统计</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="我浏览的非遗"
              value={viewStats.myViewed}
              suffix="项"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="平台总浏览量"
              value={viewStats.totalViews}
              valueStyle={{ color: '#52c41a' }}
              formatter={val => val.toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="我的收藏"
              value={favorites.length}
              suffix="项"
              valueStyle={{ color: '#d4380d' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="收藏的展品"
              value={favoriteMedia.length}
              suffix="个"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="浏览分类统计" style={{ marginBottom: 24 }}>
        {Object.keys(viewStats.categoryViews).length > 0 ? (
          <Row gutter={[16, 16]}>
            {Object.entries(viewStats.categoryViews).map(([key, stat]) => (
              <Col xs={24} sm={12} md={8} key={key}>
                <div style={{ padding: 16, background: '#fafafa', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 500 }}>{stat.name}</span>
                    <span style={{ color: '#1890ff' }}>{stat.count} 项</span>
                  </div>
                  <Progress
                    percent={Math.round((stat.count / viewStats.myViewed) * 100)}
                    size="small"
                    showInfo={false}
                  />
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无浏览数据" />
        )}
      </Card>

      <Card title="热门非遗排行（按浏览量）">
        <Table
          dataSource={[...heritages].sort((a, b) => b.views - a.views).slice(0, 10)}
          columns={[
            {
              title: '排名',
              dataIndex: 'index',
              key: 'index',
              width: 60,
              render: (_, __, index) => (
                <Tag color={index < 3 ? '#d4380d' : 'default'}>
                  {index + 1}
                </Tag>
              )
            },
            {
              title: '非遗项目',
              dataIndex: 'name',
              key: 'name',
              render: (text, record) => (
                <a onClick={() => navigate(`/heritage/${record.id}`)} style={{ color: '#333' }}>
                  {text}
                </a>
              )
            },
            {
              title: '分类',
              dataIndex: 'categoryName',
              key: 'categoryName',
              render: text => <Tag>{text}</Tag>
            },
            {
              title: '级别',
              dataIndex: 'level',
              key: 'level',
              render: text => (
                <Tag color={text === '世界级' ? 'red' : 'green'}>{text}</Tag>
              )
            },
            {
              title: '浏览量',
              dataIndex: 'views',
              key: 'views',
              render: val => val.toLocaleString(),
              sorter: (a, b) => a.views - b.views
            }
          ]}
          pagination={false}
          rowKey="id"
        />
      </Card>
    </div>
  )

  const renderNotifications = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>更新提醒管理</h2>
        <Button type="primary" onClick={() => {
          antdNotification.open({
            message: '提醒已开启',
            description: '当您收藏的非遗项目有更新时，您将收到通知。',
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
          })
        }}>
          <BellOutlined /> 开启更新提醒
        </Button>
      </div>

      {currentUser.role === 'admin' && (
        <Alert
          message="管理员功能"
          description="作为管理员，您可以设置非遗项目更新提醒，并向用户推送通知。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {notification ? (
        <Card style={{ marginBottom: 16 }}>
          <Badge.Ribbon text="最新" color="red">
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fff2e8, #ffe7d6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BellOutlined style={{ fontSize: 24, color: '#d4380d' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 8px' }}>{notification.title}</h4>
                <p style={{ color: '#666', margin: '0 0 8px' }}>{notification.content}</p>
                <p style={{ color: '#999', fontSize: 12, margin: 0 }}>{notification.time}</p>
              </div>
            </div>
          </Badge.Ribbon>
        </Card>
      ) : null}

      <Card title="提醒设置">
        <List
          dataSource={[
            { title: '收藏的非遗更新', desc: '当您收藏的非遗项目有新展品或信息更新时通知', enabled: true },
            { title: '新非遗上线', desc: '当有新的非遗项目加入平台时通知', enabled: false },
            { title: '活动通知', desc: '平台举办非遗相关活动时通知', enabled: true },
            { title: '每周精选', desc: '每周推送精选非遗内容', enabled: false }
          ]}
          renderItem={item => (
            <List.Item
              extra={<Switch checked={item.enabled} />}
              style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}
            >
              <List.Item.Meta
                title={item.title}
                description={item.desc}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )

  const renderInfo = () => (
    <div>
      <h2 style={{ marginBottom: 20 }}>个人信息</h2>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          <Avatar src={currentUser.avatar} size={80} />
          <div>
            <h3 style={{ margin: 0 }}>{currentUser.name}</h3>
            <p style={{ margin: '8px 0 0', color: '#999' }}>
              {currentUser.role === 'admin' ? '系统管理员' : '普通用户'}
            </p>
            {currentUser.role === 'admin' && (
              <Tag color="red" style={{ marginTop: 8 }}>管理员权限</Tag>
            )}
          </div>
          <Button type="primary" onClick={() => setInfoModalVisible(true)}>
            编辑信息
          </Button>
          {currentUser.role === 'admin' && (
            <Button onClick={() => navigate('/admin')}>
              <DashboardOutlined /> 进入管理后台
            </Button>
          )}
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ padding: 16, background: '#fafafa', borderRadius: 8 }}>
              <div style={{ color: '#999', fontSize: 13, marginBottom: 4 }}>用户名</div>
              <div style={{ fontWeight: 500 }}>{currentUser.username}</div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ padding: 16, background: '#fafafa', borderRadius: 8 }}>
              <div style={{ color: '#999', fontSize: 13, marginBottom: 4 }}>邮箱</div>
              <div style={{ fontWeight: 500 }}>{currentUser.email}</div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ padding: 16, background: '#fafafa', borderRadius: 8 }}>
              <div style={{ color: '#999', fontSize: 13, marginBottom: 4 }}>手机号</div>
              <div style={{ fontWeight: 500 }}>{currentUser.phone}</div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ padding: 16, background: '#fafafa', borderRadius: 8 }}>
              <div style={{ color: '#999', fontSize: 13, marginBottom: 4 }}>注册时间</div>
              <div style={{ fontWeight: 500 }}>2024-01-01</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'favorites': return renderFavorites()
      case 'history': return renderHistory()
      case 'download': return renderDownload()
      case 'stats': return renderStats()
      case 'notifications': return renderNotifications()
      case 'info': return renderInfo()
      default: return null
    }
  }

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={6}>
          <div className="profile-menu">
            <div style={{ padding: 24, textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ position: 'inline-block' }}>
                <Avatar src={currentUser.avatar} size={64} style={{ marginBottom: 12 }} />
                {notification && !notification.read && (
                  <Badge dot style={{ position: 'absolute', top: 0, right: 0 }} />
                )}
              </div>
              <div style={{ fontWeight: 500 }}>{currentUser.name}</div>
              <div style={{ color: '#999', fontSize: 13 }}>
                {currentUser.role === 'admin' ? '系统管理员' : '普通用户'}
              </div>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[activeTab]}
              onClick={({ key }) => setActiveTab(key)}
              items={menuItems}
              style={{ borderRight: 'none' }}
            />
          </div>
        </Col>
        <Col xs={24} md={18}>
          <div className="profile-content">
            {renderContent()}
          </div>
        </Col>
      </Row>

      <Modal
        title="编辑个人信息"
        open={infoModalVisible}
        onCancel={() => setInfoModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleInfoSubmit}
          initialValues={{
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone
          }}
        >
          <Form.Item
            name="name"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setInfoModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Profile
