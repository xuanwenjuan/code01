import React, { useEffect, useState } from 'react'
import {
  Layout,
  Row,
  Col,
  Card,
  Avatar,
  Typography,
  Descriptions,
  Menu,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Empty,
  Table,
  Select,
  DatePicker,
  Input,
  List,
  Modal,
  Checkbox,
  Progress,
  Statistic,
  Badge,
  Tooltip,
  Divider,
} from 'antd'
import {
  UserOutlined,
  HeartOutlined,
  UserAddOutlined,
  HistoryOutlined,
  SettingOutlined,
  DeleteOutlined,
  EyeOutlined,
  LogoutOutlined,
  DownloadOutlined,
  BellOutlined,
  FilterOutlined,
  ExportOutlined,
  CheckOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  FileZipOutlined,
  BarChartOutlined,
  SearchOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchFavorites,
  fetchFollowList,
  fetchBrowseHistory,
  removeFavorite,
  removeFollow,
  clearBrowseHistory,
  clearUserData,
  fetchSkillUpdates,
  markUpdateAsRead,
  markAllUpdatesAsRead,
  fetchDownloadMaterials,
  downloadMaterial,
  batchDownloadMaterials,
  fetchViewStatistics,
} from '../../store/slices/userSlice'
import { logout } from '../../store/slices/authSlice'
import dayjs from 'dayjs'

