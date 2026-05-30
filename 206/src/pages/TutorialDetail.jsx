import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Space,
  Divider,
  Avatar,
  List,
  Progress,
  Statistic,
  message,
  Modal,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  HeartOutlined,
  HeartFilled,
  ClockCircleOutlined,
  BookOutlined,
  StarFilled,
  CheckCircleOutlined,
  PlayCircleFilled,
  ReloadOutlined,
} from '@ant-design/icons';
import { fetchTutorialById, clearDetail } from '../store/slices/tutorialSlice';
import { toggleTutorialCollection } from '../store/slices/collectionSlice';
import { updateLearningProgress } from '../store/slices/userSlice';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import dayjs from 'dayjs';

const TutorialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { detail, detailLoading, error } = useSelector((state) => state.tutorial);
  const { userInfo } = useSelector((state) => state.user);
  const { tutorials } = useSelector((state) => state.collection);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);

  const tutorialId = Number(id);
  const isCollected = tutorials.some((item) => item.id === tutorialId);
  const userProgress = userInfo?.learningProgress?.find(
    (p) => p.tutorialId === tutorialId
  );
  const currentLessonId = userProgress?.currentLesson || 1;

  useEffect(() => {
    dispatch(fetchTutorialById(tutorialId));
    return () => dispatch(clearDetail());
  }, [id, dispatch, tutorialId]);

  const handleCollect = () => {
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    dispatch(toggleTutorialCollection(detail));
    message.success(isCollected ? '已取消收藏' : '收藏成功');
  };

  const handleStartLearning = () => {
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    const lesson = detail.content.find((l) => l.lesson === currentLessonId);
    if (lesson) {
      setCurrentLesson(lesson);
      setLessonModalVisible(true);
    }
  };

  const handleLessonClick = (lesson) => {
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setCurrentLesson(lesson);
    setLessonModalVisible(true);
  };

  const handleMarkLessonComplete = () => {
    if (!currentLesson || !userInfo) return;

    const totalLessons = detail.content.length;
    const newProgress = Math.round((currentLesson.lesson / totalLessons) * 100);

    try {
      dispatch(
        updateLearningProgress({
          tutorialId,
          progress: newProgress,
          lessonId: currentLesson.lesson < totalLessons ? currentLesson.lesson + 1 : totalLessons,
        })
      );

      message.success(
        newProgress >= 100
          ? '恭喜！您已完成本教程的所有学习！'
          : `学习进度已更新至 ${newProgress}%`
      );
      setLessonModalVisible(false);
    } catch (err) {
      message.error('更新学习进度失败，请稍后重试');
    }
  };

  const handleNextLesson = () => {
    if (!currentLesson || !userInfo) return;

    const nextLessonNum = currentLesson.lesson + 1;
    const nextLesson = detail.content.find((l) => l.lesson === nextLessonNum);

    if (nextLesson) {
      const totalLessons = detail.content.length;
      const newProgress = Math.round((currentLesson.lesson / totalLessons) * 100);

      try {
        dispatch(
          updateLearningProgress({
            tutorialId,
            progress: newProgress,
            lessonId: nextLessonNum,
          })
        );
        setCurrentLesson(nextLesson);
        message.success(`已更新学习进度，继续学习第 ${nextLessonNum} 课`);
      } catch (err) {
        message.error('更新学习进度失败，请稍后重试');
      }
    }
  };

  const handleResetProgress = () => {
    if (!userInfo) return;
    Modal.confirm({
      title: '确定重置学习进度？',
      content: '重置后将从第一课重新开始学习',
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

  const getLessonStatus = (lessonNum) => {
    if (!userProgress) return 'not-started';
    const progressPerLesson = 100 / detail.content.length;
    const completedLessons = Math.floor(userProgress.progress / progressPerLesson);
    if (lessonNum <= completedLessons) return 'completed';
    if (lessonNum === currentLessonId) return 'current';
    return 'not-started';
  };

  if (detailLoading) {
    return <PageLoader text="加载教程详情中..." />;
  }

  if (error || !detail) {
    return (
      <ErrorState
        message="教程不存在"
        subMessage="请返回列表查看其他教程"
        onRetry={() => navigate('/learning')}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        返回列表
      </Button>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <Card
            cover={
              <div className="relative">
                <img
                  src={detail.cover}
                  alt={detail.title}
                  className="h-[400px] w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Space direction="vertical" align="center">
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlayCircleOutlined />}
                      className="bg-amber-600 border-amber-600 text-lg px-8 py-4 h-auto"
                      onClick={handleStartLearning}
                    >
                      {userProgress
                        ? userProgress.progress >= 100
                          ? '重新学习'
                          : `继续学习 - 第${currentLessonId}课`
                        : '开始学习'}
                    </Button>
                    {userProgress && userProgress.progress > 0 && userProgress.progress < 100 && (
                      <p className="text-white text-sm">
                        上次学到第 {currentLessonId} 课 · {userProgress.progress}%
                      </p>
                    )}
                  </Space>
                </div>
              </div>
            }
          >
            <div className="mb-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{detail.title}</h1>
                  <Space wrap className="mt-2">
                    <Tag color="gold">{detail.category}</Tag>
                    <Tag color="blue">{detail.level}</Tag>
                  </Space>
                </div>
                <Space>
                  <Button
                    type={isCollected ? 'primary' : 'default'}
                    danger={isCollected}
                    icon={isCollected ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleCollect}
                  >
                    {isCollected ? '已收藏' : '收藏'}
                  </Button>
                </Space>
              </div>
              <p className="text-gray-600 leading-relaxed">{detail.description}</p>
            </div>

            {userProgress && (
              <Alert
                message={
                  <Space>
                    <span>学习进度：{userProgress.progress}%</span>
                    {userProgress.progress >= 100 ? (
                      <Tag color="green">已完成</Tag>
                    ) : (
                      <Tag color="processing">学习中</Tag>
                    )}
                    <Button
                      type="link"
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={handleResetProgress}
                    >
                      重置进度
                    </Button>
                  </Space>
                }
                type={userProgress.progress >= 100 ? 'success' : 'info'}
                showIcon
                className="mb-6"
              />
            )}

            <Divider />

            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-800">课程目录</h3>
              <List
                itemLayout="horizontal"
                dataSource={detail.content}
                renderItem={(item) => {
                  const status = getLessonStatus(item.lesson);
                  return (
                    <List.Item
                      className={`cursor-pointer transition-colors rounded-lg px-4 ${
                        status === 'current'
                          ? 'bg-amber-50 border border-amber-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleLessonClick(item)}
                      actions={[
                        <span className="text-sm text-gray-400">{item.duration}</span>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              status === 'completed'
                                ? 'bg-green-100 text-green-600'
                                : status === 'current'
                                ? 'bg-amber-500 text-white'
                                : 'bg-amber-100 text-amber-600'
                            }`}
                          >
                            {status === 'completed' ? (
                              <CheckCircleOutlined />
                            ) : status === 'current' ? (
                              <PlayCircleFilled />
                            ) : (
                              item.lesson
                            )}
                          </div>
                        }
                        title={
                          <Space>
                            <span
                              className={`${
                                status === 'completed'
                                  ? 'text-gray-400 line-through'
                                  : status === 'current'
                                  ? 'text-amber-600 font-semibold'
                                  : ''
                              }`}
                            >
                              {item.title}
                            </span>
                            {status === 'completed' && (
                              <Tag color="green" size="small">
                                已学完
                              </Tag>
                            )}
                            {status === 'current' && (
                              <Tag color="processing" size="small">
                                学习中
                              </Tag>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={detail.instructorAvatar} size={64} />
              <div>
                <h3 className="text-lg font-semibold">{detail.instructor}</h3>
                <p className="text-sm text-gray-500">苏绣大师</p>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="课程时长"
                  value={detail.duration}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="课时数"
                  value={detail.lessons}
                  prefix={<BookOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="评分"
                  value={detail.rating}
                  prefix={<StarFilled className="text-yellow-400" />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="学习人数"
                  value={detail.students}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
            </Row>
          </Card>

          {userProgress && (
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-gray-800">我的学习进度</h3>
              <Progress
                percent={userProgress.progress}
                strokeColor={{
                  '0%': '#f59e0b',
                  '100%': '#d97706',
                }}
                size="large"
                status={userProgress.progress >= 100 ? 'success' : 'active'}
              />
              <p className="mt-2 text-sm text-gray-500">
                上次学习：
                {dayjs(userProgress.lastLearned).format('YYYY年MM月DD日 HH:mm')}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                当前进度：第 {userProgress.currentLesson || 1} / {detail.lessons} 课
              </p>
            </Card>
          )}
        </Col>
      </Row>

      <Modal
        title={
          <Space>
            <span>第 {currentLesson?.lesson} 课</span>
            <Tag color="blue">{currentLesson?.duration}</Tag>
          </Space>
        }
        open={lessonModalVisible}
        onCancel={() => setLessonModalVisible(false)}
        width={700}
        footer={
          <Space>
            <Button onClick={() => setLessonModalVisible(false)}>关闭</Button>
            {currentLesson &&
              currentLesson.lesson < detail.content.length && (
                <Button type="primary" onClick={handleNextLesson}>
                  下一课
                </Button>
              )}
            <Button
              type="primary"
              className="bg-green-600 border-green-600"
              icon={<CheckCircleOutlined />}
              onClick={handleMarkLessonComplete}
            >
              标记完成
            </Button>
          </Space>
        }
      >
        {currentLesson && (
          <div className="py-4">
            <h2 className="text-xl font-bold mb-4">{currentLesson.title}</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-center h-48 bg-gray-200 rounded-lg mb-4">
                <PlayCircleOutlined className="text-6xl text-gray-400" />
              </div>
              <p className="text-gray-600 text-center">
                视频播放区域 - 第 {currentLesson.lesson} 课内容
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">课程要点</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>本课时主要讲解{currentLesson.title}的基本技法</li>
                <li>掌握核心动作要领和注意事项</li>
                <li>完成课后练习并提交作品</li>
                <li>如有疑问可在讨论区提问</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TutorialDetail;
