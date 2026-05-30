import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Tag,
  Image,
  Descriptions,
  Timeline,
  Button,
  Space,
  Divider,
  Modal,
  Carousel,
  Avatar,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  ZoomInOutlined,
} from '@ant-design/icons';
import { fetchEmbroideryById, clearDetail } from '../store/slices/embroiderySlice';
import { toggleEmbroideryCollection } from '../store/slices/collectionSlice';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import dayjs from 'dayjs';

const EmbroideryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { detail, detailLoading, error } = useSelector((state) => state.embroidery);
  const { userInfo } = useSelector((state) => state.user);
  const { embroideries } = useSelector((state) => state.collection);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const isCollected = embroideries.some((item) => item.id === Number(id));

  useEffect(() => {
    dispatch(fetchEmbroideryById(Number(id)));
    return () => dispatch(clearDetail());
  }, [id, dispatch]);

  const handlePreview = (image) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  const handleCollect = () => {
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    dispatch(toggleEmbroideryCollection(detail));
    message.success(isCollected ? '已取消收藏' : '收藏成功');
  };

  if (detailLoading) {
    return <PageLoader text="加载绣品详情中..." />;
  }

  if (error || !detail) {
    return (
      <ErrorState
        message="绣品不存在"
        subMessage="请返回列表查看其他绣品"
        onRetry={() => navigate('/appreciation')}
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
        <Col xs={24} lg={12}>
          <Card
            cover={
              <div
                className="relative cursor-pointer overflow-hidden"
                onClick={() => handlePreview(detail.image)}
              >
                <img
                  src={detail.image}
                  alt={detail.name}
                  className="h-[500px] w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                  <ZoomInOutlined className="text-5xl text-white" />
                </div>
              </div>
            }
          >
            {detail.gallery && detail.gallery.length > 1 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-600">更多图片</p>
                <Carousel autoplay className="rounded-lg overflow-hidden">
                  {detail.gallery.map((img, index) => (
                    <div
                      key={index}
                      className="cursor-pointer"
                      onClick={() => handlePreview(img)}
                    >
                      <img
                        src={img}
                        alt={`${detail.name} - ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />
                    </div>
                  ))}
                </Carousel>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card>
            <div className="mb-6">
              <div className="mb-3 flex items-start justify-between">
                <h1 className="text-3xl font-bold text-gray-800">{detail.name}</h1>
                <Space>
                  <Space className="text-gray-500">
                    <EyeOutlined />
                    <span>{detail.views}</span>
                  </Space>
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
              <Space wrap className="mb-4">
                <Tag color="gold">{detail.theme}</Tag>
                <Tag color="blue">{detail.masterName}</Tag>
                {detail.stitchTypes.map((stitch, index) => (
                  <Tag key={index} color="green">
                    {stitch}
                  </Tag>
                ))}
              </Space>
              <p className="text-gray-600 leading-relaxed">{detail.description}</p>
            </div>

            <Divider />

            <div className="mb-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">工艺参数</h3>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="尺寸">
                  {detail.techParams.size}
                </Descriptions.Item>
                <Descriptions.Item label="丝线材质">
                  {detail.techParams.threads}
                </Descriptions.Item>
                <Descriptions.Item label="用色数量">
                  {detail.techParams.colors}
                </Descriptions.Item>
                <Descriptions.Item label="创作周期">
                  {detail.techParams.duration}
                </Descriptions.Item>
                <Descriptions.Item label="难度等级">
                  <Tag color="red">{detail.techParams.difficulty}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创作时间">
                  {dayjs(detail.createdAt).format('YYYY年MM月')}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider />

            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-800">创作历程</h3>
              <Timeline
                items={detail.creationProcess.map((step) => ({
                  color: 'gold',
                  children: (
                    <div>
                      <h4 className="font-medium text-gray-800">
                        步骤 {step.step}：{step.title}
                      </h4>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  ),
                }))}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="90%"
        style={{ top: 20 }}
        centered
      >
        <div className="flex items-center justify-center">
          <img
            src={previewImage}
            alt="preview"
            className="max-h-[80vh] w-auto object-contain"
          />
        </div>
      </Modal>
    </div>
  );
};

export default EmbroideryDetail;
