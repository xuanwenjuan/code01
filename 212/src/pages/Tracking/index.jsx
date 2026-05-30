import React, { useState, useEffect, useMemo } from 'react'
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  Typography,
  Space,
  Descriptions,
  Tag,
  Modal,
  Form,
  message,
  Timeline,
  Badge,
  Alert,
  Divider,
  Progress,
  Steps,
  Tooltip
} from 'antd'
import {
  SearchOutlined,
  BarcodeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  ProfileOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  InboxOutlined,
  SwapOutlined,
  SendOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import {
  fetchWaybillById,
  selectCurrentWaybill,
  selectWaybillLoading,
  selectWaybillError,
  clearCurrentWaybill
} from '@/store/slices/waybillSlice'
import {
  fetchTrackingRecords,
  selectCurrentRecords,
  selectTrackingLoading,
  reportException,
  addTrackingRecord
} from '@/store/slices/trackingSlice'
import { selectCurrentUser } from '@/store/slices/userSlice'
import { Loading, StatusTag, EmptyState, ErrorState } from '@/components'
import { statusList, exceptionTypes } from '@/mock/waybills'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { confirm } = Modal

const routePoints = [
  { name: '北京', coords: [116.4074, 39.9042] },
  { name: '天津', coords: [117.2010, 39.0842] },
  { name: '济南', coords: [117.0009, 36.6758] },
  { name: '徐州', coords: [117.2058, 34.2690] },
  { name: '南京', coords: [118.7969, 32.0603] },
  { name: '上海', coords: [121.4737, 31.2304] }
]

const Tracking = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchId, setSearchId] = useState('')
  const waybill = useSelector(selectCurrentWaybill)
  const waybillLoading = useSelector(selectWaybillLoading)
  const waybillError = useSelector(selectWaybillError)
  const trackingRecords = useSelector(selectCurrentRecords)
  const trackingLoading = useSelector(selectTrackingLoading)
  const user = useSelector(selectCurrentUser)

  const [exceptionModalVisible, setExceptionModalVisible] = useState(false)
  const [trackingModalVisible, setTrackingModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [trackingForm] = Form.useForm()

  const initialId = searchParams.get('id')

  useEffect(() => {
    if (initialId) {
      setSearchId(initialId)
      handleSearch(initialId)
    }
  }, [initialId])

  useEffect(() => {
    return () => {
      dispatch(clearCurrentWaybill())
    }
  }, [dispatch])

  const handleSearch = (id = searchId) => {
    if (!id.trim()) {
      message.warning('请输入运单号')
      return
    }
    if (!/^WL\d{8}$/.test(id.trim())) {
      message.warning('运单号格式不正确，应为WL后接8位数字')
      return
    }
    dispatch(fetchWaybillById(id.trim())).then((result) => {
      if (fetchWaybillById.fulfilled.match(result)) {
        dispatch(fetchTrackingRecords(id.trim()))
        setSearchParams({ id: id.trim() })
      }
    })
  }

  const handleReportException = async () => {
    try {
      const values = await form.validateFields()
      await dispatch(reportException({
        waybillId: waybill.id,
        exceptionType: values.exceptionType,
        description: values.description,
        reporterName: values.reporterName,
        reporterPhone: values.reporterPhone,
        reporterId: values.reporterId
      }))
      message.success('异常上报成功')
      setExceptionModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleAddTracking = async () => {
    try {
      const values = await trackingForm.validateFields()
      await dispatch(addTrackingRecord({
        waybillId: waybill.id,
        record: {
          status: values.status,
          statusLabel: statusList.find(s => s.value === values.status)?.label,
          description: values.description,
          location: values.location,
          operator: user?.name || '手动录入'
        }
      }))
      message.success('跟踪记录添加成功')
      setTrackingModalVisible(false)
      trackingForm.resetFields()
      dispatch(fetchTrackingRecords(waybill.id))
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const showExceptionConfirm = () => {
    confirm({
      title: '确认上报异常',
      icon: <ExclamationCircleOutlined />,
      content: '您确定要上报此货物的异常情况吗？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        setExceptionModalVisible(true)
      }
    })
  }

  const transportProgress = useMemo(() => {
    if (!waybill) return 0
    const statusOrder = ['pending', 'in_transit', 'transfer', 'delivery', 'signed']
    const currentIndex = statusOrder.indexOf(waybill.status)
    return ((currentIndex + 1) / statusOrder.length) * 100
  }, [waybill])

  const estimatedDays = useMemo(() => {
    if (!waybill) return null
    const createDate = dayjs(waybill.createTime)
    const estimatedDate = dayjs(waybill.estimatedDelivery)
    const now = dayjs()
    const totalDays = estimatedDate.diff(createDate, 'day')
    const elapsedDays = now.diff(createDate, 'day')
    const remainingDays = estimatedDate.diff(now, 'day')
    return {
      total: totalDays,
      elapsed: Math.max(0, elapsedDays),
      remaining: Math.max(0, remainingDays),
      isOverdue: remainingDays < 0
    }
  }, [waybill])

  const routeMapOption = useMemo(() => {
    if (!waybill) return null
    
    const startPoint = routePoints[0]
    const endPoint = routePoints[routePoints.length - 1]
    const progress = transportProgress / 100
    const currentIndex = Math.floor(progress * (routePoints.length - 1))
    const currentPoint = routePoints[Math.min(currentIndex, routePoints.length - 1)]

    return {
      tooltip: {
        trigger: 'item'
      },
      geo: {
        map: 'china',
        show: false
      },
      xAxis: {
        type: 'value',
        show: false,
        min: 115,
        max: 122
      },
      yAxis: {
        type: 'value',
        show: false,
        min: 30,
        max: 42
      },
      series: [
        {
          name: '运输路线',
          type: 'line',
          data: routePoints.map(p => p.coords),
          lineStyle: {
            color: '#1890ff',
            width: 3,
            type: 'solid'
          },
          itemStyle: {
            color: '#1890ff'
          },
          symbol: 'circle',
          symbolSize: 8,
          label: {
            show: true,
            formatter: (params) => routePoints[params.dataIndex].name,
            position: 'top',
            color: '#666',
            fontSize: 12
          }
        },
        {
          name: '当前位置',
          type: 'effectScatter',
          data: [currentPoint.coords],
          symbolSize: 20,
          rippleEffect: {
            brushType: 'stroke',
            scale: 4
          },
          itemStyle: {
            color: '#ff4d4f',
            shadowBlur: 10,
            shadowColor: '#ff4d4f'
          },
          label: {
            show: true,
            formatter: '📍 当前位置',
            position: 'right',
            color: '#ff4d4f',
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        {
          name: '起点',
          type: 'scatter',
          data: [startPoint.coords],
          symbolSize: 15,
          itemStyle: {
            color: '#52c41a'
          },
          label: {
            show: true,
            formatter: '起点',
            position: 'bottom',
            color: '#52c41a',
            fontSize: 12
          }
        },
        {
          name: '终点',
          type: 'scatter',
          data: [endPoint.coords],
          symbolSize: 15,
          itemStyle: {
            color: '#fa8c16'
          },
          label: {
            show: true,
            formatter: '终点',
            position: 'bottom',
            color: '#fa8c16',
            fontSize: 12
          }
        }
      ]
    }
  }, [waybill, transportProgress])

  const validateExceptionDesc = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入异常描述'))
    }
    if (value.length < 10) {
      return Promise.reject(new Error('异常描述至少10个字符'))
    }
    if (value.length > 500) {
      return Promise.reject(new Error('异常描述不能超过500个字符'))
    }
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9，。！？、；：""''（）\s,.!?;:"'()\-]+$/.test(value)) {
      return Promise.reject(new Error('异常描述只能包含中文、英文、数字和常见标点符号'))
    }
    return Promise.resolve()
  }

  const validateReporterName = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入上报人姓名'))
    }
    if (value.length < 2) {
      return Promise.reject(new Error('姓名至少2个字符'))
    }
    if (value.length > 20) {
      return Promise.reject(new Error('姓名不能超过20个字符'))
    }
    if (!/^[\u4e00-\u9fa5a-zA-Z\s·]+$/.test(value)) {
      return Promise.reject(new Error('姓名只能包含中文、英文字母和空格'))
    }
    return Promise.resolve()
  }

  const validateReporterPhone = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入上报人电话'))
    }
    if (!/^1[3-9]\d{9}$/.test(value)) {
      return Promise.reject(new Error('请输入正确的11位手机号码'))
    }
    return Promise.resolve()
  }

  const validateReporterId = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入上报人工号'))
    }
    if (!/^[A-Za-z]{2}\d{4,6}$/.test(value)) {
      return Promise.reject(new Error('工号格式不正确，应为2位字母+4-6位数字'))
    }
    return Promise.resolve()
  }

  const renderSearchSection = () => (
    <Card bordered={false} style={{ marginBottom: 24 }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>货物跟踪查询</Title>
          <Text type="secondary">输入运单号查询货物实时位置、运输节点和完整信息</Text>
        </div>
        <Space.Compact style={{ width: '100%', maxWidth: 600 }}>
          <Input
            placeholder="请输入运单号，如：WL00000001"
            size="large"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onPressEnter={() => handleSearch()}
            prefix={<BarcodeOutlined />}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={() => handleSearch()}
            loading={waybillLoading}
          >
            查询
          </Button>
        </Space.Compact>
        <div style={{ fontSize: 12, color: '#999' }}>
          <InfoCircleOutlined /> 提示：运单号格式为 WL + 8位数字，示例：WL00000001
        </div>
      </Space>
    </Card>
  )

  const renderWaybillInfo = () => {
    if (waybillLoading) {
      return (
        <Card bordered={false}>
          <Loading tip="正在查询运单信息..." />
        </Card>
      )
    }

    if (waybillError) {
      return (
        <Card bordered={false}>
          <ErrorState
            title="查询失败"
            subTitle={waybillError}
            onRetry={() => handleSearch()}
          />
        </Card>
      )
    }

    if (!waybill) {
      return (
        <Card bordered={false}>
          <EmptyState
            description="请输入运单号进行查询"
            image={EmptyState.PRESENTED_IMAGE_DEFAULT}
          />
        </Card>
      )
    }

    return (
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {waybill.hasException && (
          <Alert
            message="货物异常"
            description={waybill.exceptionDesc}
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            closable
            action={
              <Button size="small" danger onClick={showExceptionConfirm}>
                立即上报
              </Button>
            }
          />
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <ProfileOutlined />
                  <span>运单完整信息</span>
                  <StatusTag status={waybill.status} label={waybill.statusLabel} />
                </Space>
              }
              bordered={false}
              extra={
                <Space>
                  <Button icon={<FlagOutlined />} onClick={showExceptionConfirm}>
                    上报异常
                  </Button>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={() => handleSearch(waybill.id)}
                  >
                    刷新
                  </Button>
                </Space>
              }
            >
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="运单号" span={2}>
                  <Text strong copyable style={{ fontSize: 16 }}>{waybill.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="跟踪单号">
                  <Text copyable>{waybill.trackingNo}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="货物状态">
                  <StatusTag status={waybill.status} label={waybill.statusLabel} />
                </Descriptions.Item>
                <Descriptions.Item label="货物类型" span={2}>
                  {waybill.goodsType}
                </Descriptions.Item>
                <Descriptions.Item label="货物名称">
                  {waybill.goodsName}
                </Descriptions.Item>
                <Descriptions.Item label="重量">
                  {waybill.weight} kg
                </Descriptions.Item>
                <Descriptions.Item label="体积">
                  {waybill.volume}
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left" style={{ fontSize: 14 }}>运输时效</Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>预计运输时长</Text>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#1890ff', marginTop: 4 }}>
                      {estimatedDays?.total || 3} 天
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>已运输</Text>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#52c41a', marginTop: 4 }}>
                      {estimatedDays?.elapsed || 0} 天
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: 12, background: waybill.status === 'signed' ? '#f6ffed' : estimatedDays?.isOverdue ? '#fff2f0' : '#fff7e6', borderRadius: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {waybill.status === 'signed' ? '已签收' : estimatedDays?.isOverdue ? '已延迟' : '预计剩余'}
                    </Text>
                    <div style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: waybill.status === 'signed' ? '#52c41a' : estimatedDays?.isOverdue ? '#ff4d4f' : '#fa8c16',
                      marginTop: 4
                    }}>
                      {waybill.status === 'signed' ? '0' : estimatedDays?.isOverdue ? Math.abs(estimatedDays?.remaining) + ' 天' : estimatedDays?.remaining + ' 天'}
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider orientation="left" style={{ fontSize: 14 }}>时间信息</Divider>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="创建时间">
                  <ClockCircleOutlined /> {waybill.createTime}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  <ClockCircleOutlined /> {waybill.updateTime}
                </Descriptions.Item>
                <Descriptions.Item label="预计送达">
                  <RiseOutlined /> {waybill.estimatedDelivery}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Card
                title={
                  <Space>
                    <EnvironmentOutlined />
                    <span>实时位置追踪</span>
                  </Space>
                }
                bordered={false}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 8,
                  padding: 20,
                  color: '#fff',
                  marginBottom: 12
                }}>
                  <Space direction="vertical" size={6}>
                    <Space>
                      <EnvironmentOutlined style={{ fontSize: 18 }} />
                      <Text strong style={{ color: '#fff', fontSize: 15 }}>
                        {waybill.currentLocation}
                      </Text>
                    </Space>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
                      最后更新: {waybill.updateTime}
                    </Text>
                  </Space>
                </div>
                
                <div style={{
                  height: 200,
                  background: '#e6f7ff',
                  borderRadius: 8,
                  border: '1px dashed #91d5ff',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <ReactECharts
                    option={routeMapOption}
                    style={{ height: '100%', width: '100%' }}
                    notMerge={true}
                    lazyUpdate={true}
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>运输进度</Text>
                  <Progress
                    percent={Math.round(transportProgress)}
                    status={waybill.status === 'signed' ? 'success' : waybill.hasException ? 'exception' : 'active'}
                    strokeColor={{
                      '0%': '#1890ff',
                      '100%': '#52c41a'
                    }}
                  />
                </div>
              </Card>

              <Card
                title={
                  <Space>
                    <UserOutlined />
                    <span>寄收件信息</span>
                  </Space>
                }
                bordered={false}
                size="small"
              >
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <div style={{
                    padding: 12,
                    background: '#f0f5ff',
                    borderRadius: 8,
                    borderLeft: '3px solid #1890ff'
                  }}>
                    <Space align="start">
                      <TruckOutlined style={{ marginTop: 4, color: '#1890ff', fontSize: 16 }} />
                      <div>
                        <Text strong>寄件人：{waybill.sender.name}</Text>
                        <div>
                          <PhoneOutlined style={{ color: '#999' }} />
                          <Text type="secondary" style={{ marginLeft: 4 }}>{waybill.sender.phone}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                          📍 {waybill.sender.address}
                        </Text>
                      </div>
                    </Space>
                  </div>
                  <div style={{ textAlign: 'center', color: '#999' }}>
                    ↓ 运输中 ↓
                  </div>
                  <div style={{
                    padding: 12,
                    background: '#f6ffed',
                    borderRadius: 8,
                    borderLeft: '3px solid #52c41a'
                  }}>
                    <Space align="start">
                      <CheckCircleOutlined style={{ marginTop: 4, color: '#52c41a', fontSize: 16 }} />
                      <div>
                        <Text strong>收件人：{waybill.receiver.name}</Text>
                        <div>
                          <PhoneOutlined style={{ color: '#999' }} />
                          <Text type="secondary" style={{ marginLeft: 4 }}>{waybill.receiver.phone}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                          📍 {waybill.receiver.address}
                        </Text>
                      </div>
                    </Space>
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>

        <Card
          title={
            <Space>
              <SafetyCertificateOutlined />
              <span>运输节点记录</span>
              <Tag color="blue">{trackingRecords.length} 条记录</Tag>
            </Space>
          }
          bordered={false}
          extra={
            <Button
              type="primary"
              onClick={() => setTrackingModalVisible(true)}
            >
              + 添加跟踪记录
            </Button>
          }
        >
          <Steps
            current={trackingRecords.length - 1}
            status={waybill.hasException ? 'error' : 'process'}
            style={{ marginBottom: 24 }}
            items={[
              { title: '待揽收', icon: <InboxOutlined /> },
              { title: '在途', icon: <TruckOutlined /> },
              { title: '中转', icon: <SwapOutlined /> },
              { title: '派件中', icon: <SendOutlined /> },
              { title: '已签收', icon: <CheckCircleOutlined /> }
            ]}
          />

          {trackingLoading ? (
            <Loading tip="加载跟踪记录..." />
          ) : trackingRecords.length === 0 ? (
            <EmptyState description="暂无跟踪记录" />
          ) : (
            <Timeline
              mode="left"
              style={{ padding: '16px 0' }}
              items={trackingRecords.map((record, index) => ({
                color: index === 0 ? '#1890ff' : record.isException ? 'red' : undefined,
                dot: index === 0 ? (
                  <Badge status="processing" />
                ) : record.isException ? (
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                ) : undefined,
                label: (
                  <Space direction="vertical" size={0}>
                    <Text strong>{record.time}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {dayjs(record.time).fromNow()}
                    </Text>
                  </Space>
                ),
                children: (
                  <div style={{ paddingLeft: 16, paddingBottom: 16 }}>
                    <Space wrap>
                      <StatusTag status={record.status} label={record.statusLabel} />
                      {record.isException && (
                        <Tag color="red" icon={<ExclamationCircleOutlined />}>异常</Tag>
                      )}
                    </Space>
                    <Paragraph style={{ margin: '8px 0', fontSize: 14 }}>
                      {record.description}
                    </Paragraph>
                    <Space size={16} wrap>
                      <Tooltip title="所在位置">
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <EnvironmentOutlined /> {record.location}
                        </Text>
                      </Tooltip>
                      <Tooltip title="操作人">
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <UserOutlined /> {record.operator}
                        </Text>
                      </Tooltip>
                    </Space>
                    {record.exceptionDesc && (
                      <Alert
                        message="异常详情"
                        description={record.exceptionDesc}
                        type="error"
                        showIcon
                        style={{ marginTop: 8, fontSize: 12 }}
                      />
                    )}
                  </div>
                )
              }))}
            />
          )}
        </Card>
      </Space>
    )
  }

  return (
    <div>
      {renderSearchSection()}
      {renderWaybillInfo()}

      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>异常情况上报</span>
          </Space>
        }
        open={exceptionModalVisible}
        onOk={handleReportException}
        onCancel={() => {
          setExceptionModalVisible(false)
          form.resetFields()
        }}
        okText="提交上报"
        cancelText="取消"
        confirmLoading={trackingLoading}
        width={560}
      >
        <Alert
          message="上报须知"
          description="请如实填写异常信息，上报后将通知相关处理人员"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="exceptionType"
                label="异常类型"
                rules={[{ required: true, message: '请选择异常类型' }]}
              >
                <Select placeholder="请选择异常类型">
                  {exceptionTypes.map(item => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="严重程度"
                rules={[{ required: true, message: '请选择严重程度' }]}
              >
                <Select placeholder="请选择严重程度">
                  <Option value="low">轻微</Option>
                  <Option value="medium">一般</Option>
                  <Option value="high">严重</Option>
                  <Option value="critical">紧急</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="异常描述"
            rules={[{ validator: validateExceptionDesc }]}
            extra="请详细描述异常情况（10-500字），只能包含中文、英文、数字和常见标点符号"
          >
            <TextArea
              rows={4}
              placeholder="请详细描述异常情况，如：货物在运输过程中发现外包装破损，内物可能受损..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Divider orientation="left" style={{ fontSize: 13 }}>上报人信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reporterName"
                label="上报人姓名"
                rules={[{ validator: validateReporterName }]}
                extra="2-20个字符，支持中英文"
              >
                <Input
                  placeholder="请输入姓名"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reporterPhone"
                label="联系电话"
                rules={[{ validator: validateReporterPhone }]}
                extra="11位手机号码"
              >
                <Input
                  placeholder="请输入手机号码"
                  prefix={<PhoneOutlined />}
                  maxLength={11}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="reporterId"
            label="员工工号"
            rules={[{ validator: validateReporterId }]}
            extra="格式：2位字母 + 4-6位数字，如：TR00123"
          >
            <Input
              placeholder="请输入工号"
              prefix={<SafetyCertificateOutlined />}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加跟踪记录"
        open={trackingModalVisible}
        onOk={handleAddTracking}
        onCancel={() => {
          setTrackingModalVisible(false)
          trackingForm.resetFields()
        }}
        okText="提交"
        cancelText="取消"
      >
        <Form form={trackingForm} layout="vertical">
          <Form.Item
            name="status"
            label="货物状态"
            rules={[{ required: true, message: '请选择货物状态' }]}
          >
            <Select placeholder="请选择货物状态">
              {statusList.filter(s => s.value !== 'all').map(item => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="location"
            label="所在位置"
            rules={[
              { required: true, message: '请输入所在位置' },
              { min: 2, message: '位置至少2个字符' }
            ]}
          >
            <Input placeholder="请输入当前所在位置" prefix={<EnvironmentOutlined />} />
          </Form.Item>
          <Form.Item
            name="description"
            label="跟踪描述"
            rules={[
              { required: true, message: '请输入跟踪描述' },
              { min: 5, message: '描述至少5个字符' }
            ]}
          >
            <TextArea
              rows={3}
              placeholder="请输入跟踪记录描述..."
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Tracking
