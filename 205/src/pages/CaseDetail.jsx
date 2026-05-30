import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Typography, Tag, Button, Descriptions } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons';
import { fetchCases } from '@/store/casesSlice';
import { addToHistory } from '@/store/userSlice';
import Loading from '@/components/Loading';
import NotFound from './NotFound';
import './CaseDetail.css';

const { Title, Paragraph } = Typography;

const statusMap = {
  completed: { color: 'success', text: '已完成' },
  ongoing: { color: 'processing', text: '进行中' },
  upcoming: { color: 'default', text: '即将开始' },
};

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: cases, loading } = useSelector(state => state.cases);
  const caseItem = cases.find(c => c.id === Number(id));

  useEffect(() => {
    dispatch(fetchCases());
    dispatch(addToHistory(Number(id)));
  }, [dispatch, id]);

  if (loading) {
    return <Loading text="加载中..." />;
  }

  if (!caseItem) {
    return <NotFound />;
  }

  const status = statusMap[caseItem.status] || { color: 'default', text: '未知' };

  return (
    <div className="case-detail-page">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="back-btn"
      >
        返回
      </Button>

      <Row gutter={[40, 24]}>
        <Col xs={24} md={14}>
          <div className="case-image-wrapper">
            <img src={caseItem.cover} alt={caseItem.title} className="case-image" />
            <Tag color={status.color} className="status-tag">
              {status.text}
            </Tag>
          </div>
        </Col>

        <Col xs={24} md={10}>
          <div className="case-info">
            <Title level={2} className="case-title">
              {caseItem.title}
            </Title>

            <div className="case-meta">
              <span className="meta-item">
                <CalendarOutlined />
                项目时间：{caseItem.date}
              </span>
            </div>

            <Paragraph className="case-description">
              {caseItem.description}
            </Paragraph>

            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="项目状态">
                <Tag color={status.color}>{status.text}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="项目时间">
                {caseItem.date}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CaseDetail;
