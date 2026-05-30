import { Card, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import './CaseCard.css';

const statusMap = {
  completed: { color: 'success', text: '已完成' },
  ongoing: { color: 'processing', text: '进行中' },
  upcoming: { color: 'default', text: '即将开始' },
};

const CaseCard = ({ caseItem }) => {
  const navigate = useNavigate();
  const status = statusMap[caseItem.status] || { color: 'default', text: '未知' };

  const handleClick = () => {
    navigate(`/case/${caseItem.id}`);
  };

  return (
    <Card
      hoverable
      className="case-card"
      onClick={handleClick}
      cover={
        <div className="case-card-cover">
          <img src={caseItem.cover} alt={caseItem.title} />
          <Tag color={status.color} className="status-tag">
            {status.text}
          </Tag>
        </div>
      }
    >
      <Card.Meta
        title={caseItem.title}
        description={
          <div className="case-card-meta">
            <p className="case-desc">{caseItem.description}</p>
            <span className="case-date">项目时间：{caseItem.date}</span>
          </div>
        }
      />
    </Card>
  );
};

export default CaseCard;
