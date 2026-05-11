import React from 'react'
import { Tag, Progress } from 'antd'
import type { TagProps, ProgressProps } from 'antd'
import type { DeviceStatus, MonitorStatus, AlertLevel, AlertStatus, AlertType, LoadLevel } from '@/types'
import { DEVICE_STATUS_MAP, MONITOR_STATUS_MAP, ALERT_LEVEL_MAP, ALERT_STATUS_MAP, LOAD_LEVEL_MAP, ALERT_TYPE_MAP } from '@/constants'

interface StatusTagProps extends Omit<TagProps, 'color'> {
  status: DeviceStatus
}

export const DeviceStatusTag: React.FC<StatusTagProps> = ({ status, ...props }) => {
  const { text, color } = DEVICE_STATUS_MAP[status]
  
  const statusColorMap: Record<string, TagProps['color']> = {
    green: 'success',
    red: 'error',
    orange: 'warning',
    default: 'default',
  }
  
  return (
    <Tag color={statusColorMap[color]} {...props}>
      {text}
    </Tag>
  )
}

interface MonitorTagProps extends Omit<TagProps, 'color'> {
  status: MonitorStatus
}

export const MonitorStatusTag: React.FC<MonitorTagProps> = ({ status, ...props }) => {
  const { text, color } = MONITOR_STATUS_MAP[status]
  
  const statusColorMap: Record<string, TagProps['color']> = {
    green: 'success',
    red: 'error',
    orange: 'warning',
  }
  
  return (
    <Tag color={statusColorMap[color]} {...props}>
      {text}
    </Tag>
  )
}

interface AlertLevelTagProps {
  level: AlertLevel
}

export const AlertLevelTag: React.FC<AlertLevelTagProps> = ({ level }) => {
  const { text, color } = ALERT_LEVEL_MAP[level]
  return <Tag color={color}>{text}优先级</Tag>
}

interface AlertStatusTagProps {
  status: AlertStatus
}

export const AlertStatusTag: React.FC<AlertStatusTagProps> = ({ status }) => {
  const { text, color } = ALERT_STATUS_MAP[status]
  return <Tag color={color}>{text}</Tag>
}

interface AlertTypeTagProps {
  type: AlertType
}

export const AlertTypeTag: React.FC<AlertTypeTagProps> = ({ type }) => {
  const typeColorMap: Record<AlertType, TagProps['color']> = {
    overload: 'orange',
    voltage_abnormal: 'purple',
    offline: 'default',
    fault: 'red',
  }
  
  return <Tag color={typeColorMap[type]}>{ALERT_TYPE_MAP[type]}</Tag>
}

interface LoadRateTagProps {
  loadRate: number
  showProgress?: boolean
}

export const LoadRateTag: React.FC<LoadRateTagProps> = ({ loadRate, showProgress = false }) => {
  let loadLevel: LoadLevel = 'normal'
  if (loadRate >= 100) loadLevel = 'overload'
  else if (loadRate >= 80) loadLevel = 'high'
  else if (loadRate <= 30) loadLevel = 'low'

  const { text, color } = LOAD_LEVEL_MAP[loadLevel]
  
  const progressColorMap: Record<LoadLevel, ProgressProps['strokeColor']> = {
    low: '#52c41a',
    normal: '#1890ff',
    high: '#faad14',
    overload: '#ff4d4f',
  }

  const tagColorMap: Record<LoadLevel, TagProps['color']> = {
    low: 'success',
    normal: 'processing',
    high: 'warning',
    overload: 'error',
  }

  if (showProgress) {
    return (
      <div style={{ minWidth: 120 }}>
        <Progress
          percent={Math.min(loadRate, 100)}
          size="small"
          strokeColor={progressColorMap[loadLevel]}
          format={() => (
            <span style={{ fontSize: 12 }}>
              {loadRate.toFixed(1)}% - {text}
            </span>
          )}
        />
      </div>
    )
  }

  return (
    <Tag color={tagColorMap[loadLevel]}>
      {loadRate.toFixed(1)}% - {text}
    </Tag>
  )
}

interface LoadLevelBadgeProps {
  loadLevel: LoadLevel
  showIcon?: boolean
}

export const LoadLevelBadge: React.FC<LoadLevelBadgeProps> = ({ loadLevel, showIcon = true }) => {
  const { text, color } = LOAD_LEVEL_MAP[loadLevel]
  
  const iconMap: Record<LoadLevel, React.ReactNode> = {
    low: null,
    normal: null,
    high: '⏚',
    overload: '⚠',
  }

  const tagColorMap: Record<LoadLevel, TagProps['color']> = {
    low: 'success',
    normal: 'default',
    high: 'warning',
    overload: 'error',
  }

  return (
    <Tag color={tagColorMap[loadLevel]}>
      {showIcon && iconMap[loadLevel]}
      {text}
    </Tag>
  )
}

export const StatusTags = {
  DeviceStatusTag,
  MonitorStatusTag,
  AlertLevelTag,
  AlertStatusTag,
  AlertTypeTag,
  LoadRateTag,
  LoadLevelBadge,
}
