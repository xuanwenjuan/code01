import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, InputNumber, message } from 'antd'
import type { FormInstance } from 'antd'
import type { Device, DeviceStatus, DeviceType, MonitorStatus } from '@/types'
import { DEVICE_TYPE_MAP } from '@/constants'
import { useDataStore } from '@/store/dataStore'

interface DeviceModalProps {
  visible: boolean
  device: Device | null
  onClose: () => void
}

const DeviceModal: React.FC<DeviceModalProps> = ({ visible, device, onClose }) => {
  const [form] = Form.useForm()
  const { areas, updateDevice, createDevice, closeDeviceModal } = useDataStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible) {
      if (device) {
        form.setFieldsValue({
          name: device.name,
          code: device.code,
          type: device.type,
          ratedPower: device.ratedPower,
          status: device.status,
          monitorStatus: device.monitorStatus,
          areaId: device.areaId,
          manufacturer: device.manufacturer,
          model: device.model,
        })
      } else {
        form.resetFields()
      }
    }
  }, [visible, device, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (device) {
        updateDevice(device.id, {
          ...values,
          areaName: areas.find(a => a.id === values.areaId)?.name,
        })
        message.success('设备信息更新成功')
      } else {
        const area = areas.find(a => a.id === values.areaId)
        createDevice({
          ...values,
          areaName: area?.name || '',
          currentPower: 0,
          voltage: 220,
          current: 0,
          lastUpdateTime: new Date().toISOString(),
          installTime: new Date().toISOString(),
        })
        message.success('设备创建成功')
      }

      setLoading(false)
      onClose()
      closeDeviceModal()
    } catch (error) {
      setLoading(false)
    }
  }

  const deviceStatusOptions: { label: string; value: DeviceStatus }[] = [
    { label: '在线', value: 'online' },
    { label: '离线', value: 'offline' },
    { label: '故障', value: 'fault' },
    { label: '维护中', value: 'maintenance' },
  ]

  const monitorStatusOptions: { label: string; value: MonitorStatus }[] = [
    { label: '正常', value: 'normal' },
    { label: '预警', value: 'warning' },
    { label: '告警', value: 'alarm' },
  ]

  const deviceTypeOptions = Object.entries(DEVICE_TYPE_MAP).map(([value, label]) => ({
    label,
    value: value as DeviceType,
  }))

  const areaOptions = areas.map(area => ({
    label: area.name,
    value: area.id,
  }))

  return (
    <Modal
      title={device ? '编辑设备' : '创建设备'}
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        onClose()
        closeDeviceModal()
      }}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form as FormInstance}
        layout="vertical"
        initialValues={{
          status: 'online',
          monitorStatus: 'normal',
        }}
      >
        <Form.Item
          name="name"
          label="设备名称"
          rules={[{ required: true, message: '请输入设备名称' }]}
        >
          <Input placeholder="请输入设备名称" />
        </Form.Item>

        <Form.Item
          name="code"
          label="设备编号"
          rules={[{ required: true, message: '请输入设备编号' }]}
        >
          <Input placeholder="请输入设备编号" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="type"
            label="设备类型"
            rules={[{ required: true, message: '请选择设备类型' }]}
            style={{ flex: 1 }}
          >
            <Select options={deviceTypeOptions} placeholder="请选择设备类型" />
          </Form.Item>

          <Form.Item
            name="areaId"
            label="所属区域"
            rules={[{ required: true, message: '请选择所属区域' }]}
            style={{ flex: 1 }}
          >
            <Select options={areaOptions} placeholder="请选择所属区域" />
          </Form.Item>
        </div>

        <Form.Item
          name="ratedPower"
          label="额定功率 (kW)"
          rules={[{ required: true, message: '请输入额定功率' }]}
        >
          <InputNumber
            min={1}
            max={10000}
            style={{ width: '100%' }}
            placeholder="请输入额定功率"
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="status"
            label="设备状态"
            rules={[{ required: true, message: '请选择设备状态' }]}
            style={{ flex: 1 }}
          >
            <Select options={deviceStatusOptions} placeholder="请选择设备状态" />
          </Form.Item>

          <Form.Item
            name="monitorStatus"
            label="监控状态"
            rules={[{ required: true, message: '请选择监控状态' }]}
            style={{ flex: 1 }}
          >
            <Select options={monitorStatusOptions} placeholder="请选择监控状态" />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="manufacturer" label="制造商" style={{ flex: 1 }}>
            <Input placeholder="请输入制造商" />
          </Form.Item>

          <Form.Item name="model" label="型号" style={{ flex: 1 }}>
            <Input placeholder="请输入型号" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

export default DeviceModal
