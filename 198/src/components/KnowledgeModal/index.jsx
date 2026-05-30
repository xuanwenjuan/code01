import React, { useState } from 'react';
import { Modal, List, Tag, Button, Space, Typography } from 'antd';
import { 
  BulbOutlined, 
  BookOutlined, 
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  ScissorOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { restorationKnowledge } from '@/mock/books';
import './index.css';

const { Title, Paragraph } = Typography;

const categoryIcons = {
  '修复技术': <ToolOutlined />,
  '修复理念': <BulbOutlined />,
  '破损知识': <BookOutlined />,
  '修复材料': <SafetyCertificateOutlined />,
  '保存知识': <EnvironmentOutlined />,
  '传统技艺': <ScissorOutlined />
};

const categoryColors = {
  '修复技术': 'blue',
  '修复理念': 'purple',
  '破损知识': 'orange',
  '修复材料': 'green',
  '保存知识': 'cyan',
  '传统技艺': 'magenta'
};

const KnowledgeModal = ({ open, onClose }) => {
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);

  const handleItemClick = (item) => {
    setSelectedKnowledge(item);
  };

  const handleBack = () => {
    setSelectedKnowledge(null);
  };

  return (
    <Modal
      title={
        <div className="modal-header">
          <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
          古籍修复小知识
        </div>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={null}
      className="knowledge-modal"
    >
      {selectedKnowledge ? (
        <div className="knowledge-detail">
          <Button type="link" onClick={handleBack} style={{ padding: 0, marginBottom: 16 }}>
            ← 返回列表
          </Button>
          <div className="detail-header">
            <Title level={4} style={{ margin: 0 }}>{selectedKnowledge.title}</Title>
            <Tag color={categoryColors[selectedKnowledge.category]}>
              {categoryIcons[selectedKnowledge.category]} {selectedKnowledge.category}
            </Tag>
          </div>
          <Paragraph className="detail-content">
            {selectedKnowledge.content}
          </Paragraph>
        </div>
      ) : (
        <List
          dataSource={restorationKnowledge}
          renderItem={(item) => (
            <List.Item
              className="knowledge-item"
              onClick={() => handleItemClick(item)}
            >
              <List.Item.Meta
                avatar={
                  <div className={`item-icon ${categoryColors[item.category]}`}>
                    {categoryIcons[item.category]}
                  </div>
                }
                title={
                  <Space>
                    <span className="item-title">{item.title}</span>
                    <Tag color={categoryColors[item.category]} size="small">
                      {item.category}
                    </Tag>
                  </Space>
                }
                description={
                  <span className="item-desc">
                    {item.content.substring(0, 80)}...
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default KnowledgeModal;
