import React from 'react'
import { Tag } from 'antd'

const statusColorMap = {
  pending: 'default',
  in_transit: 'blue',
  transfer: 'cyan',
  delivery: 'orange',
  signed: 'success'
}

const StatusTag = ({ status, label }) => {
  return (
    <Tag color={statusColorMap[status]} className="status-tag">
      {label}
    </Tag>
  )
}

export default StatusTag
