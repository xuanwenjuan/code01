import { Card, Tag, Space, Avatar, Progress, Tooltip } from 'antd';
import {
  PlayCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  StarFilled,
  HeartOutlined,
  HeartFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTutorialCollection } from '../store/slices/collectionSlice';
import { message } from 'antd';

const { Meta } = Card;

const TutorialCard = ({ tutorial, showProgress = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);
  const { tutorials } = useSelector((state) => state.collection);
  const isCollected = tutorials.some((item) => item.id === tutorial.id);

  const userProgress = userInfo?.learningProgress?.find(
    (p) => p.tutorialId === tutorial.id
  );

  const handleClick = () => {
    navigate(`/tutorial/${tutorial.id}`);
  };

  const handleCollect = (e) => {
    e.stopPropagation();
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    dispatch(toggleTutorialCollection(tutorial));
    message.success(isCollected ? '已取消收藏' : '收藏成功');
  };

  return (
    <Card
      hoverable
      className="h-full transition-all duration-300 hover:shadow-lg"
      onClick={handleClick}
      cover={
        <div className="relative overflow-hidden">
          <img
            alt={tutorial.title}
            src={tutorial.cover}
            className="h-44 w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 hover:opacity-100">
            <PlayCircleOutlined className="text-6xl text-white" />
          </div>
          <div className="absolute left-2 top-2">
            <Tag color="gold">{tutorial.level}</Tag>
          </div>
          <div className="absolute right-2 top-2">
            <Tooltip title={isCollected ? '取消收藏' : '收藏'}>
              <div
                onClick={handleCollect}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/80 backdrop-blur-sm"
              >
                {isCollected ? (
                  <HeartFilled className="text-red-500" />
                ) : (
                  <HeartOutlined className="text-gray-600" />
                )}
              </div>
            </Tooltip>
          </div>
          {showProgress && userProgress && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <Progress
                percent={userProgress.progress}
                size="small"
                strokeColor="#f59e0b"
                showInfo={false}
              />
              <p className="mt-1 text-xs text-white">
                已学习 {userProgress.progress}%
              </p>
            </div>
          )}
        </div>
      }
    >
      <Meta
        title={
          <div className="line-clamp-1 text-base font-semibold">
            {tutorial.title}
          </div>
        }
        description={
          <div className="mt-2">
            <p className="line-clamp-2 text-sm text-gray-600">
              {tutorial.description}
            </p>
            <Space className="mt-3 w-full" size="small" wrap>
              <Space size={4}>
                <Avatar src={tutorial.instructorAvatar} size={20} />
                <span className="text-xs text-gray-500">
                  {tutorial.instructor}
                </span>
              </Space>
              <Space size={4}>
                <ClockCircleOutlined className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  {tutorial.duration}
                </span>
              </Space>
              <Space size={4}>
                <StarFilled className="text-yellow-400" />
                <span className="text-xs text-gray-500">{tutorial.rating}</span>
              </Space>
            </Space>
          </div>
        }
      />
    </Card>
  );
};

export default TutorialCard;
