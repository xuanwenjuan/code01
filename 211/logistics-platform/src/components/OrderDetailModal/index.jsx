import React, { useState } from 'react'
import { Modal, Descriptions, Tag, Timeline, Button, Space, Form, Select, Input, message, Row, Col } from 'antd'
import { orderStatusMap } from '../../mock/index.js'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

const OrderDetailModal = ({ open, order, loading, onClose, onDispatch, onUpdateStatus, vehicles, userInfo, showDispatch = false }) => {
  const [dispatchForm] = Form.useForm()
  const [showDispatchForm, setShowDispatchForm] = useState(false)

  if (!order) return null

  const statusInfo = orderStatusMap[order.status]

  const handleDispatch = async () => {
    try {
      const values = await dispatchForm.validateFields()
      const selectedVehicle = vehicles.find(v => v.id === values.vehicleId)
      onDispatch({
        ...values,
        orderId: order.id,
        dispatcherId: userInfo.id,
        dispatcherName: userInfo.name,
        vehicleNo: selectedVehicle?.plateNo,
        driverName: selectedVehicle?.driver,
        driverPhone: selectedVehicle?.phone,
      })
      setShowDispatchForm(false)
      dispatchForm.resetFields()
    } catch (err) {
      console.error('Validation failed:', err)
    }
  }

  const handleComplete = () => {
    onUpdateStatus({
      orderId: order.id,
      status: 'completed',
      operator: userInfo.name,
      action: '订单完成',
      remark: '货物已正常签收',
    })
  }

  const sortedHistory = [...order.historyRecords].sort(
    (a, b) => new Date(a.createTime) - new Date(b.createTime)
  )

  const availableVehicles = vehicles.filter(v => v.status === 'idle')

  return (
    <Modal
      title={
        <Space>
          <span>订单详情 - {order.orderNo}</span>
          <Tag color={statusInfo?.color}>{statusInfo?.label}</Tag>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={900}
      className="order-detail-modal"
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          {showDispatch && order.status === 'pending' && (
            <Button type="primary" onClick={() => setShowDispatchForm(true)}>
              分配车辆
            </Button>
          )}
          {order.status === 'transporting' && userInfo?.role === 'dispatcher' && (
            <Button type="primary" onClick={handleComplete}>
              完成订单
            </Button>
          )}
        </Space>
      }
    >
      {showDispatchForm && (
        <div style={{ marginBottom: 24, padding: 16, background: '#f0f5ff', borderRadius: 8 }}>
          <h4 style={{ marginBottom: 16 }}>分配运输车辆</h4>
          <Form form={dispatchForm} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="vehicleId"
                  label="选择车辆"
                  rules={[{ required: true, message: '请选择车辆' }]}
                >
                  <Select placeholder="请选择空闲车辆">
                    {availableVehicles.map(v => (
                      <Option key={v.id} value={v.id}>
                        {v.plateNo} - {v.type} ({v.capacity}) - {v.driver}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="route"
                  label="路线规划"
                  rules={[{ required: true, message: '请输入路线' }]}
                >
                  <Input placeholder="如：北京-上海，走京沪高速" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="remark" label="调度备注">
              <TextArea rows={2} placeholder="请输入调度备注（可选）" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleDispatch} loading={loading}>
                  确认调度
                </Button>
                <Button onClick={() => setShowDispatchForm(false)}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      )}

      <div className="detail-section">
        <div className="detail-section-title">基本信息</div>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="订单编号">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="客户名称">{order.customerName}</Descriptions.Item>
          <Descriptions.Item label="货物类型">{order.goodsType}</Descriptions.Item>
          <Descriptions.Item label="订单状态">
            <Tag color={statusInfo?.color}>{statusInfo?.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="重量">{order.weight} 吨</Descriptions.Item>
          <Descriptions.Item label="体积">{order.volume} m³</Descriptions.Item>
          <Descriptions.Item label="预估费用">¥ {order.estimatedCost}</Descriptions.Item>
          <Descriptions.Item label="实际费用">
            {order.actualCost ? `¥ ${order.actualCost}` : '-'}
          </Descriptions.Item>
        </Descriptions>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">运输信息</div>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="起始地" span={2}>{order.origin}</Descriptions.Item>
          <Descriptions.Item label="目的地" span={2}>{order.destination}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{dayjs(order.createTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="预计送达">
            {order.expectDeliveryTime ? dayjs(order.expectDeliveryTime).format('YYYY-MM-DD HH:mm') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="实际送达">
            {order.actualDeliveryTime ? dayjs(order.actualDeliveryTime).format('YYYY-MM-DD HH:mm') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="调度员">{order.dispatcherName || '-'}</Descriptions.Item>
          <Descriptions.Item label="车牌号">{order.vehicleNo || '-'}</Descriptions.Item>
          <Descriptions.Item label="司机">{order.driverName || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{order.driverPhone || '-'}</Descriptions.Item>
        </Descriptions>
      </div>

      {order.status === 'exception' && (
        <div className="detail-section">
          <div className="detail-section-title" style={{ color: '#faad14' }}>异常信息</div>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="异常原因">{order.exceptionReason}</Descriptions.Item>
            <Descriptions.Item label="异常时间">{dayjs(order.exceptionHandleTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="处理结果">{order.exceptionHandleResult || '处理中...'}</Descriptions.Item>
          </Descriptions>
        </div>
      )}

      {order.remark && (
        <div className="detail-section">
          <div className="detail-section-title">备注信息</div>
          <p style={{ padding: 12, background: '#fafafa', borderRadius: 4 }}>{order.remark}</p>
        </div>
      )}

      <div className="detail-section">
        <div className="detail-section-title">操作记录</div>
        <div className="timeline-container">
          <Timeline mode="left">
            {sortedHistory.map((record, index) => (
              <Timeline.Item
                key={record.id}
                color={index === sortedHistory.length - 1 ? 'blue' : 'gray'}
                label={dayjs(record.createTime).format('YYYY-MM-DD HH:mm')}
              >
                <strong>{record.operator}</strong> - {record.action}
                {record.remark && <div style={{ color: '#666', fontSize: 12 }}>{record.remark}</div>}
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </div>
    </Modal>
  )
}

export default OrderDetailModal
