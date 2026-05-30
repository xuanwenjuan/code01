import React, { useState, useEffect } from 'react'
import {
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Card,
  Row,
  Col,
  Modal,
  Form,
  message,
  Descriptions,
  Divider,
  List
} from 'antd'
import {
  SearchOutlined,
  EyeOutlined,
  CarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PhoneOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrders, fetchOrderDetail, dispatchOrder, updateOrderStatus } from '../../store/slices/orderSlice.js'
import { fetchVehicles } from '../../store/slices/vehicleSlice.js'
import { orderStatusMap, vehicleStatusMap } from '../../mock/index.js'
import StatusPage from '../../components/StatusPage/index.jsx'
import OrderDetailModal from '../../components/OrderDetailModal/index.jsx'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

const OrderDispatch = () => {
  const dispatch = useDispatch()
  const { orders, loading, error } = useSelector(state => state.orders)
  const { vehicles } = useSelector(state => state.vehicles)
  const { userInfo } = useSelector(state => state.auth)
  
  const [detailModal, setDetailModal] = useState({ open: false, order: null })
  const [dispatchModal, setDispatchModal] = useState({ open: false, order: null })
  const [dispatchForm] = Form.useForm()
  const [filters, setFilters] = useState({
    status: 'pending',
    page: 1,
    pageSize: 10,
  })
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  useEffect(() => {
    loadOrders()
    dispatch(fetchVehicles())
  }, [filters])

  const loadOrders = () => {
    dispatch(fetchOrders(filters))
  }

  const handleViewDetail = async (orderId) => {
    try {
      const result = await dispatch(fetchOrderDetail(orderId)).unwrap()
      setDetailModal({ open: true, order: result })
    } catch (err) {
      message.error('获取订单详情失败')
    }
  }

  const handleOpenDispatch = async (order) => {
    const result = await dispatch(fetchOrderDetail(order.id)).unwrap()
    setDispatchModal({ open: true, order: result })
    dispatchForm.resetFields()
    setSelectedVehicle(null)
  }

  const handleDispatch = async () => {
    try {
      const values = await dispatchForm.validateFields()
      const vehicle = vehicles.find(v => v.id === values.vehicleId)
      
      await dispatch(dispatchOrder({
        orderId: dispatchModal.order.id,
        dispatcherId: userInfo.id,
        dispatcherName: userInfo.name,
        vehicleId: values.vehicleId,
        vehicleNo: vehicle.plateNo,
        driverName: vehicle.driver,
        driverPhone: vehicle.phone,
        route: values.route,
        remark: values.remark,
      })).unwrap()
      
      message.success('调度成功')
      setDispatchModal({ open: false, order: null })
      dispatchForm.resetFields()
      loadOrders()
    } catch (err) {
      message.error(err || '调度失败')
    }
  }

  const handleVehicleSelect = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    setSelectedVehicle(vehicle)
  }

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 160,
      fixed: 'left',
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
    },
    {
      title: '货物信息',
      key: 'goods',
      width: 160,
      render: (_, record) => (
        <div>
          <div>{record.goodsType}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {record.weight}吨 / {record.volume}m³
          </div>
        </div>
      ),
    },
    {
      title: '运输路线',
      key: 'route',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <EnvironmentOutlined style={{ color: '#52c41a', marginRight: 4 }} />
            <span>{record.originCity}</span>
          </div>
          <div style={{ paddingLeft: 16, fontSize: 12, color: '#999' }}>
            ↓
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
            <span>{record.destCity}</span>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const info = orderStatusMap[status]
        return <Tag color={info?.color}>{info?.label}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<CarOutlined />}
              onClick={() => handleOpenDispatch(record)}
            >
              调度
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const pendingCount = (orders.list || []).filter(o => o.status === 'pending').length
  const transportingCount = (orders.list || []).filter(o => o.status === 'transporting').length

  const availableVehicles = vehicles.filter(v => v.status === 'idle')

  if (error) {
    return <StatusPage type="error" message="加载失败" description={error} />
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#fff7e6' }}>
            <Space>
              <div style={{ fontSize: 40, color: '#fa8c16' }}>
                <CarOutlined />
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#666' }}>待调度订单</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fa8c16' }}>
                  {pendingCount}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#e6f7ff' }}>
            <Space>
              <div style={{ fontSize: 40, color: '#1890ff' }}>
                <CarOutlined />
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#666' }}>运输中订单</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
                  {transportingCount}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#f6ffed' }}>
            <Space>
              <div style={{ fontSize: 40, color: '#52c41a' }}>
                <CheckCircleOutlined />
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#666' }}>空闲车辆</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
                  {availableVehicles.length}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card
        title="订单调度"
        bordered={false}
        extra={
          <Space className="filter-bar">
            <Select
              placeholder="订单状态"
              style={{ width: 120 }}
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v, page: 1 })}
            >
              <Option value="">全部</Option>
              {Object.entries(orderStatusMap).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
            <Input
              placeholder="搜索订单号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              allowClear
              onPressEnter={(e) => setFilters({ ...filters, orderNo: e.target.value, page: 1 })}
            />
            <Select
              placeholder="起始城市"
              style={{ width: 120 }}
              allowClear
              onChange={(v) => setFilters({ ...filters, originCity: v, page: 1 })}
            >
              {['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆'].map(city => (
                <Option key={city} value={city}>{city}</Option>
              ))}
            </Select>
          </Space>
        }
      >
        <Table
          dataSource={orders.list || []}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: orders.total || 0,
            onChange: (page, pageSize) => setFilters({ ...filters, page, pageSize }),
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <CarOutlined />
            订单调度 - {dispatchModal.order?.orderNo}
          </Space>
        }
        open={dispatchModal.open}
        onCancel={() => setDispatchModal({ open: false, order: null })}
        width={800}
        footer={
          <Space>
            <Button onClick={() => setDispatchModal({ open: false, order: null })}>取消</Button>
            <Button type="primary" onClick={handleDispatch} loading={loading}>
              确认调度
            </Button>
          </Space>
        }
      >
        {dispatchModal.order && (
          <div>
            <div className="detail-section">
              <div className="detail-section-title">订单信息</div>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="客户">{dispatchModal.order.customerName}</Descriptions.Item>
                <Descriptions.Item label="货物">{dispatchModal.order.goodsType}</Descriptions.Item>
                <Descriptions.Item label="重量">{dispatchModal.order.weight} 吨</Descriptions.Item>
                <Descriptions.Item label="体积">{dispatchModal.order.volume} m³</Descriptions.Item>
                <Descriptions.Item label="起始地" span={2}>{dispatchModal.order.origin}</Descriptions.Item>
                <Descriptions.Item label="目的地" span={2}>{dispatchModal.order.destination}</Descriptions.Item>
              </Descriptions>
            </div>

            <Divider />

            <Form form={dispatchForm} layout="vertical">
              <div className="detail-section">
                <div className="detail-section-title">车辆选择</div>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="vehicleId"
                      label="选择车辆"
                      rules={[{ required: true, message: '请选择车辆' }]}
                    >
                      <Select
                        placeholder="请选择空闲车辆"
                        onChange={handleVehicleSelect}
                        showSearch
                        optionFilterProp="children"
                      >
                        {availableVehicles.map(v => (
                          <Option key={v.id} value={v.id}>
                            {v.plateNo} - {v.type} ({v.capacity})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {selectedVehicle && (
                  <Card size="small" style={{ background: '#f5f5f5', marginBottom: 16 }}>
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="车牌号">{selectedVehicle.plateNo}</Descriptions.Item>
                      <Descriptions.Item label="车型">{selectedVehicle.type}</Descriptions.Item>
                      <Descriptions.Item label="载重">{selectedVehicle.capacity}</Descriptions.Item>
                      <Descriptions.Item label="当前位置">{selectedVehicle.currentLocation}</Descriptions.Item>
                      <Descriptions.Item label="司机">
                        <Space><UserOutlined />{selectedVehicle.driver}</Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="电话">
                        <Space><PhoneOutlined />{selectedVehicle.phone}</Space>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}
              </div>

              <div className="detail-section">
                <div className="detail-section-title">路线规划</div>
                <Form.Item
                  name="route"
                  label="运输路线"
                  rules={[
                    { required: true, message: '请输入运输路线' },
                    { min: 5, message: '路线描述至少5个字符' }
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="请详细描述运输路线，例如：从北京朝阳区出发，经京沪高速，到达上海浦东新区"
                  />
                </Form.Item>
              </div>

              <div className="detail-section">
                <div className="detail-section-title">调度备注</div>
                <Form.Item name="remark" label="备注信息">
                  <TextArea
                    rows={2}
                    placeholder="请输入调度备注（可选）"
                  />
                </Form.Item>
              </div>
            </Form>

            <div className="route-map">
              <div style={{ fontWeight: 'bold', marginBottom: 12 }}>路线预览</div>
              <div className="route-point">
                <div className="route-point-icon route-point-start"></div>
                <span>{dispatchModal.order.origin}</span>
              </div>
              <div className="route-line"></div>
              <div className="route-point">
                <div className="route-point-icon route-point-end"></div>
                <span>{dispatchModal.order.destination}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <OrderDetailModal
        open={detailModal.open}
        order={detailModal.order}
        loading={loading}
        onClose={() => setDetailModal({ open: false, order: null })}
        onDispatch={() => {}}
        onUpdateStatus={(data) => dispatch(updateOrderStatus(data)).then(() => loadOrders())}
        vehicles={vehicles}
        userInfo={userInfo}
      />
    </div>
  )
}

export default OrderDispatch
