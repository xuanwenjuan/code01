import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Typography, Tag, Button, Descriptions, Divider, Statistic, message } from 'antd';
import {
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { fetchWorkById, clearDetail } from '@/store/worksSlice';
import { toggleFavorite, addToHistory } from '@/store/userSlice';
import {
  incrementViewCount,
  incrementFavoriteCount,
  downloadMaterial,
  logOperation,
} from '@/store/platformSlice';
import Loading from '@/components/Loading';
import NotFound from './NotFound';
import './WorkDetail.css';

const { Title, Paragraph } = Typography;

const WorkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { detail: work, loading } = useSelector(state => state.works);
  const { favorites } = useSelector(state => state.user);
  const { viewCounts, favoriteCounts } = useSelector(state => state.platform);
  const isFavorite = favorites.some(f => f.id === Number(id));

  const viewCount = viewCounts[`work_${id}`] || 0;
  const favoriteCount = favoriteCounts[`work_${id}`] || 0;

  useEffect(() => {
    dispatch(fetchWorkById(Number(id)));
    dispatch(addToHistory(Number(id)));
    dispatch(incrementViewCount({ itemId: Number(id), itemType: 'work' }));
    dispatch(logOperation({
      action: 'view_work',
      itemId: Number(id),
      itemType: 'work',
      detail: `查看作品详情: ${work?.name || id}`,
    }));
    return () => {
      dispatch(clearDetail());
    };
  }, [dispatch, id]);

  const handleFavorite = () => {
    const wasFavorite = isFavorite;
    dispatch(toggleFavorite(Number(id)));
    dispatch(incrementFavoriteCount({
      itemId: Number(id),
      itemType: 'work',
      increment: wasFavorite ? -1 : 1,
    }));
    dispatch(logOperation({
      action: wasFavorite ? 'unfavorite_work' : 'favorite_work',
      itemId: Number(id),
      itemType: 'work',
      detail: `${wasFavorite ? '取消收藏' : '收藏'}作品`,
    }));
    message.success(wasFavorite ? '已取消收藏' : '收藏成功');
  };

  const handleDownload = async () => {
    dispatch(logOperation({
      action: 'download_material',
      itemId: Number(id),
      itemType: 'work',
      detail: `下载作品高清素材: ${work?.name}`,
    }));
    message.loading({ content: '正在准备下载素材...', key: 'download', duration: 1.5 });
    await dispatch(downloadMaterial({ id: Number(id), name: work?.name, type: 'work' }));
    message.success({ content: '素材下载完成！（本地模拟）', key: 'download' });
  };

  if (loading) {
    return <Loading text="加载中..." />;
  }

  if (!work) {
    return <NotFound />;
  }

  return (
    <div className="work-detail-page">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="back-btn"
      >
        返回
      </Button>

      <Row gutter={[40, 24]}>
        <Col xs={24} md={12} lg={10}>
          <div className="work-image-wrapper">
            <img src={work.image} alt={work.name} className="work-image" />
            {work.featured && (
              <Tag color="gold" className="featured-tag">
                精选作品
              </Tag>
            )}
          </div>

          <div className="stats-row">
            <Statistic
              title="浏览量"
              value={viewCount}
              prefix={<EyeOutlined />}
              className="stat-item"
            />
            <Statistic
              title="收藏量"
              value={favoriteCount}
              prefix={<HeartOutlined />}
              className="stat-item"
            />
          </div>
        </Col>

        <Col xs={24} md={12} lg={14}>
          <div className="work-info">
            <Title level={2} className="work-title">
              {work.name}
            </Title>
            <div className="work-tags">
              <Tag color="blue">{work.category}</Tag>
              <span className="work-price">{work.price}</span>
            </div>

            <Paragraph className="work-description">
              {work.description}
            </Paragraph>

            <Descriptions column={2} bordered size="middle" className="work-desc">
              <Descriptions.Item label="创作大师">
                {work.artist}
              </Descriptions.Item>
              <Descriptions.Item label="创作年份">
                {work.year}
              </Descriptions.Item>
              <Descriptions.Item label="作品品类">
                {work.category}
              </Descriptions.Item>
              <Descriptions.Item label="参考价格">
                {work.price}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className="action-buttons">
              <Button
                type="primary"
                size="large"
                icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                onClick={handleFavorite}
                danger={isFavorite}
              >
                {isFavorite ? '取消收藏' : '收藏作品'}
              </Button>
              <Button
                size="large"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                下载高清素材
              </Button>
              <Button size="large" icon={<ShareAltOutlined />}>
                分享
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default WorkDetail;
