import { useEffect } from 'react';
import { Row, Col, Typography, Button, List, Tag, Avatar, Card } from 'antd';
import { DeleteOutlined, FileTextOutlined, PictureOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory, clearHistory } from '@/store/userSlice';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import './History.css';

const { Title } = Typography;

const History = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { history, loading } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(fetchHistory());
  }, [dispatch]);

  const handleClear = () => {
    dispatch(clearHistory());
  };

  const handleClick = item => {
    if (item.type === 'work') {
      navigate(`/work/${item.id}`);
    } else if (item.type === 'case') {
      navigate(`/case/${item.id}`);
    }
  };

  if (loading) {
    return <Loading text="加载中..." />;
  }

  return (
    <div className="history-page">
      <div className="page-header">
        <Title level={3} className="page-title">
          浏览记录
        </Title>
        {history.length > 0 && (
          <Button
            icon={<DeleteOutlined />}
            onClick={handleClear}
            danger
          >
            清空记录
          </Button>
        )}
      </div>

      {history.length > 0 ? (
        <Card>
          <List
            dataSource={history}
            renderItem={item => (
              <List.Item
                className="history-item"
                onClick={() => handleClick(item)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      shape="square"
                      size={64}
                      src={item.image || item.cover}
                      icon={item.type === 'work' ? <PictureOutlined /> : <FileTextOutlined />}
                    />
                  }
                  title={
                    <div className="history-title">
                      {item.name || item.title}
                      <Tag color={item.type === 'work' ? 'blue' : 'green'}>
                        {item.type === 'work' ? '作品' : '案例'}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="history-desc">
                      <p>{item.description}</p>
                      <span className="history-time">
                        浏览时间：{new Date(item.viewTime).toLocaleString()}
                      </span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ) : (
        <EmptyState description="暂无浏览记录" />
      )}
    </div>
  );
};

export default History;
