import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Tag, Avatar, Empty, Button, Select, Tabs, Statistic, Row as AntRow, Col as AntCol, message } from 'antd'
import { PlayCircleOutlined, EyeOutlined, HeartOutlined, FolderOutlined, SettingOutlined } from '@ant-design/icons'
import { fetchTutorials, fetchInheritors, fetchFavorites, addFavoriteFolder, updateFavoriteFolder, deleteFavoriteFolder, removeTutorialFromFolder } from '../store/slices/dataSlice'
import { toggleFavorite } from '../store/slices/userSlice'
import LoadingState from '../components/LoadingState'
import FavoriteFolderModal from '../components/FavoriteFolderModal'

const { Meta } = Card

const Favorites = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { tutorials, inheritors, favorites, loading } = useSelector(state => state.data)
  const currentUser = useSelector(state => state.user.currentUser)
  
  const [activeTab, setActiveTab] = useState('all')
  const [sortType, setSortType] = useState('default')
  const [folderModalVisible, setFolderModalVisible] = useState(false)
  const [filterLevel, setFilterLevel] = useState('all')

  useEffect(() => {
    dispatch(fetchTutorials())
    dispatch(fetchInheritors())
    if (currentUser) {
      dispatch(fetchFavorites(currentUser.id))
    }
  }, [dispatch, currentUser])

  const handleCreateFolder = (values) => {
    dispatch(addFavoriteFolder({ ...values, userId: currentUser.id, tutorials: [] }))
  }

  const handleUpdateFolder = (id, values) => {
    dispatch(updateFavoriteFolder({ id, data: values }))
  }

  const handleDeleteFolder = (folderId) => {
    dispatch(deleteFavoriteFolder(folderId))
  }

  const handleRemoveFromFolder = (folderId, tutorialId) => {
    dispatch(removeTutorialFromFolder({ folderId, tutorialId }))
    message.success('已从收藏夹移除')
  }

  const handleToggleFavorite = (tutorialId) => {
    if (currentUser) {
      dispatch(toggleFavorite({ tutorialId, userId: currentUser.id }))
    }
  }

  const getDisplayTutorials = () => {
    let tutorialList = []
    
    if (activeTab === 'all') {
      tutorialList = tutorials.filter(t => currentUser?.favorites?.includes(t.id))
    } else {
      const folder = favorites.find(f => f.id === parseInt(activeTab))
      if (folder) {
        tutorialList = tutorials.filter(t => folder.tutorials?.includes(t.id))
      }
    }

    if (filterLevel !== 'all') {
      tutorialList = tutorialList.filter(t => t.level === filterLevel)
    }

    switch (sortType) {
      case 'views':
        return [...tutorialList].sort((a, b) => b.views - a.views)
      case 'likes':
        return [...tutorialList].sort((a, b) => b.likes - a.likes)
      case 'newest':
        return [...tutorialList].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      default:
        return tutorialList
    }
  }

  const displayTutorials = getDisplayTutorials()

  const getTabItems = () => {
    const items = [
      { key: 'all', label: `全部收藏 (${currentUser?.favorites?.length || 0})` }
    ]
    favorites.forEach(folder => {
      items.push({
        key: folder.id.toString(),
        label: (
          <span>
            <FolderOutlined style={{ marginRight: 4 }} />
            {folder.name} ({folder.tutorials?.length || 0})
          </span>
        )
      })
    })
    return items
  }

  const getStatistics = () => {
    const allFavorites = tutorials.filter(t => currentUser?.favorites?.includes(t.id))
    const totalViews = allFavorites.reduce((sum, t) => sum + t.views, 0)
    const totalLikes = allFavorites.reduce((sum, t) => sum + t.likes, 0)
    return { totalViews, totalLikes }
  }

  const stats = getStatistics()

  if (loading.tutorials || loading.favorites) {
    return <LoadingState />
  }

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Empty description="请先登录查看收藏" />
        <Button type="primary" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>
          去登录
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>我的收藏</h1>
              <p>共收藏 {currentUser?.favorites?.length || 0} 个教程</p>
            </div>
            <Button 
              icon={<SettingOutlined />}
              onClick={() => setFolderModalVisible(true)}
            >
              管理收藏夹
            </Button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        <Card style={{ marginBottom: 24 }}>
          <AntRow gutter={16}>
            <AntCol span={8}>
              <Statistic 
                title="收藏教程数" 
                value={currentUser?.favorites?.length || 0}
                prefix={<FolderOutlined />}
                valueStyle={{ color: '#2d5a27' }}
              />
            </AntCol>
            <AntCol span={8}>
              <Statistic 
                title="总浏览量" 
                value={stats.totalViews}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </AntCol>
            <AntCol span={8}>
              <Statistic 
                title="总点赞数" 
                value={stats.totalLikes}
                prefix={<HeartOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </AntCol>
          </AntRow>
        </Card>

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={getTabItems()}
            tabBarExtraContent={
              <div style={{ display: 'flex', gap: 12 }}>
                <Select
                  value={filterLevel}
                  onChange={setFilterLevel}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Select.Option value="all">全部难度</Select.Option>
                  <Select.Option value="beginner">入门</Select.Option>
                  <Select.Option value="intermediate">进阶</Select.Option>
                  <Select.Option value="advanced">高级</Select.Option>
                </Select>
                <Select
                  value={sortType}
                  onChange={setSortType}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Select.Option value="default">默认排序</Select.Option>
                  <Select.Option value="views">按热度</Select.Option>
                  <Select.Option value="likes">按点赞</Select.Option>
                  <Select.Option value="newest">按时间</Select.Option>
                </Select>
              </div>
            }
          />

          {displayTutorials.length > 0 ? (
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
              {displayTutorials.map(tutorial => (
                <Col xs={24} sm={12} lg={8} key={tutorial.id}>
                  <Card
                    hoverable
                    className="card-hover"
                    cover={
                      <div style={{
                        height: 220,
                        background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${tutorial.cover}) center/cover`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative'
                      }} onClick={() => navigate(`/tutorial/${tutorial.id}`)}>
                        <PlayCircleOutlined style={{ fontSize: 64, color: 'white', opacity: 0.9 }} />
                        <Tag 
                          color={tutorial.level === 'beginner' ? 'green' : tutorial.level === 'intermediate' ? 'orange' : 'red'}
                          style={{ position: 'absolute', top: 12, left: 12 }}
                        >
                          {tutorial.level === 'beginner' ? '入门' : tutorial.level === 'intermediate' ? '进阶' : '高级'}
                        </Tag>
                        <Tag color="blue" style={{ position: 'absolute', top: 12, right: 12 }}>
                          {tutorial.duration}
                        </Tag>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<HeartOutlined style={{ color: 'white', fontSize: 16 }} />}
                          style={{ 
                            position: 'absolute', 
                            bottom: 12, 
                            right: 12,
                            background: 'rgba(255,255,255,0.2)'
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFavorite(tutorial.id)
                          }}
                        />
                      </div>
                    }
                    onClick={() => navigate(`/tutorial/${tutorial.id}`)}
                    actions={activeTab !== 'all' ? [
                      <Button 
                        type="text" 
                        size="small"
                        danger
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFromFolder(parseInt(activeTab), tutorial.id)
                        }}
                      >
                        移出收藏夹
                      </Button>
                    ] : []}
                  >
                    <Meta
                      title={tutorial.title}
                      description={
                        <div>
                          <div style={{ color: '#666', fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
                            {tutorial.description.substring(0, 60)}...
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Avatar size={24} src={inheritors.find(i => i.name === tutorial.author)?.avatar} />
                              <span style={{ fontSize: 12, color: '#666' }}>{tutorial.author}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ fontSize: 12, color: '#999' }}>
                                <EyeOutlined style={{ marginRight: 4 }} />{tutorial.views}
                              </span>
                              <span style={{ fontSize: 12, color: '#999' }}>
                                <HeartOutlined style={{ marginRight: 4 }} />{tutorial.likes}
                              </span>
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              description={
                activeTab === 'all' 
                  ? '还没有收藏任何教程' 
                  : '该收藏夹暂无教程'
              } 
              style={{ padding: '60px 0' }} 
            />
          )}
        </Card>
      </div>

      <FavoriteFolderModal
        visible={folderModalVisible}
        onClose={() => setFolderModalVisible(false)}
        folders={favorites}
        tutorials={tutorials}
        onCreateFolder={handleCreateFolder}
        onUpdateFolder={handleUpdateFolder}
        onDeleteFolder={handleDeleteFolder}
      />
    </div>
  )
}

export default Favorites
