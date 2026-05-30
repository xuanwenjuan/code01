import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Tabs, Row, Col, Card, Typography, Button, Upload, Form, Input, Select, Modal, 
  List, Avatar, Tag, message, Empty, Popconfirm, Dropdown, Menu, Badge,
  Alert, Space, Statistic
} from 'antd';
import { 
  UploadOutlined, PlusOutlined, FolderOpenOutlined, StarOutlined, HeartOutlined, 
  ShareAltOutlined, DeleteOutlined, MoreOutlined, EditOutlined, BellOutlined,
  CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, NotificationOutlined
} from '@ant-design/icons';
import { addWork, updateWork, deleteWork, markNotificationRead, clearAllNotifications } from '../../store/slices/worksSlice';
import { fetchCollections, createCollection, addToCollection, removeFromCollection } from '../../store/slices/communitySlice';
import WorkCard from '../../components/Common/WorkCard';
import Loading from '../../components/Status/Loading';
import './Community.css';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Community = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.auth);
  const { works, loading, notifications, favorites } = useSelector(state => state.works);
  const { collections } = useSelector(state => state.community);
  const [activeTab, setActiveTab] = useState('square');
  const [uploadModal, setUploadModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [collectionModal, setCollectionModal] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);
  const [addWorkToCollectionModal, setAddWorkToCollectionModal] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [editingWork, setEditingWork] = useState(null);
  const [uploadForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [collectionForm] = Form.useForm();
  const [previewImage, setPreviewImage] = useState(null);
  const [editPreviewImage, setEditPreviewImage] = useState(null);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchCollections(currentUser.id));
    }
  }, [currentUser, dispatch]);

  const tabItems = [
    { key: 'square', label: '作品广场' },
    { key: 'myworks', label: '我的作品' },
    { key: 'collections', label: '我的收藏' },
  ];

  const categoryOptions = [
    { value: 'folk', label: '民俗类' },
    { value: 'flower', label: '花鸟类' },
    { value: 'figure', label: '人物类' },
  ];

  const isAdmin = currentUser?.role === 'admin';
  const userWorks = currentUser ? works.filter(w => w.authorId === currentUser.id) : [];
  const manageableWorks = isAdmin ? works : userWorks;
  const favoriteWorks = works.filter(w => favorites.includes(w.id));
  const unreadNotifications = notifications.filter(n => !n.read);

  const handleUpload = async (values) => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    try {
      const formData = {
        ...values,
        image: previewImage || 'https://images.unsplash.com/photo-1609749893505-9091ae6f54e7?w=400&h=400&fit=crop',
        author: currentUser.nickname,
        authorId: currentUser.id,
        tags: values.tags?.split(',').map(t => t.trim()) || [],
      };
      await dispatch(addWork(formData)).unwrap();
      uploadForm.resetFields();
      setPreviewImage(null);
      setUploadModal(false);
    } catch (error) {
      message.error('上传失败，请重试');
    }
  };

  const handleEdit = async (values) => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    if (!editingWork) return;
    
    const isOwner = editingWork.authorId === currentUser.id;
    if (!isOwner && !isAdmin) {
      message.error('您没有权限编辑此作品');
      return;
    }

    try {
      const formData = {
        ...values,
        image: editPreviewImage || editingWork.image,
        tags: values.tags?.split(',').map(t => t.trim()) || [],
      };
      await dispatch(updateWork({ workId: editingWork.id, workData: formData })).unwrap();
      editForm.resetFields();
      setEditPreviewImage(null);
      setEditingWork(null);
      setEditModal(false);
    } catch (error) {
      message.error('更新失败，请重试');
    }
  };

  const handleDelete = async (workId) => {
    try {
      await dispatch(deleteWork(workId)).unwrap();
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  const openEditModal = (work) => {
    setEditingWork(work);
    setEditPreviewImage(work.image);
    editForm.setFieldsValue({
      title: work.title,
      category: work.category,
      description: work.description,
      tags: work.tags?.join(', ') || '',
    });
    setEditModal(true);
  };

  const handleCreateCollection = async (values) => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    try {
      await dispatch(createCollection({
        ...values,
        userId: currentUser.id,
      })).unwrap();
      collectionForm.resetFields();
      setCollectionModal(false);
    } catch (error) {
      message.error('创建失败，请重试');
    }
  };

  const handleAddToCollection = (collectionId) => {
    dispatch(addToCollection({
      collectionId,
      workId: addWorkToCollectionModal,
    }));
    message.success('已添加到合集');
    setAddWorkToCollectionModal(null);
  };

  const handleRemoveFromCollection = (collectionId, workId) => {
    dispatch(removeFromCollection({ collectionId, workId }));
    message.success('已从合集中移除');
  };

  const handleUploadChange = (info) => {
    if (info.file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const handleEditUploadChange = (info) => {
    if (info.file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditPreviewImage(e.target.result);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const handleShare = () => {
    message.success('分享链接已复制到剪贴板');
  };

  const handleMarkNotificationRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const handleClearAllNotifications = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有通知吗？',
      onOk: () => {
        dispatch(clearAllNotifications());
        message.success('已清空所有通知');
      },
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'comment': return <NotificationOutlined style={{ color: '#1890ff' }} />;
      default: return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const renderSquare = () => (
    <div>
      <div className="square-header">
        <div>
          <Title level={3}>作品广场</Title>
          <Paragraph type="secondary">浏览和欣赏剪纸爱好者的优秀作品</Paragraph>
        </div>
        <Space>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            overlay={
              <Menu>
                <Menu.ItemGroup title="通知中心">
                  {unreadNotifications.length > 0 && (
                    <Menu.Item>
                      <Badge.Ribbon text={`${unreadNotifications.length} 条未读`} color="red">
                        <span onClick={() => setNotificationModal(true)}>查看所有通知</span>
                      </Badge.Ribbon>
                    </Menu.Item>
                  )}
                  {notifications.slice(0, 5).map(notification => (
                    <Menu.Item 
                      key={notification.id}
                      onClick={() => handleMarkNotificationRead(notification.id)}
                      style={{ opacity: notification.read ? 0.6 : 1 }}
                    >
                      <Space>
                        {getNotificationIcon(notification.type)}
                        <span style={{ maxWidth: 200 }}>{notification.message}</span>
                      </Space>
                    </Menu.Item>
                  ))}
                  {notifications.length > 0 && (
                    <Menu.Divider />
                  )}
                  <Menu.Item onClick={() => setNotificationModal(true)}>
                    查看全部通知
                  </Menu.Item>
                </Menu.ItemGroup>
              </Menu>
            }
          >
            <Badge count={unreadNotifications.length}>
              <Button icon={<BellOutlined />}>通知</Button>
            </Badge>
          </Dropdown>
          {currentUser && (
            <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModal(true)}>
              上传作品
            </Button>
          )}
        </Space>
      </div>

      {loading ? (
        <Loading />
      ) : works.length === 0 ? (
        <Empty description="暂无作品，快去上传你的第一幅作品吧" />
      ) : (
        <Row gutter={[24, 24]}>
          {works.map(work => (
            <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
              <WorkCard 
                work={work} 
                showManage={isAdmin}
                onEdit={openEditModal}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  const renderMyWorks = () => (
    <div>
      <div className="square-header">
        <div>
          <Title level={3}>我的作品</Title>
          <Paragraph type="secondary">管理你上传的剪纸作品</Paragraph>
        </div>
        {currentUser && (
          <Space>
            <div className="work-stats">
              <Statistic title="作品总数" value={userWorks.length} />
            </div>
            <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModal(true)}>
              上传作品
            </Button>
          </Space>
        )}
      </div>

      {!currentUser ? (
        <Empty description="请先登录查看你的作品" />
      ) : userWorks.length === 0 ? (
        <Empty description="你还没有上传作品，快去上传你的第一幅作品吧">
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModal(true)}>
            立即上传
          </Button>
        </Empty>
      ) : (
        <Row gutter={[24, 24]}>
          {userWorks.map(work => (
            <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
              <WorkCard 
                work={work} 
                showManage={true}
                onEdit={openEditModal}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  const renderCollections = () => (
    <div>
      <div className="square-header">
        <div>
          <Title level={3}>我的收藏</Title>
          <Paragraph type="secondary">管理你的收藏合集和喜欢的作品</Paragraph>
        </div>
        {currentUser && (
          <Space>
            <div className="work-stats">
              <Statistic title="收藏作品" value={favoriteWorks.length} />
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCollectionModal(true)}>
              创建合集
            </Button>
          </Space>
        )}
      </div>

      {!currentUser ? (
        <Empty description="请先登录查看你的收藏" />
      ) : (
        <div>
          <Card 
            title="收藏的作品" 
            style={{ marginBottom: 24 }}
            extra={<Tag color="blue">{favoriteWorks.length} 个作品</Tag>}
          >
            {favoriteWorks.length === 0 ? (
              <Empty description="还没有收藏任何作品，快去作品广场看看吧" />
            ) : (
              <Row gutter={[16, 16]}>
                {favoriteWorks.map(work => (
                  <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
                    <WorkCard work={work} showManage={false} />
                  </Col>
                ))}
              </Row>
            )}
          </Card>

          <Card 
            title="我的合集" 
            extra={<Tag color="green">{collections.length} 个合集</Tag>}
          >
            {collections.length === 0 ? (
              <Empty description="还没有创建合集，创建一个来收藏喜欢的作品吧">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCollectionModal(true)}>
                  创建合集
                </Button>
              </Empty>
            ) : (
              <Row gutter={[24, 24]}>
                {collections.map(collection => (
                  <Col xs={24} md={12} key={collection.id}>
                    <Card
                      className="collection-card"
                      hoverable
                      onClick={() => setSelectedCollection(collection)}
                    >
                      <div className="collection-header">
                        <div className="collection-icon">
                          <FolderOpenOutlined />
                        </div>
                        <div className="collection-info">
                          <Title level={4} style={{ margin: 0 }}>{collection.name}</Title>
                          <Text type="secondary">{collection.works.length} 个作品</Text>
                        </div>
                      </div>
                      <div className="collection-works">
                        {collection.works.length === 0 ? (
                          <Empty description="合集为空" image={null} style={{ padding: 20 }} />
                        ) : (
                          <Row gutter={[8, 8]}>
                            {collection.works.slice(0, 4).map(workId => {
                              const work = works.find(w => w.id === workId);
                              return work ? (
                                <Col span={6} key={workId}>
                                  <img 
                                    src={work.image} 
                                    alt="" 
                                    style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} 
                                  />
                                </Col>
                              ) : null;
                            })}
                          </Row>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </div>
      )}

      <Modal
        title={selectedCollection?.name}
        open={!!selectedCollection}
        onCancel={() => setSelectedCollection(null)}
        footer={null}
        width={1000}
      >
        {selectedCollection && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Text type="secondary">创建于 {selectedCollection.createdAt}</Text>
            </div>
            {selectedCollection.works.length === 0 ? (
              <Empty description="合集为空，快去作品广场收藏喜欢的作品吧" />
            ) : (
              <Row gutter={[16, 16]}>
                {selectedCollection.works.map(workId => {
                  const work = works.find(w => w.id === workId);
                  return work ? (
                    <Col xs={24} sm={12} md={8} key={workId}>
                      <WorkCard
                        work={work}
                        showManage={false}
                        actions={[
                          <Popconfirm
                            title="确定从合集中移除吗？"
                            onConfirm={() => handleRemoveFromCollection(selectedCollection.id, workId)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button type="text" danger icon={<DeleteOutlined />}>移除</Button>
                          </Popconfirm>
                        ]}
                      />
                    </Col>
                  ) : null;
                })}
              </Row>
            )}
          </div>
        )}
      </Modal>
    </div>
  );

  const uploadProps = {
    beforeUpload: () => false,
    onChange: handleUploadChange,
    fileList: previewImage ? [{
      uid: '-1',
      name: 'image.png',
      status: 'done',
      url: previewImage,
    }] : [],
  };

  const editUploadProps = {
    beforeUpload: () => false,
    onChange: handleEditUploadChange,
    fileList: editPreviewImage ? [{
      uid: '-1',
      name: 'image.png',
      status: 'done',
      url: editPreviewImage,
    }] : [],
  };

  return (
    <div className="community-page">
      <div className="container">
        <div className="page-header">
          <Title level={2}>交流分享</Title>
          <Paragraph type="secondary">
            分享你的剪纸作品，与同好交流学习
          </Paragraph>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="community-tabs"
        />

        <div className="tab-content">
          {activeTab === 'square' && renderSquare()}
          {activeTab === 'myworks' && renderMyWorks()}
          {activeTab === 'collections' && renderCollections()}
        </div>
      </div>

      <Modal
        title="上传剪纸作品"
        open={uploadModal}
        onCancel={() => { setUploadModal(false); setPreviewImage(null); uploadForm.resetFields(); }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={uploadForm} onFinish={handleUpload} layout="vertical">
          <Form.Item label="作品图片">
            <Upload {...uploadProps} listType="picture-card" maxCount={1}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item
            name="title"
            label="作品名称"
            rules={[
              { required: true, message: '请输入作品名称' },
              { min: 2, max: 30, message: '名称长度为2-30个字符' },
              { 
                pattern: /^[\u4e00-\u9fa5a-zA-Z0-9，。！？、；：""''（）《》【】\s]+$/,
                message: '名称只能包含中文、英文、数字和常用标点符号'
              }
            ]}
          >
            <Input placeholder="请输入作品名称" maxLength={30} showCount />
          </Form.Item>
          <Form.Item
            name="category"
            label="作品分类"
            rules={[{ required: true, message: '请选择作品分类' }]}
          >
            <Select placeholder="请选择分类">
              {categoryOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="作品描述"
            rules={[
              { required: true, message: '请输入作品描述' },
              { min: 10, max: 200, message: '描述长度为10-200个字符' },
              { 
                pattern: /^[\u4e00-\u9fa5a-zA-Z0-9，。！？、；：""''（）《》【】\s\n]+$/,
                message: '描述只能包含中文、英文、数字和常用标点符号'
              }
            ]}
          >
            <TextArea rows={3} placeholder="描述你的作品..." showCount maxLength={200} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="多个标签用逗号分隔" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large">
              提交作品
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑作品"
        open={editModal}
        onCancel={() => { setEditModal(false); setEditPreviewImage(null); setEditingWork(null); editForm.resetFields(); }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={editForm} onFinish={handleEdit} layout="vertical">
          <Form.Item label="作品图片">
            <Upload {...editUploadProps} listType="picture-card" maxCount={1}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>更换图片</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item
            name="title"
            label="作品名称"
            rules={[
              { required: true, message: '请输入作品名称' },
              { min: 2, max: 30, message: '名称长度为2-30个字符' },
              { 
                pattern: /^[\u4e00-\u9fa5a-zA-Z0-9，。！？、；：""''（）《》【】\s]+$/,
                message: '名称只能包含中文、英文、数字和常用标点符号'
              }
            ]}
          >
            <Input placeholder="请输入作品名称" maxLength={30} showCount />
          </Form.Item>
          <Form.Item
            name="category"
            label="作品分类"
            rules={[{ required: true, message: '请选择作品分类' }]}
          >
            <Select placeholder="请选择分类">
              {categoryOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="作品描述"
            rules={[
              { required: true, message: '请输入作品描述' },
              { min: 10, max: 200, message: '描述长度为10-200个字符' },
              { 
                pattern: /^[\u4e00-\u9fa5a-zA-Z0-9，。！？、；：""''（）《》【】\s\n]+$/,
                message: '描述只能包含中文、英文、数字和常用标点符号'
              }
            ]}
          >
            <TextArea rows={3} placeholder="描述你的作品..." showCount maxLength={200} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="多个标签用逗号分隔" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large">
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="创建收藏合集"
        open={collectionModal}
        onCancel={() => { setCollectionModal(false); collectionForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={collectionForm} onFinish={handleCreateCollection} layout="vertical">
          <Form.Item
            name="name"
            label="合集名称"
            rules={[
              { required: true, message: '请输入合集名称' },
              { min: 2, max: 20, message: '名称长度为2-20个字符' },
              { 
                pattern: /^[\u4e00-\u9fa5a-zA-Z0-9，。！？、；：""''（）\s]+$/,
                message: '名称只能包含中文、英文、数字和常用标点符号'
              }
            ]}
          >
            <Input placeholder="请输入合集名称" maxLength={20} showCount />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large">
              创建合集
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="通知中心"
        open={notificationModal}
        onCancel={() => setNotificationModal(false)}
        footer={
          <Space>
            <Button onClick={handleClearAllNotifications}>清空所有</Button>
            <Button type="primary" onClick={() => setNotificationModal(false)}>关闭</Button>
          </Space>
        }
        width={600}
      >
        {notifications.length === 0 ? (
          <Empty description="暂无通知" />
        ) : (
          <List
            dataSource={notifications}
            renderItem={item => (
              <List.Item
                style={{ 
                  opacity: item.read ? 0.6 : 1,
                  background: item.read ? 'transparent' : '#f0f5ff',
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: '12px 16px'
                }}
              >
                <List.Item.Meta
                  avatar={getNotificationIcon(item.type)}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.message}</span>
                      <span style={{ fontSize: 12, color: '#999' }}>{item.createdAt}</span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>

      <Modal
        title="添加到合集"
        open={!!addWorkToCollectionModal}
        onCancel={() => setAddWorkToCollectionModal(null)}
        footer={null}
        destroyOnClose
      >
        {collections.length === 0 ? (
          <Empty description="还没有创建合集">
            <Button type="primary" onClick={() => { setAddWorkToCollectionModal(null); setCollectionModal(true); }}>
              创建合集
            </Button>
          </Empty>
        ) : (
          <List
            dataSource={collections}
            renderItem={item => (
              <List.Item
                key={item.id}
                onClick={() => handleAddToCollection(item.id)}
                style={{ cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}
              >
                <List.Item.Meta
                  avatar={<FolderOpenOutlined style={{ fontSize: 24, color: '#c41e3a' }} />}
                  title={item.name}
                  description={`${item.works.length} 个作品`}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default Community;
