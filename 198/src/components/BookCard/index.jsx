import React from 'react';
import { Card, Tag, Progress, Avatar } from 'antd';
import { EyeOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { RESTORATION_STATUS, DAMAGE_TYPES } from '@/types';
import { useNavigate } from 'react-router-dom';
import './index.css';

const statusMap = {
  [RESTORATION_STATUS.PENDING]: { text: '待修复', color: 'orange' },
  [RESTORATION_STATUS.IN_PROGRESS]: { text: '修复中', color: 'processing' },
  [RESTORATION_STATUS.COMPLETED]: { text: '已修复', color: 'success' }
};

const damageLevelMap = {
  '轻微': 'green',
  '中度': 'orange',
  '严重': 'red'
};

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const status = statusMap[book.status] || { text: '未知', color: 'default' };

  const handleClick = () => {
    navigate(`/book/${book.id}`);
  };

  const getDamageTypeLabels = (types) => {
    return types
      .map((t) => {
        const found = DAMAGE_TYPES.find((dt) => dt.value === t);
        return found ? found.label : t;
      })
      .slice(0, 2);
  };

  return (
    <Card
      className="book-card"
      hoverable
      onClick={handleClick}
      cover={
        <div className="book-cover-wrapper">
          <img alt={book.name} src={book.cover} className="book-cover" />
          <div className="book-status-tag">
            <Tag color={status.color}>{status.text}</Tag>
          </div>
          {book.status === RESTORATION_STATUS.IN_PROGRESS && book.progress !== undefined && (
            <div className="book-progress">
              <Progress percent={book.progress} size="small" showInfo={false} />
              <span className="progress-text">{book.progress}%</span>
            </div>
          )}
        </div>
      }
    >
      <Card.Meta
        title={<div className="book-title">{book.name}</div>}
        description={
          <div className="book-info">
            <div className="book-meta">
              <span className="book-era">{book.era} · {book.categoryLabel}</span>
            </div>
            <div className="book-author">
              <UserOutlined /> {book.author}
            </div>
            <div className="book-tags">
              <Tag color={damageLevelMap[book.damageLevel]}>
                破损: {book.damageLevel}
              </Tag>
              {getDamageTypeLabels(book.damageTypes).map((type) => (
                <Tag key={type} color="blue">{type}</Tag>
              ))}
            </div>
            <div className="book-footer">
              <span className="view-count">
                <EyeOutlined /> {book.viewCount}
              </span>
              {book.currentRestorerName && (
                <span className="restorer-info">
                  <Avatar size={20} style={{ backgroundColor: '#1890ff' }}>
                    {book.currentRestorerName[0]}
                  </Avatar>
                  {book.currentRestorerName}
                </span>
              )}
              {book.estimatedDays && (
                <span className="estimated-days">
                  <ClockCircleOutlined /> {book.estimatedDays}天
                </span>
              )}
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default BookCard;
