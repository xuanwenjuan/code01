import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Row, Col, Card, Avatar, Tabs, List, Button, Space, Tag,
  Typography, Descriptions, Popconfirm, message, Empty,
  Table, Checkbox, Modal, Statistic, Progress, Alert,
  Badge, Dropdown, Menu
} from 'antd'
import {
  UserOutlined, HeartOutlined, UsergroupAddOutlined,
  HistoryOutlined, LogoutOutlined, DeleteOutlined,
  EnvironmentOutlined, MailOutlined, PhoneOutlined,
  DashboardOutlined, DownloadOutlined, BarChartOutlined,
  BellOutlined, DownOutlined, CheckOutlined,
  FileTextOutlined, PictureOutlined, VideoCameraOutlined,
  FilterOutlined, ClearOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  logout, toggleFavorite, toggleFollowMaster,
  clearBrowseHistory, clearFavorites, clearFollowingMasters,
  markNotificationRead, clearAllNotifications
} from '@/store/slices/userSlice'
import { pigments, masters, applicationCases } from '@/mock'

const { Title, Paragraph, Text } = Typography

function Profile() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser } = useSelector(state => state.user)
  const [activeTab, setActiveTab] = useState('favorites')
  const [selectedFavorites, setSelectedFavorites] = useState([])
  const [selectedHistory, setSelectedHistory] = useState([])
  const [downloadModal, setDownloadModal] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [notificationDropdown, setNotificationDropdown] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    message.success('已退出登录')
    navigate('/')
  }

  const favoritePigments = pigments.filter(p => currentUser?.favorites?.includes(p.id))
  const followingMasters = masters.filter(m => currentUser?.followingMasters?.includes(m.id))
  const browseHistory = currentUser?.browseHistory || []
  const historyPigments = browseHistory.map(h => ({
    ...pigments.find(p => p.id === h.pigmentId),
    browseTime: h.time
  })).filter(h => h.id)
  const notifications = currentUser?.notifications || []
  const unreadNotifications = notifications.filter(n => !n.read)
  const downloadHistory = currentUser?.downloadHistory || []

  const filteredFavorites = useMemo(() => {
    if (categoryFilter === 'all') return favoritePigments
    return favoritePigments.filter(p => p.category === categoryFilter)
  }, [favoritePigments, categoryFilter])

  const totalPigmentViews = pigments.reduce((sum, p) => sum + p.views, 0)
  const totalCaseViews = applicationCases.reduce((sum, c) => sum + c.views, 0)
  const topPigments = [...pigments].sort((a, b) => b.views - a.views).slice(0, 5)
  const topCases = [...applicationCases].sort((a, b) => b.views - a.views).slice(0, 5)

  const handleRemoveFavorite = (pigmentId) => {
    dispatch(toggleFavorite(pigmentId))
    setSelectedFavorites(prev => prev.filter(id => id !== pigmentId))
    message.success('已取消收藏')
  }

  const handleUnfollowMaster = (masterId) => {
    dispatch(toggleFollowMaster(masterId))
    message.success('已取消关注')
  }

  const handleClearHistory = () => {
    dispatch(clearBrowseHistory())
    setSelectedHistory([])
    message.success('浏览记录已清空')
  }

  const handleClearFavorites = () => {
    dispatch(clearFavorites())
    setSelectedFavorites([])
    message.success('已清空所有收藏')
  }

  const handleClearFollowing = () => {
    dispatch(clearFollowingMasters())
    message.success('已取消所有关注')
  }

  const handleBatchDeleteFavorites = () => {
    if (selectedFavorites.length === 0) {
      message.warning('请先选择要删除的收藏')
      return
    }
    selectedFavorites.forEach(id => {
      dispatch(toggleFavorite(id))
    })
    setSelectedFavorites([])
    message.success(`已删除 ${selectedFavorites.length} 个收藏`)
  }

  const handleBatchDeleteHistory = () => {
    if (selectedHistory.length === 0) {
      message.warning('请先选择要删除的记录')
      return
    }
    const newHistory = browseHistory.filter(h => !selectedHistory.includes(h.pigmentId))
    dispatch(clearBrowseHistory())
    newHistory.forEach(h => {
      dispatch({ type: 'user/addBrowseHistory', payload: h.pigmentId })
    })
    setSelectedHistory([])
    message.success(`已删除 ${selectedHistory.length} 条记录`)
  }

  const handleDownload = (type) => {
    setDownloading(true)
    setDownloadProgress(0)
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setDownloading(false)
          message.success(`${type}下载完成！`)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleBatchDownload = () => {
    setDownloadModal(true)
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationRead(notification.id))
    }
    if (notification.pigmentId) {
      navigate(`/pigment/${notification.pigmentId}`)
      setNotificationDropdown(false)
    }
  }

  const handleMarkAllRead = () => {
    dispatch(clearAllNotifications())
    message.success('已标记所有通知为已读')
  }

  const notificationMenu = (
    <Menu style={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
      <Menu.Item key="header" disabled style={{ padding: '12px 16px', background: '#f5f5f5' }}>
        <Space>
          <BellOutlined />
          <span>消息通知</span>
          {unreadNotifications.length > 0 && (
            <Tag color="red" style={{ marginLeft: 'auto' }}>{unreadNotifications.length} 条未读</Tag>
          )}
        </Space>
      </Menu.Item>
      <Menu.Divider />
      {notifications.length > 0 ? (
        notifications.slice(0, 8).map(notification => (
          <Menu.Item
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            style={{ padding: '12px 16px', whiteSpace: 'normal' }}
          >
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              <Space>
                {!notification.read && <Badge color="red" />}
                <Text strong>{notification.title}</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>{notification.content}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>{notification.time}</Text>
            </Space>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item key="empty" disabled style={{ padding: 24, textAlign: 'center' }}>
          <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="mark-all" onClick={handleMarkAllRead} style={{ textAlign: 'center', color: '#1890ff' }}>
        标记全部为已读
      </Menu.Item>
    </Menu>
  )

  const columns = [
    {
      title: '颜料名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <div
            style={{
              width: 24,
              height: 24,
              backgroundColor: record.color,
              borderRadius: 4,
              flexShrink: 0
            }}
          />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (text) => (
        <Tag color={text === 'natural' ? 'green' : 'orange'}>
          {text === 'natural' ? '天然矿物' : '古法调配'}
        </Tag>
      )
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (text) => <Text strong>{text.toLocaleString()}</Text>
    },
    {
      title: '收藏数',
      dataIndex: 'likes',
      key: 'likes',
      render: (text) => <Text>{text.toLocaleString()}</Text>
    }
  ]

  const caseColumns = [
    {
      title: '案例名称',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '朝代/时期',
      dataIndex: 'dynasty',
      key: 'dynasty'
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (text) => <Text strong>{text.toLocaleString()}</Text>
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
      render: (text) => <Text>{text.toLocaleString()}</Text>
    }
  ]

  const downloadItems = [
    { type: '制作工艺文档', icon: <FileTextOutlined />, desc: '包含颜料制作工艺流程PDF' },
    { type: '高清色卡样本', icon: <PictureOutlined />, desc: '10种颜料高清色卡图片' },
    { type: '工艺视频合集', icon: <VideoCameraOutlined />, desc: '颜料制作过程视频合集' }
  ]

  const tabItems = [
    {
      key: 'favorites',
      label: (
        <span>
          <HeartOutlined style={{ marginRight: 8 }} />
          我的收藏
          <Tag style={{ marginLeft: 8 }} color="red">{favoritePigments.length}</Tag>
        </span>
      ),
      children: favoritePigments.length > 0 ? (
        <div>
          <Space style={{ marginBottom: 16 }} wrap>
            <Space>
              <FilterOutlined />
              <span>分类筛选：</span>
              <Button
                type={categoryFilter === 'all' ? 'primary' : 'default'}
                size="small"
                onClick={() => setCategoryFilter('all')}
              >
                全部
              </Button>
              <Button
                type={categoryFilter === 'natural' ? 'primary' : 'default'}
                size="small"
                onClick={() => setCategoryFilter('natural')}
              >
                天然矿物
              </Button>
              <Button
                type={categoryFilter === 'compound' ? 'primary' : 'default'}
                size="small"
                onClick={() => setCategoryFilter('compound')}
              >
                古法调配
              </Button>
            </Space>
            <Space style={{ marginLeft: 'auto' }}>
              <Checkbox
                checked={selectedFavorites.length === filteredFavorites.length && filteredFavorites.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFavorites(filteredFavorites.map(p => p.id))
                  } else {
                    setSelectedFavorites([])
                  }
                }}
              >
                全选
              </Checkbox>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDeleteFavorites}
                disabled={selectedFavorites.length === 0}
              >
                批量删除 ({selectedFavorites.length})
              </Button>
              <Popconfirm
                title="确定要清空所有收藏吗？"
                onConfirm={handleClearFavorites}
                okText="确定"
                cancelText="取消"
              >
                <Button size="small" icon={<ClearOutlined />}>
                  清空全部
                </Button>
              </Popconfirm>
            </Space>
          </Space>

          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
            dataSource={filteredFavorites}
            renderItem={pigment => (
              <List.Item>
                <Card
                  hoverable
                  className="card-hover"
                  cover={
                    <div
                      style={{
                        height: 140,
                        backgroundColor: pigment.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => navigate(`/pigment/${pigment.id}`)}
                    >
                      <Checkbox
                        style={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
                        checked={selectedFavorites.includes(pigment.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          if (e.target.checked) {
                            setSelectedFavorites(prev => [...prev, pigment.id])
                          } else {
                            setSelectedFavorites(prev => prev.filter(id => id !== pigment.id))
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span style={{
                        color: '#fff',
                        fontSize: 32,
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {pigment.chineseName}
                      </span>
                    </div>
                  }
                  actions={[
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveFavorite(pigment.id)}
                    >
                      取消收藏
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={
                      <Space>
                        <span
                          style={{ cursor: 'pointer', color: '#5D4037' }}
                          onClick={() => navigate(`/pigment/${pigment.id}`)}
                        >
                          {pigment.name}
                        </span>
                        <Tag color={pigment.category === 'natural' ? 'green' : 'orange'} size="small">
                          {pigment.category === 'natural' ? '天然' : '调配'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {pigment.description}
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        </div>
      ) : (
        <Empty description="暂无收藏的颜料" />
      )
    },
    {
      key: 'following',
      label: (
        <span>
          <UsergroupAddOutlined style={{ marginRight: 8 }} />
          关注的调配师
          <Tag style={{ marginLeft: 8 }} color="blue">{followingMasters.length}</Tag>
        </span>
      ),
      children: followingMasters.length > 0 ? (
        <div>
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <Popconfirm
              title="确定要取消所有关注吗？"
              onConfirm={handleClearFollowing}
              okText="确定"
              cancelText="取消"
            >
              <Button size="small" danger icon={<ClearOutlined />}>
                取消全部关注
              </Button>
            </Popconfirm>
          </div>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
            dataSource={followingMasters}
            renderItem={master => (
              <List.Item>
                <Card className="card-hover">
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <Avatar size={64} src={master.avatar} icon={<UserOutlined />} />
                    <Title level={5} style={{ marginTop: 12, marginBottom: 8 }}>{master.name}</Title>
                    <Tag color="gold">{master.title}</Tag>
                    <Paragraph style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
                      {master.specialty}
                    </Paragraph>
                    <Space style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                      <span>从业 {master.experience} 年</span>
                      <span>•</span>
                      <span>{master.followers} 粉丝</span>
                    </Space>
                    <Button
                      danger
                      size="small"
                      style={{ marginTop: 16 }}
                      onClick={() => handleUnfollowMaster(master.id)}
                    >
                      取消关注
                    </Button>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>
      ) : (
        <Empty description="暂无关注的调配师" />
      )
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined style={{ marginRight: 8 }} />
          浏览记录
          <Tag style={{ marginLeft: 8 }} color="orange">{historyPigments.length}</Tag>
        </span>
      ),
      children: historyPigments.length > 0 ? (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <Checkbox
              checked={selectedHistory.length === historyPigments.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedHistory(historyPigments.map(p => p.id))
                } else {
                  setSelectedHistory([])
                }
              }}
            >
              全选
            </Checkbox>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDeleteHistory}
              disabled={selectedHistory.length === 0}
            >
              批量删除 ({selectedHistory.length})
            </Button>
            <Popconfirm
              title="确定要清空浏览记录吗？"
              onConfirm={handleClearHistory}
              okText="确定"
              cancelText="取消"
            >
              <Button size="small" icon={<ClearOutlined />}>
                清空全部
              </Button>
            </Popconfirm>
          </Space>
          <List
            dataSource={historyPigments}
            renderItem={pigment => (
              <List.Item
                className="card-hover"
                style={{
                  background: '#fff',
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 8,
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/pigment/${pigment.id}`)}
              >
                <Space size={16} style={{ width: '100%' }}>
                  <Checkbox
                    checked={selectedHistory.includes(pigment.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      if (e.target.checked) {
                        setSelectedHistory(prev => [...prev, pigment.id])
                      } else {
                        setSelectedHistory(prev => prev.filter(id => id !== pigment.id))
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      backgroundColor: pigment.color,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 20,
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}
                  >
                    {pigment.chineseName}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#5D4037' }}>{pigment.name}</div>
                    <div style={{ color: '#888', fontSize: 13 }}>{pigment.origin}</div>
                  </div>
                  <div style={{ color: '#aaa', fontSize: 12 }}>
                    <HistoryOutlined style={{ marginRight: 4 }} />
                    {pigment.browseTime}
                  </div>
                </Space>
              </List.Item>
            )}
          />
        </div>
      ) : (
        <Empty description="暂无浏览记录" />
      )
    },
    {
      key: 'download',
      label: (
        <span>
          <DownloadOutlined style={{ marginRight: 8 }} />
          素材下载
        </span>
      ),
      children: (
        <div>
          <Alert
            message="下载说明"
            description="平台提供颜料制作相关的学习素材，仅供研究学习使用，请勿用于商业用途。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {downloadItems.map((item, index) => (
              <Col md={8} key={index}>
                <Card hoverable className="card-hover">
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <div style={{ fontSize: 48, color: '#8B4513', marginBottom: 12 }}>
                      {item.icon}
                    </div>
                    <Title level={5} style={{ marginBottom: 8 }}>{item.type}</Title>
                    <Paragraph style={{ color: '#666', fontSize: 13, minHeight: 40 }}>
                      {item.desc}
                    </Paragraph>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(item.type)}
                      loading={downloading}
                    >
                      下载
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={handleBatchDownload}
            style={{ marginBottom: 24 }}
          >
            一键下载全部素材
          </Button>

          {downloadHistory.length > 0 && (
            <div>
              <Title level={5} style={{ marginBottom: 16 }}>最近下载</Title>
              <List
                dataSource={downloadHistory}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <DownloadOutlined style={{ color: '#52c41a' }} />
                      <span>{item.pigmentName} - {item.type}</span>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                      <Tag color="green" style={{ marginLeft: 'auto' }}>
                        <CheckOutlined /> 已下载
                      </Tag>
                    </Space>
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'statistics',
      label: (
        <span>
          <BarChartOutlined style={{ marginRight: 8 }} />
          浏览统计
        </span>
      ),
      children: currentUser?.role === 'admin' ? (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col md={6}>
              <Card>
                <Statistic
                  title="颜料总数"
                  value={pigments.length}
                  suffix="种"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Statistic
                  title="应用案例总数"
                  value={applicationCases.length}
                  suffix="个"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Statistic
                  title="颜料总浏览量"
                  value={totalPigmentViews}
                  suffix="次"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Statistic
                  title="案例总浏览量"
                  value={totalCaseViews}
                  suffix="次"
                  valueStyle={{ color: '#eb2f96' }}
                />
              </Card>
            </Col>
          </Row>

          <Title level={5} style={{ marginBottom: 16 }}>颜料浏览量排行</Title>
          <Table
            dataSource={topPigments}
            columns={columns}
            rowKey="id"
            pagination={false}
            style={{ marginBottom: 24 }}
          />

          <Title level={5} style={{ marginBottom: 16 }}>应用案例浏览量排行</Title>
          <Table
            dataSource={topCases}
            columns={caseColumns}
            rowKey="id"
            pagination={false}
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <BarChartOutlined style={{ fontSize: 64, color: '#ddd', marginBottom: 16 }} />
          <Paragraph type="secondary">统计功能仅平台管理员可见</Paragraph>
        </div>
      )
    }
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #8B4513 0%, #5D4037 100%)',
              color: '#fff'
            }}
            styles={{ body: { padding: 32, textAlign: 'center' } }}
          >
            <Avatar
              size={100}
              src={currentUser?.avatar}
              icon={<UserOutlined style={{ fontSize: 48 }} />}
              style={{
                border: '4px solid #c9a96e',
                marginBottom: 16
              }}
            />
            <Title level={3} style={{ color: '#fff', marginBottom: 8 }}>
              {currentUser?.name}
            </Title>
            <Space>
              <Tag color="gold" style={{ marginBottom: 16 }}>
                {currentUser?.role === 'admin' ? '平台管理员' : '矿物颜料研究者'}
              </Tag>
              <Dropdown
                overlay={notificationMenu}
                trigger={['click']}
                open={notificationDropdown}
                onOpenChange={setNotificationDropdown}
              >
                <Badge count={unreadNotifications.length} offset={[0, 2]}>
                  <Button
                    type="text"
                    icon={<BellOutlined style={{ color: '#fff' }} />}
                    style={{ color: '#fff' }}
                  >
                    消息
                  </Button>
                </Badge>
              </Dropdown>
            </Space>
            {currentUser?.organization && (
              <Paragraph style={{ color: '#ddd', marginBottom: 8 }}>
                {currentUser.organization}
              </Paragraph>
            )}
            {currentUser?.researchField && (
              <Paragraph style={{ color: '#ccc', fontSize: 13 }}>
                研究方向：{currentUser.researchField}
              </Paragraph>
            )}

            <Space direction="vertical" style={{ width: '100%', marginTop: 24 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>{favoritePigments.length}</div>
                  <div style={{ fontSize: 12, color: '#ccc' }}>收藏</div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>{followingMasters.length}</div>
                  <div style={{ fontSize: 12, color: '#ccc' }}>关注</div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>{historyPigments.length}</div>
                  <div style={{ fontSize: 12, color: '#ccc' }}>浏览</div>
                </Col>
              </Row>
            </Space>

            <Space direction="vertical" style={{ width: '100%', marginTop: 24 }}>
              {currentUser?.role === 'admin' && (
                <Button
                  block
                  icon={<DashboardOutlined />}
                  onClick={() => navigate('/admin')}
                >
                  进入管理后台
                </Button>
              )}
              <Button
                block
                icon={<DownloadOutlined />}
                onClick={() => setActiveTab('download')}
              >
                素材下载中心
              </Button>
              {currentUser?.role === 'admin' && (
                <Button
                  block
                  icon={<BarChartOutlined />}
                  onClick={() => setActiveTab('statistics')}
                >
                  浏览统计
                </Button>
              )}
              <Button
                block
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                退出登录
              </Button>
            </Space>
          </Card>

          <Card style={{ marginTop: 16, borderRadius: 12 }}>
            <Title level={5} style={{ marginBottom: 16 }}>个人信息</Title>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={<MailOutlined style={{ marginRight: 8 }} />}>
                {currentUser?.email}
              </Descriptions.Item>
              <Descriptions.Item label={<PhoneOutlined style={{ marginRight: 8 }} />}>
                {currentUser?.phone}
              </Descriptions.Item>
              <Descriptions.Item label={<EnvironmentOutlined style={{ marginRight: 8 }} />}>
                注册于 {currentUser?.createTime}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card style={{ borderRadius: 12 }}>
            <Tabs
              activeKey={activeTab}
              items={tabItems}
              onChange={setActiveTab}
              size="large"
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="批量下载素材"
        open={downloadModal}
        onCancel={() => setDownloadModal(false)}
        footer={null}
        width={500}
      >
        <div style={{ padding: 16 }}>
          {downloading ? (
            <div style={{ textAlign: 'center' }}>
              <DownloadOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <Title level={5} style={{ marginBottom: 16 }}>正在下载素材包...</Title>
              <Progress percent={downloadProgress} status="active" />
              <Paragraph type="secondary" style={{ marginTop: 16 }}>
                正在准备颜料制作素材合集，包含：
              </Paragraph>
              <List
                size="small"
                dataSource={downloadItems}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <CheckOutlined style={{ color: '#52c41a' }} />
                      <span>{item.type}</span>
                    </Space>
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <DownloadOutlined style={{ fontSize: 64, color: '#8B4513', marginBottom: 16 }} />
              <Title level={4} style={{ marginBottom: 8 }}>确认下载全部素材？</Title>
              <Paragraph type="secondary" style={{ marginBottom: 24 }}>
                素材包包含制作工艺文档、高清色卡样本、工艺视频合集
              </Paragraph>
              <Space>
                <Button size="large" onClick={() => setDownloadModal(false)}>
                  取消
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload('全部素材')}
                >
                  确认下载
                </Button>
              </Space>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Profile
