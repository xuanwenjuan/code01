import { useState } from 'react';
import { Tooltip, Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { knowledgePoints } from '@/mock/data';
import './KnowledgeTooltip.css';

const KnowledgeTooltip = ({ keyword, children, placement = 'top' }) => {
  const [open, setOpen] = useState(false);
  const knowledge = knowledgePoints.find(k => k.keyword === keyword);

  if (!knowledge) {
    return children || null;
  }

  const content = (
    <div className="knowledge-tooltip">
      <h4 className="knowledge-title">{knowledge.title}</h4>
      <p className="knowledge-content">{knowledge.content}</p>
    </div>
  );

  if (children) {
    return (
      <Tooltip
        title={content}
        placement={placement}
        open={open}
        onOpenChange={setOpen}
        overlayClassName="knowledge-overlay"
      >
        <span className="knowledge-text">{children}</span>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      title={content}
      placement={placement}
      open={open}
      onOpenChange={setOpen}
      overlayClassName="knowledge-overlay"
    >
      <Button
        type="text"
        icon={<InfoCircleOutlined style={{ color: '#d4af37' }} />}
        size="small"
        className="knowledge-btn"
      />
    </Tooltip>
  );
};

export default KnowledgeTooltip;
