import { useState } from 'react'
import { Tooltip, Button } from 'antd'
import { BulbOutlined } from '@ant-design/icons'
import './index.css'

const KnowledgeTooltip = ({ knowledge }) => {
  const [visible, setVisible] = useState(false)

  if (!knowledge) return null

  const content = (
    <div className="knowledge-tooltip-content">
      <div className="knowledge-tooltip-title">
        <BulbOutlined style={{ color: '#faad14' }} />
        {knowledge.title}
      </div>
      <div className="knowledge-tooltip-text">
        {knowledge.content}
      </div>
    </div>
  )

  return (
    <Tooltip
      title={content}
      color="white"
      overlayClassName="knowledge-tooltip-overlay"
      open={visible}
      onOpenChange={setVisible}
      placement="top"
      trigger={['hover', 'click']}
    >
      <Button
        type="text"
        icon={<BulbOutlined />}
        size="small"
        className="knowledge-tooltip-btn"
      />
    </Tooltip>
  )
}

export default KnowledgeTooltip
