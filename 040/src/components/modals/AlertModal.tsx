import React from 'react'
import { Modal, Descriptions, Button, Space, Tag, message } from 'antd'
import type { Alert, Device } from '@/types'
import { AlertLevelTag, AlertStatusTag, AlertTypeTag, DeviceStatusTag, MonitorStatusTag } from '../StatusTags'
import { useDataStore } from '@/store/dataStore'
import dayjs from 'dayjs'

interface AlertModalProps {
  visible: boolean
  alert: Alert | null
  device: Device | undefined
  onClose: () => void
}

const AlertModal: React.FC<AlertModalProps> = ({ visible, alert, device, onClose }) => {
  const { acknowledgeAlert, resolveAlert, closeAlertModal } = useDataStore()

  const handleAcknowledge = () => {
    if (alert) {
      acknowledgeAlert(alert.id, '当前用户')
      message.success('告警已确认，工单已派发')
      onClose()
      closeAlertModal()
    }
  }

  const handleResolve = () => {
    if (alert) {
      resolveAlert(alert.id, '当前用户')
      message.success('告警已解决')
      onClose()
      closeAlertModal()
    }
  }

  if (!alert) return null

  const levelMap: Record<Alert['level'], string> = {
    low: 'success',
    medium: 'warning',
    high: 'error',
  }

  return (
    <Modal
      title={
        <Space>
          <Tag color={levelMap[alert.level]}>告警详情</Tag>
          <span>{alert.deviceName}</span>
        </Space>
      }
      open={visible}
      onCancel={() => {
        onClose()
        closeAlertModal()
      }}
      footer={
        <Space>
          <Button onClick={() => {
            onClose()
            closeAlertModal()
          }}>
            关闭
          </Button>
          {alert.status === 'active' && (
            <Button type="primary" onClick={handleAcknowledge}>
              确认并派单
            </Button>
          )}
          {alert.status === 'acknowledged' && (
            <Button type="primary" onClick={handleResolve}>
              标记已解决
            </Button>
          )}
        </Space>
      }
      width={700}
    >
      <Descriptions column={2} bordered>
        <Descriptions.Item label="告警ID">{alert.id}</Descriptions.Item>
        <Descriptions.Item label="告警类型">
          <AlertTypeTag type={alert.type} />
        </Descriptions.Item>

        <Descriptions.Item label="告警级别">
          <AlertLevelTag level={alert.level} />
        </Descriptions.Item>
        <Descriptions.Item label="告警状态">
          <AlertStatusTag status={alert.status} />
        </Descriptions.Item>

        <Descriptions.Item label="设备名称" span={2}>
          {alert.deviceName}
        </Descriptions.Item>

        <Descriptions.Item label="所属区域" span={2}>
          {alert.areaName}
        </Descriptions.Item>

        <Descriptions.Item label="告警信息" span={2}>
          {alert.message}
        </Descriptions.Item>

        <Descriptions.Item label="创建时间" span={2}>
          {dayjs(alert.createTime).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>

        {alert.acknowledgedBy && (
          <Descriptions.Item label="确认人">{alert.acknowledgedBy}</Descriptions.Item>
        )}
        {alert.acknowledgeTime && (
          <Descriptions.Item label="确认时间">
            {dayjs(alert.acknowledgeTime).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        )}

        {alert.resolvedBy && (
          <Descriptions.Item label="解决人">{alert.resolvedBy}</Descriptions.Item>
        )}
        {alert.resolveTime && (
          <Descriptions.Item label="解决时间">
            {dayjs(alert.resolveTime).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        )}
      </Descriptions>

      {device && (
        <>
          <h3 style={{ marginTop: 24, marginBottom: 16 }}>关联设备信息</h3>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="设备编号">{device.code}</Descriptions.Item>
            <Descriptions.Item label="设备状态">
              <DeviceStatusTag status={device.status} />
            </Descriptions.Item>

            <Descriptions.Item label="监控状态">
              <MonitorStatusTag status={device.monitorStatus} />
            </Descriptions.Item>
            <Descriptions.Item label="额定功率">
              {device.ratedPower} kW
            </Descriptions.Item>

            <Descriptions.Item label="当前功率">
              {device.currentPower} kW
            </Descriptions.Item>
            <Descriptions.Item label="电压">
              {device.voltage} V
            </Descriptions.Item>

            <Descriptions.Item label="电流">
              {device.current} A
            </Descriptions.Item>
            <Descriptions.Item label="制造商">
              {device.manufacturer}
            </Descriptions.Item>

            <Descriptions.Item label="型号">{device.model}</Descriptions.Item>
            <Descriptions.Item label="安装时间">
              {dayjs(device.installTime).format('YYYY-MM-DD')}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Modal>
  )
}

export default AlertModal
