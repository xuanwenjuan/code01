import { Card, Tag, Space, Tooltip } from 'antd';
import { EyeOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleEmbroideryCollection } from '../store/slices/collectionSlice';
import { message } from 'antd';

const { Meta } = Card;

const EmbroideryCard = ({ embroidery }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);
  const { embroideries } = useSelector((state) => state.collection);
  const isCollected = embroideries.some((item) => item.id === embroidery.id);

  const handleClick = () => {
    navigate(`/embroidery/${embroidery.id}`);
  };

  const handleCollect = (e) => {
    e.stopPropagation();
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    dispatch(toggleEmbroideryCollection(embroidery));
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
            alt={embroidery.name}
            src={embroidery.image}
            className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
          />
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
        </div>
      }
      actions={[
        <Space key="views">
          <EyeOutlined className="text-gray-500" />
          <span className="text-sm text-gray-500">{embroidery.views}</span>
        </Space>,
        <Space key="likes">
          <HeartOutlined className="text-gray-500" />
          <span className="text-sm text-gray-500">{embroidery.likes}</span>
        </Space>,
      ]}
    >
      <Meta
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{embroidery.name}</span>
          </div>
        }
        description={
          <div className="mt-2">
            <Space wrap>
              <Tag color="gold">{embroidery.theme}</Tag>
              <Tag color="blue">{embroidery.masterName}</Tag>
            </Space>
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {embroidery.description}
            </p>
          </div>
        }
      />
    </Card>
  );
};

export default EmbroideryCard;
