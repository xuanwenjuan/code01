import { useState, useCallback } from 'react';
import {
  Card,
  Tabs,
  Row,
  Col,
  List,
  Progress,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Empty,
  Tag,
  Statistic,
  Alert,
  Result,
} from 'antd';
import {
  BookOutlined,
  HeartOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addNote, updateNote, deleteNote } from '../store/slices/noteSlice';
import {
  toggleEmbroideryCollection,
  toggleTutorialCollection,
} from '../store/slices/collectionSlice';
import { updateLearningProgress } from '../store/slices/userSlice';
import dayjs from 'dayjs';
import { mockTutorials, mockEmbroideries } from '../data/mockData';

const { TextArea } = Input;

const LearningCenter = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);
  const { embroideries, tutorials } = useSelector((state) => state.collection);
  const { notes } = useSelector((state) => state.note);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form] = Form.useForm();
  const [noteSaving, setNoteSaving] = useState(false);

  const learningProgress = userInfo?.learningProgress || [];

  const totalLearningHours = learningProgress.reduce((acc, curr) => {
    const tutorial = mockTutorials.find((t) => t.id === curr.tutorialId);
    if (tutorial) {
      const hoursMatch = tutorial.duration.match(/(\d+)小时/);
      const minsMatch = tutorial.duration.match(/(\d+)分钟/);
      let hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      let mins = minsMatch ? parseInt(minsMatch[1]) : 0;
      acc += (hours + mins / 60) * (curr.progress / 100);
    }
    return acc;
  }, 0);

  const completedTutorials = learningProgress.filter(
    (p) => p.progress >= 100
  ).length;

  const avgProgress =
    learningProgress.length > 0
      ? Math.round(
          learningProgress.reduce((acc, curr) => acc + curr.progress, 0) /
            learningProgress.length
        )
      : 0;

  const handleAddNote = () => {
    if (notes.length >= 100) {
      message.warning('笔记数量已达上限（100条），请删除部分笔记后再添加');
      return;
    }
    setEditingNote(null);
    form.resetFields();
    setNoteModalVisible(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    form.setFieldsValue({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
    });
    setNoteModalVisible(true);
  };

  const handleSaveNote = async (values) => {
    setNoteSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (editingNote) {
        dispatch(
          updateNote({
            id: editingNote.id,
            title: values.title.trim(),
            content: values.content.trim(),
            tags: values.tags || [],
          })
        );
        message.success('笔记更新成功');
      } else {
        dispatch(
          addNote({
            title: values.title.trim(),
            content: values.content.trim(),
            tags: values.tags || [],
          })
        );
        message.success('笔记添加成功');
      }
      setNoteModalVisible(false);
    } catch (err) {
      message.error('保存失败，请稍后重试');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleDeleteNote = (id) => {
    try {
      dispatch(deleteNote(id));
      message.success('笔记删除成功');
    } catch (err) {
      message.error('删除失败，请稍后重试');
    }
  };

  const handleRemoveEmbroidery = (embroidery) => {
    try {
      dispatch(toggleEmbroideryCollection(embroidery));
      message.success('已取消收藏');
    } catch (err) {
      message.error('操作失败，请稍后重试');
    }
  };

  const handleRemoveTutorial = (tutorial) => {
    try {
      dispatch(toggleTutorialCollection(tutorial));
      message.success('已取消收藏');
    } catch (err) {
      message.error('操作失败，请稍后重试');
    }
  };

  const handleContinueLearning = (tutorialId) => {
    navigate('/tutorial/' + tutorialId);
  };

  const handleResetTutorialProgress = (tutorialId, tutorialTitle) => {
    Modal.confirm({
      title: '确定重置学习进度？',
      content: '重置后 "' + tutorialTitle + '" 的学习进度将归零',
      okText: '确定重置',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        try {
          dispatch(
            updateLearningProgress({
              tutorialId,
              progress: 0,
              lessonId: 1,
            })
          );
          message.success('学习进度已重置');
        } catch (err) {
          message.error('重置失败，请稍后重试');
        }
      },
    });
  };

  const renderProgressTab = () => (
    <div>
      <Card className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <BookOutlined className="text-amber-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {learningProgress.length}
                </div>
                <div className="text-sm text-gray-500">学习中的课程</div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <TrophyOutlined className="text-green-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {completedTutorials}
                </div>
                <div className="text-sm text-gray-500">已完成课程</div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <ClockCircleOutlined className="text-blue-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {totalLearningHours.toFixed(1)}h
                </div>
                <div className="text-sm text-gray-500">累计学习时长</div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <StarOutlined className="text-purple-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {avgProgress}%
                </div>
                <div className="text-sm text-gray-500">平均进度</div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {learningProgress.length > 0 ? (
        <Card title="学习中的课程">
          <List
            itemLayout="vertical"
            dataSource={learningProgress}
            renderItem={(progress) => {
              const tutorial = mockTutorials.find(
                (t) => t.id === progress.tutorialId
              );
              if (!tutorial) return null;

              const isCompleted = progress.progress >= 100;

              return (
                <List.Item
                  key={progress.tutorialId}
                  className="hover:bg-gray-50 rounded-lg px-4 transition-colors"
                  actions={[
                    <Button
                      type="link"
                      onClick={() => handleContinueLearning(tutorial.id)}
                    >
                      {isCompleted ? '重新学习' : '继续学习'}
                    </Button>,
                    <Popconfirm
                      title="确定重置进度？"
                      onConfirm={() =>
                        handleResetTutorialProgress(tutorial.id, tutorial.title)
                      }
                    >
                      <Button type="link" danger>
                        重置进度
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <span
                          className="cursor-pointer hover:text-amber-600 font-medium"
                          onClick={() => handleContinueLearning(tutorial.id)}
                        >
                          {tutorial.title}
                        </span>
                        {isCompleted && (
                          <Tag color="green">已完成</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" className="w-full mt-2">
                        <div className="flex items-center justify-between">
                          <Progress
                            percent={progress.progress}
                            strokeColor={
                              isCompleted
                                ? '#52c41a'
                                : {
                                    '0%': '#f59e0b',
                                    '100%': '#d97706',
                                  }
                            }
                            size="small"
                            style={{ flex: 1, marginRight: 16 }}
                          />
                          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                            {progress.progress}%
                          </span>
                        </div>
                        <Space size="large" className="text-sm text-gray-500">
                          <span>
                            当前：第 {progress.currentLesson || 1} /{' '}
                            {tutorial.lessons} 课
                          </span>
                          <span>
                            上次学习：
                            {dayjs(progress.lastLearned).format(
                              'YYYY年MM月DD日 HH:mm'
                            )}
                          </span>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      ) : (
        <Card className="text-center py-12">
          <Result
            icon={<BookOutlined className="text-amber-500" />}
            title="暂无学习记录"
            subTitle="快去选择喜欢的课程开始学习吧"
            extra={
              <Button
                type="primary"
                className="bg-amber-600"
                onClick={() => navigate('/learning')}
              >
                去学习
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );

  const renderCollectionTab = () => (
    <Tabs
      defaultActiveKey="tutorials"
      items={[
        {
          key: 'tutorials',
          label: '教程收藏 (' + tutorials.length + ')',
          children: (
            <Card>
              {tutorials.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {tutorials.map((tutorial) => (
                    <Col xs={24} sm={12} md={8} key={tutorial.id}>
                      <Card
                        hoverable
                        cover={
                          <img
                            alt={tutorial.title}
                            src={tutorial.cover}
                            className="h-32 object-cover cursor-pointer"
                            onClick={() =>
                              handleContinueLearning(tutorial.id)
                            }
                          />
                        }
                        actions={[
                          <Popconfirm
                            title="确定取消收藏？"
                            onConfirm={() => handleRemoveTutorial(tutorial)}
                          >
                            <span className="text-red-500">取消收藏</span>
                          </Popconfirm>,
                        ]}
                      >
                        <Card.Meta
                          title={
                            <div
                              className="cursor-pointer hover:text-amber-600"
                              onClick={() =>
                                handleContinueLearning(tutorial.id)
                              }
                            >
                              {tutorial.title}
                            </div>
                          }
                          description={
                            <Space>
                              <Tag color="gold">{tutorial.level}</Tag>
                              <span className="text-gray-400 text-sm">
                                {tutorial.duration}
                              </span>
                            </Space>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Result
                  icon={<HeartOutlined className="text-gray-400" />}
                  title="暂无收藏的教程"
                  subTitle="浏览教程时点击收藏按钮即可收藏"
                  extra={
                    <Button
                      type="primary"
                      className="bg-amber-600"
                      onClick={() => navigate('/learning')}
                    >
                      去浏览
                    </Button>
                  }
                />
              )}
            </Card>
          ),
        },
        {
          key: 'embroideries',
          label: '绣品收藏 (' + embroideries.length + ')',
          children: (
            <Card>
              {embroideries.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {embroideries.map((embroidery) => (
                    <Col xs={24} sm={12} md={8} key={embroidery.id}>
                      <Card
                        hoverable
                        cover={
                          <img
                            alt={embroidery.name}
                            src={embroidery.image}
                            className="h-32 object-cover cursor-pointer"
                            onClick={() =>
                              navigate('/embroidery/' + embroidery.id)
                            }
                          />
                        }
                        actions={[
                          <Popconfirm
                            title="确定取消收藏？"
                            onConfirm={() =>
                              handleRemoveEmbroidery(embroidery)
                            }
                          >
                            <span className="text-red-500">取消收藏</span>
                          </Popconfirm>,
                        ]}
                      >
                        <Card.Meta
                          title={
                            <div
                              className="cursor-pointer hover:text-amber-600"
                              onClick={() =>
                                navigate('/embroidery/' + embroidery.id)
                              }
                            >
                              {embroidery.name}
                            </div>
                          }
                          description={
                            <Space>
                              <Tag color="gold">{embroidery.theme}</Tag>
                              <span className="text-gray-400 text-sm">
                                {embroidery.masterName}
                              </span>
                            </Space>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Result
                  icon={<HeartOutlined className="text-gray-400" />}
                  title="暂无收藏的绣品"
                  subTitle="浏览绣品时点击收藏按钮即可收藏"
                  extra={
                    <Button
                      type="primary"
                      className="bg-amber-600"
                      onClick={() => navigate('/appreciation')}
                    >
                      去欣赏
                    </Button>
                  }
                />
              )}
            </Card>
          ),
        },
      ]}
    />
  );

  const renderNotesTab = () => (
    <Card
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNote}
          className="bg-amber-600"
        >
          新建笔记
        </Button>
      }
    >
      {notes.length > 0 ? (
        <List
          itemLayout="vertical"
          dataSource={notes}
          renderItem={(note) => (
            <List.Item
              key={note.id}
              className="hover:bg-gray-50 rounded-lg px-4 transition-colors border-b border-gray-100 last:border-0"
              actions={[
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEditNote(note)}
                >
                  编辑
                </Button>,
                <Popconfirm
                  title="确定删除这条笔记？"
                  description="删除后无法恢复"
                  onConfirm={() => handleDeleteNote(note.id)}
                  okText="删除"
                  okType="danger"
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <FileTextOutlined className="text-amber-500" />
                    <span className="font-medium">{note.title}</span>
                    {note.tags &&
                      note.tags.length > 0 &&
                      note.tags.map((tag, idx) => (
                        <Tag key={idx} color="blue" size="small">
                          {tag}
                        </Tag>
                      ))}
                  </Space>
                }
                description={
                  <Space direction="vertical" className="w-full mt-2">
                    <span className="text-sm text-gray-500">
                      创建于：
                      {dayjs(note.createdAt).format('YYYY年MM月DD日 HH:mm')}
                      {' · '}
                      更新于：
                      {dayjs(note.updatedAt).format('YYYY年MM月DD日 HH:mm')}
                    </span>
                  </Space>
                }
              />
              <p className="whitespace-pre-wrap text-gray-700 mt-2 line-clamp-3">
                {note.content}
              </p>
            </List.Item>
          )}
        />
      ) : (
        <Result
          icon={<FileTextOutlined className="text-gray-400" />}
          title="暂无学习笔记"
          subTitle="记录学习心得，巩固苏绣技艺"
          extra={
            <Button
              type="primary"
              className="bg-amber-600"
              onClick={handleAddNote}
            >
              写笔记
            </Button>
          }
        />
      )}
    </Card>
  );

  const tabItems = [
    {
      key: 'progress',
      label: (
        <span>
          <BookOutlined /> 学习进度
        </span>
      ),
      children: renderProgressTab(),
    },
    {
      key: 'collection',
      label: (
        <span>
          <HeartOutlined /> 我的收藏
        </span>
      ),
      children: renderCollectionTab(),
    },
    {
      key: 'notes',
      label: (
        <span>
          <EditOutlined /> 学习笔记
        </span>
      ),
      children: renderNotesTab(),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">我的学习</h1>
        <p className="mt-2 text-gray-500">追踪学习进度，管理收藏和笔记</p>
      </div>

      {userInfo?.role === 'admin' && (
        <Alert
          message="管理员账号"
          description="管理员账号不参与学习记录，如需测试学习功能请使用普通用户账号"
          type="info"
          showIcon
          className="mb-6"
        />
      )}

      <Tabs defaultActiveKey="progress" items={tabItems} />

      <Modal
        title={
          <Space>
            {editingNote ? (
              <EditOutlined className="text-amber-500" />
            ) : (
              <PlusOutlined className="text-green-500" />
            )}
            <span>{editingNote ? '编辑笔记' : '新建笔记'}</span>
          </Space>
        }
        open={noteModalVisible}
        onCancel={() => setNoteModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveNote}
          className="mt-4"
          initialValues={{ tags: [] }}
        >
          <Form.Item
            name="title"
            label="笔记标题"
            rules={[
              { required: true, message: '请输入笔记标题' },
              { min: 2, message: '标题至少2个字符' },
              { max: 100, message: '标题最多100个字符' },
              {
                validator: (_, value) => {
                  if (value && value.trim().length < 2) {
                    return Promise.reject('标题不能全是空格');
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              placeholder="请输入笔记标题（2-100字符）"
              maxLength={100}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="笔记内容"
            rules={[
              { required: true, message: '请输入笔记内容' },
              { min: 10, message: '内容至少10个字符' },
              { max: 5000, message: '内容最多5000个字符' },
              {
                validator: (_, value) => {
                  if (value && value.trim().length < 10) {
                    return Promise.reject('内容不能全是空格，且至少10个字符');
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <TextArea
              rows={8}
              placeholder="请输入笔记内容（10-5000字符）"
              maxLength={5000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签（可选）"
            tooltip="最多添加5个标签，方便分类管理"
          >
            <Select
              mode="tags"
              placeholder="输入标签后按回车添加"
              maxTagCount={5}
              tokenSeparators={[',', '，', ' ']}
            >
              {['技法', '心得', '疑问', '材料', '作品', '理论'].map((tag) => (
                <Select.Option key={tag} value={tag}>
                  {tag}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">
                笔记将自动保存在本地
              </span>
              <Space>
                <Button onClick={() => setNoteModalVisible(false)}>
                  取消
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-amber-600"
                  loading={noteSaving}
                >
                  {noteSaving ? '保存中...' : '保存'}
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LearningCenter;
