import { useEffect, useState } from 'react'
import {
  Tabs,
  Table,
  Button,
  Switch,
  Card,
  Space,
  Tag,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Select,
  Progress,
  message,
} from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import useStore from '../store'
import {
  seckillActivities as mockSeckill,
  discountActivities as mockDiscount,
  coupons as mockCoupons,
} from '../mock'
import { SeckillActivity, DiscountActivity, Coupon, ActivityStatus, DiscountType } from '../types'
import CommonModal from './CommonModal'
import CommonForm from './CommonForm'

const { TabPane } = Tabs
const { Option } = Select

type TabType = 'seckill' | 'discount' | 'coupon'

const MarketingManagement: React.FC = () => {
  const {
    seckillActivities,
    discountActivities,
    coupons,
    setSeckillActivities,
    setDiscountActivities,
    setCoupons,
    toggleActivityStatus,
  } = useStore()
  const [activeTab, setActiveTab] = useState<TabType>('seckill')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SeckillActivity | DiscountActivity | Coupon | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (seckillActivities.length === 0) {
      setSeckillActivities(mockSeckill)
    }
    if (discountActivities.length === 0) {
      setDiscountActivities(mockDiscount)
    }
    if (coupons.length === 0) {
      setCoupons(mockCoupons)
    }
  }, [])

  const handleToggleStatus = (type: TabType, id: string, status: ActivityStatus) => {
    const actionMap = {
      seckill: '秒杀活动',
      discount: '满减活动',
      coupon: '优惠券',
    }
    toggleActivityStatus(type, id)
    message.success(`${actionMap[type]}已${status === 'enabled' ? '启用' : '禁用'}`)
  }

  const handleOk = async () => {
    try {
      await form.validateFields()
      message.success(editingItem ? '更新成功' : '创建成功')
      setModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const getModalTitle = () => {
    const titleMap = {
      seckill: '秒杀活动',
      discount: '满减活动',
      coupon: '优惠券',
    }
    return titleMap[activeTab] || ''
  }

  const StatusRender = ({
    status,
    type,
    id,
  }: {
    status: ActivityStatus
    type: TabType
    id: string
  }) => (
    <Space size="small">
      <Tag color={status === 'enabled' ? 'green' : 'default'}>
        {status === 'enabled' ? '启用' : '禁用'}
      </Tag>
      <Switch
        size="small"
        checked={status === 'enabled'}
        checkedChildren="开"
        unCheckedChildren="关"
        onChange={(checked) =>
          handleToggleStatus(type, id, checked ? 'enabled' : 'disabled')
        }
      />
    </Space>
  )

  const seckillColumns: ColumnsType<SeckillActivity> = [
    {
      title: '活动名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
    },
    {
      title: '参与商品数',
      dataIndex: 'products',
      key: 'products',
      width: 120,
      render: (products: string[]) => (
        <Tag color="blue">{products.length} 件</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ActivityStatus, record) => (
        <StatusRender status={status} type="seckill" id={record.id} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setEditingItem(record)
            form.setFieldsValue(record)
            setModalOpen(true)
          }}
        >
          编辑
        </Button>
      ),
    },
  ]

  const discountColumns: ColumnsType<DiscountActivity> = [
    {
      title: '活动名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '满减门槛',
      dataIndex: 'minAmount',
      key: 'minAmount',
      width: 120,
      render: (v: number) => (
        <span style={{ color: '#1890ff', fontWeight: 500 }}>¥{v}</span>
      ),
    },
    {
      title: '优惠金额',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      width: 120,
      render: (v: number) => (
        <Tag color="red" style={{ margin: 0 }}>
          减 ¥{v}
        </Tag>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ActivityStatus, record) => (
        <StatusRender status={status} type="discount" id={record.id} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setEditingItem(record)
            form.setFieldsValue(record)
            setModalOpen(true)
          }}
        >
          编辑
        </Button>
      ),
    },
  ]

  const couponColumns: ColumnsType<Coupon> = [
    {
      title: '优惠券名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '优惠类型',
      dataIndex: 'discountType',
      key: 'discountType',
      width: 100,
      render: (type: DiscountType) => (
        <Tag color={type === 'fixed' ? 'blue' : 'green'} style={{ margin: 0 }}>
          {type === 'fixed' ? '固定金额' : '折扣'}
        </Tag>
      ),
    },
    {
      title: '优惠值',
      dataIndex: 'discountValue',
      key: 'discountValue',
      width: 100,
      render: (v: number, record: Coupon) =>
        record.discountType === 'fixed' ? (
          <span style={{ color: '#ff4d4f', fontWeight: 500 }}>¥{v}</span>
        ) : (
          <span style={{ color: '#52c41a', fontWeight: 500 }}>{v}折</span>
        ),
    },
    {
      title: '使用门槛',
      dataIndex: 'minAmount',
      key: 'minAmount',
      width: 100,
      render: (v: number) => <span>满 ¥{v}</span>,
    },
    {
      title: '领取进度',
      key: 'progress',
      width: 150,
      render: (_, record: Coupon) => {
        const percent = Math.round((record.receivedCount / record.totalCount) * 100)
        return (
          <div>
            <Progress
              percent={percent}
              size="small"
              status={percent >= 90 ? 'exception' : percent >= 70 ? 'active' : undefined}
            />
            <div style={{ fontSize: 12, color: '#999' }}>
              {record.receivedCount}/{record.totalCount}
            </div>
          </div>
        )
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 170,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 170,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ActivityStatus, record) => (
        <StatusRender status={status} type="coupon" id={record.id} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setEditingItem(record)
            form.setFieldsValue(record)
            setModalOpen(true)
          }}
        >
          编辑
        </Button>
      ),
    },
  ]

  const tableProps = {
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
    },
    scroll: { x: 'max-content' },
    size: 'middle' as const,
  }

  return (
    <div>
      <Card title="营销活动管理">
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as TabType)}>
          <TabPane tab="限时秒杀" key="seckill">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingItem(null)
                    form.resetFields()
                    setModalOpen(true)
                  }}
                >
                  新增秒杀活动
                </Button>
              </Col>
            </Row>
            <Table
              columns={seckillColumns}
              dataSource={seckillActivities}
              rowKey="id"
              {...tableProps}
            />
          </TabPane>
          <TabPane tab="满减优惠" key="discount">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingItem(null)
                    form.resetFields()
                    setModalOpen(true)
                  }}
                >
                  新增满减活动
                </Button>
              </Col>
            </Row>
            <Table
              columns={discountColumns}
              dataSource={discountActivities}
              rowKey="id"
              {...tableProps}
            />
          </TabPane>
          <TabPane tab="优惠券" key="coupon">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingItem(null)
                    form.resetFields()
                    setModalOpen(true)
                  }}
                >
                  新增优惠券
                </Button>
              </Col>
            </Row>
            <Table
              columns={couponColumns}
              dataSource={coupons}
              rowKey="id"
              {...tableProps}
            />
          </TabPane>
        </Tabs>
      </Card>

      <CommonModal
        title={`${editingItem ? '编辑' : '新增'}${getModalTitle()}`}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        onOk={handleOk}
        width={600}
      >
        <CommonForm form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="活动名称"
                rules={[{ required: true, message: '请输入活动名称' }]}
              >
                <Input placeholder="请输入活动名称" />
              </Form.Item>
            </Col>
          </Row>

          {activeTab === 'discount' && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="minAmount"
                  label="满减门槛"
                  rules={[{ required: true, message: '请输入满减门槛' }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                    prefix="¥"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="discountAmount"
                  label="优惠金额"
                  rules={[{ required: true, message: '请输入优惠金额' }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                    prefix="¥"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          {activeTab === 'coupon' && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="discountType"
                    label="优惠类型"
                    rules={[{ required: true, message: '请选择优惠类型' }]}
                  >
                    <Select placeholder="请选择">
                      <Option value="fixed">固定金额</Option>
                      <Option value="percent">折扣</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="discountValue"
                    label="优惠值"
                    rules={[{ required: true, message: '请输入优惠值' }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="请输入"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="minAmount"
                    label="使用门槛"
                    rules={[{ required: true, message: '请输入使用门槛' }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="请输入"
                      prefix="¥"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="totalCount"
                    label="发放总量"
                    rules={[{ required: true, message: '请输入发放总量' }]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="请输入"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="开始时间"
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} placeholder="请选择" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="结束时间"
                rules={[{ required: true, message: '请选择结束时间' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} placeholder="请选择" />
              </Form.Item>
            </Col>
          </Row>
        </CommonForm>
      </CommonModal>
    </div>
  )
}

export default MarketingManagement