const { Content, Sider } = Layout
const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { RangePicker } = DatePicker
const { Search } = Input

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const {
    favorites,
    followList,
    browseHistory,
    skillUpdates,
    downloadMaterials,
    viewStatistics,
    loading,
    downloading,
  } = useSelector((state) => state.user)

  const [selectedMenu, setSelectedMenu] = useState('favorites')
  const [favoriteCategory, setFavoriteCategory] = useState(null)
  const [followLevel, setFollowLevel] = useState(null)
  const [historyCategory, setHistoryCategory] = useState(null)
  const [historyDateRange, setHistoryDateRange] = useState(null)
  const [historyKeyword, setHistoryKeyword] = useState('')
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [downloadModalVisible, setDownloadModalVisible] = useState(false)
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [downloadProgress, setDownloadProgress] = useState(0)

  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites(user.id))
      dispatch(fetchFollowList(user.id))
      dispatch(fetchBrowseHistory(user.id))
      dispatch(fetchSkillUpdates(user.id))
      dispatch(fetchViewStatistics(user.id))
    }
  }, [dispatch, user])

  const handleMenuClick = ({ key }) => {
    setSelectedMenu(key)
    if (key === 'downloads') {
      dispatch(fetchDownloadMaterials())
    }
  }

  const handleRemoveFavorite = (id) => {
    dispatch(removeFavorite(id))
    message.success('已取消收藏')
  }

  const handleRemoveFollow = (id) => {
    dispatch(removeFollow(id))
    message.success('已取消关注')
  }

  const handleClearHistory = () => {
    dispatch(clearBrowseHistory())
    message.success('浏览记录已清空')
  }

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearUserData())
    navigate('/login')
  }

  const handleViewSkill = (skillId) => {
    navigate(`/skill/${skillId}`)
  }

  const handleMarkUpdateAsRead = (updateId) => {
    dispatch(markUpdateAsRead(updateId))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllUpdatesAsRead())
    message.success('已全部标记为已读')
  }

  const handleExportHistory = () => {
    const filteredHistory = getFilteredHistory()
    if (filteredHistory.length === 0) {
      message.warning('没有可导出的浏览记录')
      return
    }

    const csvContent = [
      ['技艺名称', '分类', '浏览时间', '浏览时长(秒)'].join(','),
      ...filteredHistory.map((h) =>
        [h.skillName, h.category, h.viewTime, h.duration].join(',')
      ),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `浏览记录_${dayjs().format('YYYYMMDD_HHmmss')}.csv`
    link.click()

    message.success('浏览记录导出成功')
  }

  const handleMaterialSelect = (materialId) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    )
  }

  const handleSelectAllMaterials = () => {
    if (selectedMaterials.length === downloadMaterials.length) {
      setSelectedMaterials([])
    } else {
      setSelectedMaterials(downloadMaterials.map((m) => m.id))
    }
  }

  const handleBatchDownload = async () => {
    if (selectedMaterials.length === 0) {
      message.warning('请选择要下载的素材')
      return
    }

    const materials = downloadMaterials.filter((m) => selectedMaterials.includes(m.id))

    setDownloadProgress(0)
    const total = materials.length

    for (let i = 0; i < materials.length; i++) {
      await dispatch(downloadMaterial(materials[i])).unwrap()
      setDownloadProgress(Math.round(((i + 1) / total) * 100))
    }

    await dispatch(batchDownloadMaterials(materials)).unwrap()
    message.success(`成功下载 ${materials.length} 个素材文件`)
    setSelectedMaterials([])
    setDownloadProgress(0)
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return '档案管理员'
      case 'inheritor':
        return '古法造纸传承人'
      default:
        return '普通用户'
    }
  }

  const unreadUpdateCount = skillUpdates.filter((u) => !u.isRead).length

  const filteredFavorites = favoriteCategory
    ? favorites.filter((f) => f.category === favoriteCategory)
    : favorites

  const filteredFollowList = followLevel
    ? followList.filter((f) => f.level === followLevel)
    : followList

  const getFilteredHistory = () => {
    let result = [...browseHistory]

    if (historyCategory) {
      result = result.filter((h) => h.category === historyCategory)
    }

    if (historyDateRange && historyDateRange.length === 2) {
      const start = historyDateRange[0].startOf('day')
      const end = historyDateRange[1].endOf('day')
      result = result.filter((h) => {
        const viewDate = dayjs(h.viewTime)
        return viewDate.isAfter(start) && viewDate.isBefore(end)
      })
    }

    if (historyKeyword) {
      result = result.filter((h) =>
        h.skillName.toLowerCase().includes(historyKeyword.toLowerCase())
      )
    }

    return result
  }

  const totalViews = viewStatistics.reduce((sum, item) => sum + item.count, 0)
  const maxViews = Math.max(...viewStatistics.map((item) => item.count))

  const categories = ['宣纸', '皮纸', '竹纸', '麻纸', '棉纸', '特色纸']
  const levels = ['国家级', '省级', '市级']

  const getFileTypeIcon = (type) => {
    switch (type) {
      case '文档':
        return <FileTextOutlined style={{ color: '#1890ff' }} />
      case '视频':
        return <PlayCircleOutlined style={{ color: '#f5222d' }} />
      case '压缩包':
        return <FileZipOutlined style={{ color: '#fa8c16' }} />
      default:
        return <FileTextOutlined />
    }
  }

  const getUpdateTypeIcon = (type) => {
    switch (type) {
      case 'content':
        return '📄'
      case 'inheritor':
        return '👤'
      case 'activity':
        return '🎉'
      default:
        return '📢'
    }
  }

  const favoriteColumns = [
    {
      title: '技艺名称',
      dataIndex: 'skillName',
      key: 'skillName',
      render: (text, record) => (
        <a onClick={() => handleViewSkill(record.skillId)} style={{ color: '#8B6914' }}>
          {text}
        </a>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '收藏时间',
      dataIndex: 'addTime',
      key: 'addTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="确定要取消收藏吗？"
          onConfirm={() => handleRemoveFavorite(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            取消收藏
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const followColumns = [
    {
      title: '传承人',
      dataIndex: 'inheritorName',
      key: 'inheritorName',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '职称级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (text) => (
        <Tag color={text === '国家级' ? 'gold' : 'blue'}>{text}</Tag>
      ),
    },
    {
      title: '擅长技艺',
      dataIndex: 'skill',
      key: 'skill',
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: '关注时间',
      dataIndex: 'followTime',
      key: 'followTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="确定要取消关注吗？"
          onConfirm={() => handleRemoveFollow(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            取消关注
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const historyColumns = [
    {
      title: '技艺名称',
      dataIndex: 'skillName',
      key: 'skillName',
      render: (text, record) => (
        <a onClick={() => handleViewSkill(record.skillId)} style={{ color: '#8B6914' }}>
          {text}
        </a>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '浏览时间',
      dataIndex: 'viewTime',
      key: 'viewTime',
      width: 180,
    },
    {
      title: '浏览时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (duration) => `${Math.floor(duration / 60)}分${duration % 60}秒`,
    },
  ]

  const menuItems = [
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: '我的收藏',
      badge: favorites.length,
    },
    {
      key: 'following',
      icon: <UserAddOutlined />,
      label: '我的关注',
      badge: followList.length,
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: '浏览记录',
      badge: browseHistory.length,
    },
    {
      key: 'downloads',
      icon: <DownloadOutlined />,
      label: '素材下载',
    },
    {
      key: 'statistics',
      icon: <BarChartOutlined />,
      label: '浏览统计',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账号设置',
    },
  ]

  const renderContent = () => {
    switch (selectedMenu) {
      case 'favorites':
        return (
          <Card
            title={
              <Space>
                <HeartOutlined />
                我的收藏
              </Space>
            }
            extra={
              <Space>
                <Select
                  placeholder="按分类筛选"
                  style={{ width: 140 }}
                  allowClear
                  value={favoriteCategory}
                  onChange={setFavoriteCategory}
                >
                  {categories.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Select>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  共 {filteredFavorites.length} 个收藏
                </Text>
              </Space>
            }
          >
            {filteredFavorites.length > 0 ? (
              <Table
                columns={favoriteColumns}
                dataSource={filteredFavorites}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                loading={loading}
              />
            ) : (
              <Empty description="暂无收藏的技艺" />
            )}
          </Card>
        )

      case 'following':
        return (
          <Card
            title={
              <Space>
                <UserAddOutlined />
                我的关注
              </Space>
            }
            extra={
              <Space>
                <Select
                  placeholder="按级别筛选"
                  style={{ width: 140 }}
                  allowClear
                  value={followLevel}
                  onChange={setFollowLevel}
                >
                  {levels.map((level) => (
                    <Option key={level} value={level}>
                      {level}
                    </Option>
                  ))}
                </Select>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  共关注 {filteredFollowList.length} 位传承人
                </Text>
              </Space>
            }
          >
            {filteredFollowList.length > 0 ? (
              <Table
                columns={followColumns}
                dataSource={filteredFollowList}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                loading={loading}
              />
            ) : (
              <Empty description="暂无关注的传承人" />
            )}
          </Card>
        )

      case 'history':
        return (
          <Card
            title={
              <Space>
                <HistoryOutlined />
                浏览记录
              </Space>
            }
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  size="small"
                  onClick={handleExportHistory}
                >
                  导出记录
                </Button>
                {getFilteredHistory().length > 0 && (
                  <Popconfirm
                    title="确定要清空所有浏览记录吗？"
                    onConfirm={handleClearHistory}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="link" danger size="small">
                      清空记录
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            }
          >
            {/* 筛选栏 */}
            <Card
              size="small"
              style={{ marginBottom: '16px', background: '#fafafa' }}
              bodyStyle={{ padding: '12px' }}
            >
              <Space wrap size="middle">
                <Space>
                  <FilterOutlined style={{ color: '#8B6914' }} />
                  <span style={{ fontWeight: '500' }}>筛选：</span>
                </Space>
                <Select
                  placeholder="分类"
                  style={{ width: 120 }}
                  allowClear
                  value={historyCategory}
                  onChange={setHistoryCategory}
                >
                  {categories.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Select>
                <RangePicker
                  placeholder={['开始日期', '结束日期']}
                  value={historyDateRange}
                  onChange={setHistoryDateRange}
                  allowClear
                />
                <Search
                  placeholder="搜索技艺名称"
                  allowClear
                  style={{ width: 200 }}
                  value={historyKeyword}
                  onChange={(e) => setHistoryKeyword(e.target.value)}
                />
                <Button
                  icon={<ClearOutlined />}
                  size="small"
                  onClick={() => {
                    setHistoryCategory(null)
                    setHistoryDateRange(null)
                    setHistoryKeyword('')
                  }}
                >
                  清除
                </Button>
              </Space>
            </Card>

            {getFilteredHistory().length > 0 ? (
              <Table
                columns={historyColumns}
                dataSource={getFilteredHistory()}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                loading={loading}
              />
            ) : (
              <Empty description="暂无符合条件的浏览记录" />
            )}
          </Card>
        )

      case 'downloads':
        return (
          <Card
            title={
              <Space>
                <DownloadOutlined />
                造纸流程素材下载
              </Space>
            }
            extra={
              <Space>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  已选择 {selectedMaterials.length} / {downloadMaterials.length}
                </Text>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleBatchDownload}
                  disabled={selectedMaterials.length === 0}
                  loading={downloading}
                >
                  批量下载
                </Button>
              </Space>
            }
          >
            {downloading && downloadProgress > 0 && (
              <Card
                size="small"
                style={{ marginBottom: '16px', background: '#f0f5ff' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>正在下载素材...</Text>
                  <Progress percent={downloadProgress} status="active" />
                </Space>
              </Card>
            )}

            <div style={{ marginBottom: '16px' }}>
              <Checkbox
                checked={selectedMaterials.length === downloadMaterials.length && downloadMaterials.length > 0}
                onChange={handleSelectAllMaterials}
              >
                全选
              </Checkbox>
            </div>

            {downloadMaterials.length > 0 ? (
              <Row gutter={[16, 16]}>
                {downloadMaterials.map((material) => (
                  <Col xs={24} sm={12} key={material.id}>
                    <Card
                      hoverable
                      className="card-hover"
                      size="small"
                      style={{
                        border: selectedMaterials.includes(material.id)
                          ? '2px solid #8B6914'
                          : '1px solid #f0f0f0',
                      }}
                    >
                      <Space align="start" style={{ width: '100%' }}>
                        <Checkbox
                          checked={selectedMaterials.includes(material.id)}
                          onChange={() => handleMaterialSelect(material.id)}
                        />
                        <div style={{ flex: 1 }}>
                          <Space style={{ marginBottom: '8px' }}>
                            {getFileTypeIcon(material.type)}
                            <Text strong>{material.name}</Text>
                            <Tag color="blue" size="small">
                              {material.type}
                            </Tag>
                          </Space>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ marginBottom: '8px', fontSize: '13px', color: '#666' }}
                          >
                            {material.description}
                          </Paragraph>
                          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {material.size}
                            </Text>
                            <Button
                              type="link"
                              size="small"
                              icon={<DownloadOutlined />}
                              onClick={async () => {
                                await dispatch(downloadMaterial(material)).unwrap()
                                message.success(`${material.name} 下载成功`)
                              }}
                              loading={downloading}
                            >
                              下载
                            </Button>
                          </Space>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="暂无可下载的素材" />
            )}
          </Card>
        )

      case 'statistics':
        return (
          <Card
            title={
              <Space>
                <BarChartOutlined />
                浏览量统计
              </Space>
            }
          >
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={12} sm={8}>
                <Card className="paper-bg">
                  <Statistic
                    title="总浏览量"
                    value={totalViews}
                    suffix="次"
                    valueStyle={{ color: '#8B6914' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card className="paper-bg">
                  <Statistic
                    title="日均浏览"
                    value={Math.round(totalViews / viewStatistics.length)}
                    suffix="次"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card className="paper-bg">
                  <Statistic
                    title="最高日浏览"
                    value={maxViews}
                    suffix="次"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="近7天浏览趋势" size="small">
              <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                {viewStatistics.map((item) => (
                  <Tooltip
                    key={item.date}
                    title={`${item.date}: ${item.count} 次`}
                    placement="top"
                  >
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div
                        style={{
                          background: 'linear-gradient(180deg, #8B6914 0%, #c4a574 100%)',
                          height: `${(item.count / maxViews) * 150}px`,
                          borderRadius: '4px 4px 0 0',
                          minHeight: '4px',
                          transition: 'all 0.3s',
                        }}
                      />
                      <Text style={{ fontSize: '11px', color: '#999' }}>
                        {item.date.slice(5)}
                      </Text>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </Card>
          </Card>
        )

      case 'settings':
        return (
          <Card
            title={
              <Space>
                <SettingOutlined />
                账号设置
              </Space>
            }
          >
            <Descriptions column={1} bordered>
              <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
              <Descriptions.Item label="用户角色">
                <Tag color="gold">{getRoleLabel(user?.role)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">{user?.createTime}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{user?.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{user?.phone || '-'}</Descriptions.Item>
              {user?.role === 'inheritor' && (
                <>
                  <Descriptions.Item label="职称">{user?.title || '-'}</Descriptions.Item>
                  <Descriptions.Item label="擅长技艺">{user?.skill || '-'}</Descriptions.Item>
                  <Descriptions.Item label="从业年限">
                    {user?.experience ? `${user.experience}年` : '-'}
                  </Descriptions.Item>
                </>
              )}
              {user?.role === 'admin' && (
                <Descriptions.Item label="所属部门">{user?.department || '-'}</Descriptions.Item>
              )}
            </Descriptions>

            {/* 权限区分展示 */}
            {user?.role === 'admin' && (
              <div style={{ marginTop: '24px' }}>
                <Divider orientation="left">管理员专属功能</Divider>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Card className="paper-bg" hoverable>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Title level={5} style={{ marginBottom: 0 }}>
                          📊 数据管理
                        </Title>
                        <Text type="secondary">管理平台所有数据，包括技艺档案、用户信息等</Text>
                        <Button type="primary" block>
                          进入管理后台
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card className="paper-bg" hoverable>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Title level={5} style={{ marginBottom: 0 }}>
                          👥 用户审核
                        </Title>
                        <Text type="secondary">审核传承人认证申请，管理用户权限</Text>
                        <Button type="primary" block>
                          审核管理
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {user?.role === 'inheritor' && (
              <div style={{ marginTop: '24px' }}>
                <Divider orientation="left">传承人专属功能</Divider>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Card className="paper-bg" hoverable>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Title level={5} style={{ marginBottom: 0 }}>
                          ✏️ 技艺管理
                        </Title>
                        <Text type="secondary">编辑和管理您的技艺档案信息</Text>
                        <Button type="primary" block>
                          管理我的技艺
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card className="paper-bg" hoverable>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Title level={5} style={{ marginBottom: 0 }}>
                          📹 素材上传
                        </Title>
                        <Text type="secondary">上传您的造纸技艺视频和图片素材</Text>
                        <Button type="primary" block>
                          上传素材
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <Button type="primary" style={{ marginRight: '12px' }}>
                编辑资料
              </Button>
              <Button onClick={handleLogout} icon={<LogoutOutlined />} danger>
                退出登录
              </Button>
            </div>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <Layout style={{ background: '#f5f0e8', minHeight: '100vh' }}>
      <Content className="page-container">
        {/* 用户信息卡片 */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Row align="middle">
                <Col flex="none">
                  <Avatar
                    src={user?.avatar}
                    icon={<UserOutlined />}
                    size={80}
                    style={{ marginRight: '24px' }}
                  />
                </Col>
                <Col flex="auto">
                  <Space direction="vertical" size="small">
                    <Title level={3} style={{ marginBottom: 0 }}>
                      {user?.name}
                    </Title>
                    <Space>
                      <Tag color="gold" style={{ fontSize: '14px', padding: '4px 12px' }}>
                        {getRoleLabel(user?.role)}
                      </Tag>
                      <Text type="secondary">@{user?.username}</Text>
                    </Space>
                    <Space size="large">
                      <span>
                        <HeartOutlined style={{ marginRight: '4px', color: '#ff4d4f' }} />
                        {favorites.length} 收藏
                      </span>
                      <span>
                        <UserAddOutlined style={{ marginRight: '4px', color: '#1890ff' }} />
                        {followList.length} 关注
                      </span>
                      <span>
                        <HistoryOutlined style={{ marginRight: '4px', color: '#52c41a' }} />
                        {browseHistory.length} 浏览
                      </span>
                    </Space>
                  </Space>
                </Col>
              </Row>
            </Col>
            <Col>
              <Space>
                <Tooltip title="技艺更新提醒">
                  <Badge count={unreadUpdateCount} size="small">
                    <Button
                      icon={<BellOutlined />}
                      onClick={() => setUpdateModalVisible(true)}
                    >
                      消息
                    </Button>
                  </Badge>
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8} md={6}>
            <Sider
              width="100%"
              style={{
                background: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <Menu
                mode="inline"
                selectedKeys={[selectedMenu]}
                onClick={handleMenuClick}
                style={{ height: '100%', borderRight: 0 }}
                items={menuItems.map((item) => ({
                  key: item.key,
                  icon: item.icon,
                  label: (
                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Tag color="red" style={{ margin: 0 }}>
                          {item.badge}
                        </Tag>
                      )}
                    </Space>
                  ),
                }))}
              />
            </Sider>
          </Col>
          <Col xs={24} sm={16} md={18}>
            {renderContent()}
          </Col>
        </Row>
      </Content>

      {/* 技艺更新提醒弹窗 */}
      <Modal
        title={
          <Space>
            <BellOutlined style={{ color: '#faad14' }} />
            技艺更新提醒
          </Space>
        }
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        footer={
          <Space>
            {unreadUpdateCount > 0 && (
              <Button onClick={handleMarkAllAsRead}>
                <CheckOutlined /> 全部标为已读
              </Button>
            )}
            <Button type="primary" onClick={() => setUpdateModalVisible(false)}>
              关闭
            </Button>
          </Space>
        }
        width={600}
      >
        <List
          dataSource={skillUpdates}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleMarkUpdateAsRead(item.id)}
              style={{
                background: item.isRead ? 'transparent' : '#fffbe6',
                borderRadius: '8px',
                marginBottom: '8px',
                cursor: 'pointer',
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      background: item.isRead ? '#d9d9d9' : '#faad14',
                      verticalAlign: 'middle',
                    }}
                  >
                    {getUpdateTypeIcon(item.updateType)}
                  </Avatar>
                }
                title={
                  <Space>
                    <span style={{ fontWeight: item.isRead ? 'normal' : 'bold' }}>
                      {item.title}
                    </span>
                    {!item.isRead && <Tag color="red">新</Tag>}
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text>{item.content}</Text>
                    <Space>
                      <Tag color="blue">{item.skillName}</Tag>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.updateTime}
                      </Text>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </Layout>
  )
}

export default Profile
