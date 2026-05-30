import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  Typography,
  Space,
  Modal,
  Form,
  message,
  Tag,
  Table,
  Tabs,
  Alert,
  Tooltip,
  Progress,
  Statistic,
  Divider,
  DatePicker,
  Descriptions
} from 'antd'
import {
  SearchOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  InboxOutlined,
  CheckSquareOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  FilterOutlined,
  ExportOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import {
  fetchWaybills,
  selectFilteredWaybills,
  selectWaybillLoading,
  selectWaybillError,
  updateWaybillStatus
} from '@/store/slices/waybillSlice'
import {
  addTrackingRecord
} from '@/store/slices/trackingSlice'
import { selectCurrentUser } from '@/store/slices/userSlice'
import { StatCard, StatusTag, DataTable, Loading, EmptyState, ErrorState } from '@/components'
import { statusList, exceptionTypes } from '@/mock/waybills'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { confirm } = Modal
const { TabPane } = Tabs
const { RangePicker } = DatePicker

const Management = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const waybills = useSelector(selectFilteredWaybills)
  const loading = useSelector(selectWaybillLoading)
  const waybillError = useSelector(selectWaybillError)

  const isAdmin = user?.role === 'admin'

  const [activeTab, setActiveTab] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [trackerFilter, setTrackerFilter] = useState('all')
  const [dateRange, setDateRange] = useState(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentWaybill, setCurrentWaybill] = useState(null)
  const [operationError, setOperationError] = useState(null)
  const [form] = Form.useForm()

  const loadWaybills = useCallback(() => {
    const filters = {}
    
    if (!isAdmin) {
      filters.trackerId = user?.id
    }
    
    if (trackerFilter && trackerFilter !== 'all' && isAdmin) {
      filters.trackerId = trackerFilter
    }
    
    if (activeTab === 'exception') {
      filters.hasException = true
    } else if (activeTab === 'in_progress') {
      filters.status = 'in_transit'
    } else if (activeTab === 'completed') {
      filters.status = 'signed'
    }
    
    dispatch(fetchWaybills(filters))
  }, [dispatch, user?.id, activeTab, trackerFilter, isAdmin])

  useEffect(() => {
    loadWaybills()
  }, [loadWaybills])

  const visibleWaybills = useMemo(() => {
    if (isAdmin) {
      return waybills
    }
    return waybills.filter(w => w.trackerId === user?.id)
  }, [waybills, user?.id, isAdmin])

  const filteredWaybills = useMemo(() => {
    let result = [...visibleWaybills]

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(w => w.status === statusFilter)
    }
    
    if (keyword) {
      const kw = keyword.toLowerCase()
      result = result.filter(w =>
        w.id.toLowerCase().includes(kw) ||
        w.goodsName?.includes(kw) ||
        w.sender?.name?.includes(kw) ||
        w.receiver?.name?.includes(kw)
      )
    }
    
    if (dateRange && dateRange.length === 2) {
      const start = dayjs(dateRange[0]).startOf('day')
      const end = dayjs(dateRange[1]).endOf('day')
      result = result.filter(w => {
        const createDate = dayjs(w.createTime)
        return createDate.isAfter(start) && createDate.isBefore(end)
      })
    }

    return result
  }, [visibleWaybills, statusFilter, keyword, dateRange])

  const stats = useMemo(() => {
    const total = visibleWaybills.length
    const pending = visibleWaybills.filter(w => w.status === 'pending').length
    const inTransit = visibleWaybills.filter(w => w.status === 'in_transit').length
    const transfer = visibleWaybills.filter(w => w.status === 'transfer').length
    const delivery = visibleWaybills.filter(w => w.status === 'delivery').length
    const signed = visibleWaybills.filter(w => w.status === 'signed').length
    const exception = visibleWaybills.filter(w => w.hasException).length
    
    const completionRate = total > 0 ? Math.round((signed / total) * 100) : 0
    const exceptionRate = total > 0 ? Math.round((exception / total) * 100) : 0
    const inProgress = total - signed - pending

    return {
      total,
      pending,
      inTransit,
      transfer,
      delivery,
      signed,
      exception,
      inProgress,
      completionRate,
      exceptionRate,
      exceptionHandled: exception > 0 ? Math.round(exception * 0.7) : 0
    }
  }, [visibleWaybills])

  const statusDistributionOption = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [
      {
        name: '运单状态分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: stats.pending, name: '待揽收', itemStyle: { color: '#d9d9d9' } },
          { value: stats.inTransit, name: '在途', itemStyle: { color: '#1890ff' } },
          { value: stats.transfer, name: '中转', itemStyle: { color: '#722ed1' } },
          { value: stats.delivery, name: '派件中', itemStyle: { color: '#fa8c16' } },
          { value: stats.signed, name: '已签收', itemStyle: { color: '#52c41a' } }
        ]
      }
    ]
  }), [stats])

  const trendChartOption = useMemo(() => ({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增运单', '完成运单', '异常运单']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增运单',
        type: 'line',
        stack: 'Total',
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        data: [8, 12, 10, 15, 11, 6, 4],
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '完成运单',
        type: 'line',
        stack: 'Total',
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        data: [6, 9, 8, 12, 9, 5, 3],
        itemStyle: {
          color: '#52c41a'
        }
      },
      {
        name: '异常运单',
        type: 'line',
        stack: 'Total',
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        data: [1, 2, 1, 3, 2, 0, 1],
        itemStyle: {
          color: '#ff4d4f'
        }
      }
    ]
  }), [])

  const handleEditTracking = (record) => {
    setCurrentWaybill(record)
    setOperationError(null)
    form.setFieldsValue({
      status: record.status,
      location: record.currentLocation,
      description: ''
    })
    setEditModalVisible(true)
  }

  const handleEditSubmit = async () => {
    try {
      setOperationError(null)
      const values = await form.validateFields()

      if (!currentWaybill) {
        throw new Error('运单信息不存在')
      }

      if (currentWaybill.status === 'signed') {
        message.warning('已签收的运单无法编辑')
        return
      }

      await dispatch(addTrackingRecord({
        waybillId: currentWaybill.id,
        record: {
          status: values.status,
          statusLabel: statusList.find(s => s.value === values.status)?.label,
          description: values.description,
          location: values.location,
          operator: user?.name
        }
      }))

      if (values.status !== currentWaybill.status) {
        await dispatch(updateWaybillStatus({
          id: currentWaybill.id,
          status: values.status
        }))
      }

      message.success('跟踪记录更新成功')
      setEditModalVisible(false)
      form.resetFields()
      setCurrentWaybill(null)
      loadWaybills()
    } catch (error) {
      console.error('Validation failed:', error)
      setOperationError(error.message || '操作失败，请重试')
    }
  }

  const handleCompleteTracking = (record) => {
    if (record.status === 'signed') {
      message.warning('该运单已完成跟踪')
      return
    }

    confirm({
      title: '确认完成跟踪',
      icon: <CheckCircleOutlined />,
      content: (
        <div>
          <p>您确定要将运单 <Text strong>{record.id}</Text> 标记为已签收吗？</p>
          <p style={{ color: '#999', fontSize: 12 }}>
            确认后将自动添加跟踪记录，且无法恢复状态
          </p>
        </div>
      ),
      okText: '确认完成',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await dispatch(updateWaybillStatus({
            id: record.id,
            status: 'signed'
          }))
          await dispatch(addTrackingRecord({
            waybillId: record.id,
            record: {
              status: 'signed',
              statusLabel: '已签收',
              description: '货物已成功签收，跟踪完成',
              location: record.receiver?.city || '目的地',
              operator: user?.name
            }
          }))
          message.success('运单跟踪已完成')
          loadWaybills()
        } catch (error) {
          message.error('操作失败：' + error.message)
        }
      }
    })
  }

  const handleViewDetail = (record) => {
    navigate(`/tracking?id=${record.id}`)
  }

  const handleViewFullDetail = (record) => {
    setCurrentWaybill(record)
    setDetailModalVisible(true)
  }

  const handleReset = () => {
    setKeyword('')
    setStatusFilter('all')
    setTrackerFilter('all')
    setDateRange(null)
  }

  const handleBatchComplete = () => {
    const selectedForComplete = filteredWaybills.filter(w => w.status !== 'signed')
    if (selectedForComplete.length === 0) {
      message.warning('没有可完成的运单')
      return
    }

    confirm({
      title: '批量完成跟踪',
      icon: <CheckCircleOutlined />,
      content: `您确定要将 ${selectedForComplete.length} 个运单标记为已签收吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          for (const w of selectedForComplete) {
            await dispatch(updateWaybillStatus({ id: w.id, status: 'signed' }))
          }
          message.success(`已完成 ${selectedForComplete.length} 个运单`)
          loadWaybills()
        } catch (error) {
          message.error('批量操作失败')
        }
      }
    })
  }

  const validateDescription = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入跟踪描述'))
    }
    if (value.length < 5) {
      return Promise.reject(new Error('描述至少5个字符'))
    }
    if (value.length > 200) {
      return Promise.reject(new Error('描述不能超过200个字符'))
    }
    return Promise.resolve()
  }

  const validateLocation = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入所在位置'))
    }
    if (value.length < 2) {
      return Promise.reject(new Error('位置至少2个字符'))
    }
    if (value.length > 50) {
      return Promise.reject(new Error('位置不能超过50个字符'))
    }
    return Promise.resolve()
  }

  const trackers = useMemo(() => {
    if (!isAdmin) return []
    const trackerSet = new Set()
    waybills.forEach(w => {
      if (w.trackerId && w.trackerName) {
        trackerSet.add(JSON.stringify({ id: w.trackerId, name: w.trackerName }))
      }
    })
    return Array.from(trackerSet).map(JSON.parse)
  }, [waybills, isAdmin])

  const columns = [
    {
      title: '运单号',
      dataIndex: 'id',
      key: 'id',
      width: 130,
      fixed: 'left',
      render: (text) => <Text strong style={{ color: '#1890ff' }} copyable>{text}</Text>
    },
    {
      title: '货物名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => (
        <StatusTag status={status} label={record.statusLabel} />
      )
    },
    {
      title: '寄件人',
      dataIndex: ['sender', 'name'],
      key: 'senderName',
      width: 100
    },
    {
      title: '收件人',
      dataIndex: ['receiver', 'name'],
      key: 'receiverName',
      width: 100
    },
    {
      title: '当前位置',
      dataIndex: 'currentLocation',
      key: 'currentLocation',
      width: 150,
      ellipsis: true
    },
    isAdmin && {
      title: '跟单员',
      dataIndex: 'trackerName',
      key: 'trackerName',
      width: 100,
      render: (name) => (
        <Tag icon={<UserOutlined />} color="blue">{name || '未分配'}</Tag>
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 170
    },
    {
      title: '异常',
      dataIndex: 'hasException',
      key: 'hasException',
      width: 80,
      render: (has, record) => (
        has ? (
          <Tag color="red" icon={<WarningOutlined />}>异常</Tag>
        ) : (
          <Tag color="green" icon={<SafetyCertificateOutlined />}>正常</Tag>
        )
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status !== 'signed' && (
            <Tooltip title="编辑跟踪">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditTracking(record)}
              />
            </Tooltip>
          )}
          {record.status !== 'signed' && (
            <Tooltip title="完成跟踪">
              <Button
                type="link"
                size="small"
                danger
                icon={<CheckCircleOutlined />}
                onClick={() => handleCompleteTracking(record)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ].filter(Boolean)

  const renderStatsSection = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <StatCard
          title={isAdmin ? '全部运单' : '我的运单'}
          value={stats.total}
          icon={<InboxOutlined />}
          color="#1890ff"
          footer={
            <Text type="secondary" style={{ fontSize: 12 }}>
              <Tag color="orange">进行中 {stats.inProgress}</Tag>
            </Text>
          }
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <StatCard
          title="已完成"
          value={stats.signed}
          icon={<CheckSquareOutlined />}
          color="#52c41a"
          footer={
            <Text type="secondary" style={{ fontSize: 12 }}>
              完成率 <Text strong style={{ color: '#52c41a' }}>{stats.completionRate}%</Text>
            </Text>
          }
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <StatCard
          title="异常单"
          value={stats.exception}
          icon={<WarningOutlined />}
          color="#ff4d4f"
          footer={
            <Text type="secondary" style={{ fontSize: 12 }}>
              异常率 <Text strong style={{ color: '#ff4d4f' }}>{stats.exceptionRate}%</Text>
            </Text>
          }
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <StatCard
          title="异常处理"
          value={stats.exceptionHandled}
          icon={<ExclamationCircleOutlined />}
          color="#fa8c16"
          footer={
            <Text type="secondary" style={{ fontSize: 12 }}>
              处理率 <Text strong style={{ color: '#fa8c16' }}>
                {stats.exception > 0 ? Math.round((stats.exceptionHandled / stats.exception) * 100) : 0}%
              </Text>
            </Text>
          }
        />
      </Col>
    </Row>
  )

  return (
    <div>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {isAdmin ? '跟踪管理中心' : '我的跟踪任务'}
            </Title>
            <Text type="secondary">
              {isAdmin 
                ? '管理所有运单跟踪任务，查看跟单员工作进度' 
                : '管理您负责的运单，更新跟踪状态'
              }
            </Text>
          </div>
          {isAdmin && (
            <Space>
              <Button icon={<UserOutlined />}>
                <Tag color="blue">{user?.name}</Tag>
                <Tag color="purple">管理员</Tag>
              </Button>
            </Space>
          )}
        </div>

        {renderStatsSection()}

        <Card bordered={false}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="全部运单" key="all" />
            <TabPane tab={
              <span>
                进行中 <Tag color="orange">{stats.inProgress}</Tag>
              </span>
            } key="in_progress" />
            <TabPane tab={
              <span>
                已完成 <Tag color="green">{stats.signed}</Tag>
              </span>
            } key="completed" />
            <TabPane tab={
              <span>
                异常单 <Tag color="red">{stats.exception}</Tag>
              </span>
            } key="exception" />
          </Tabs>

          <div style={{ 
            marginBottom: 16, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <Space wrap>
              <Input
                placeholder="搜索运单号/货物/收发件人"
                allowClear
                style={{ width: 250 }}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                prefix={<SearchOutlined />}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 120 }}
              >
                {statusList.map(item => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
              {isAdmin && (
                <Select
                  value={trackerFilter}
                  onChange={setTrackerFilter}
                  style={{ width: 130 }}
                  placeholder="选择跟单员"
                >
                  <Option value="all">全部跟单员</Option>
                  {trackers.map(t => (
                    <Option key={t.id} value={t.id}>{t.name}</Option>
                  ))}
                </Select>
              )}
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: 240 }}
              />
              <Button icon={<FilterOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
            <Space>
              {isAdmin && (
                <Button icon={<ExportOutlined />}>
                  导出数据
                </Button>
              )}
              <Button 
                type="primary" 
                danger
                icon={<CheckCircleOutlined />} 
                onClick={handleBatchComplete}
                disabled={stats.inProgress === 0}
              >
                批量完成
              </Button>
              <Button type="primary" icon={<ReloadOutlined />} onClick={loadWaybills}>
                刷新
              </Button>
            </Space>
          </div>

          {operationError && (
            <Alert
              message="操作提示"
              description={operationError}
              type="error"
              showIcon
              closable
              onClose={() => setOperationError(null)}
              style={{ marginBottom: 16 }}
            />
          )}

          {waybillError && (
            <ErrorState
              title="数据加载失败"
              subTitle={waybillError}
              onRetry={loadWaybills}
              style={{ marginBottom: 16 }}
            />
          )}

          {loading ? (
            <Loading tip="加载数据中..." />
          ) : filteredWaybills.length === 0 ? (
            <EmptyState
              description="暂无运单数据"
              extra={
                <Button type="primary" onClick={loadWaybills}>
                  刷新数据
                </Button>
              }
            />
          ) : (
            <DataTable
              columns={columns}
              dataSource={filteredWaybills}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
              scroll={{ x: 1200 }}
            />
          )}
        </Card>

        <Card title={isAdmin ? '跟踪数据分析' : '个人跟踪统计'} bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card size="small" title="运单状态分布" bordered={false}>
                <ReactECharts
                  option={statusDistributionOption}
                  style={{ height: 250 }}
                  notMerge={true}
                />
              </Card>
            </Col>
            <Col xs={24} lg={16}>
              <Card size="small" title="本周运单趋势" bordered={false}>
                <ReactECharts
                  option={trendChartOption}
                  style={{ height: 250 }}
                  notMerge={true}
                />
              </Card>
            </Col>
          </Row>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" bordered={false} style={{ background: '#f6ffed' }}>
                <Statistic
                  title="跟踪完成率"
                  value={stats.completionRate}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<RiseOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" bordered={false} style={{ background: '#fff7e6' }}>
                <Statistic
                  title="平均处理时长"
                  value={2.3}
                  suffix="天"
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" bordered={false} style={{ background: '#e6f7ff' }}>
                <Statistic
                  title="异常处理数"
                  value={stats.exceptionHandled}
                  suffix="票"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" bordered={false} style={{ background: '#fff1f0' }}>
                <Statistic
                  title="待处理异常"
                  value={stats.exception - stats.exceptionHandled}
                  suffix="票"
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<FallOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      </Space>

      <Modal
        title="编辑跟踪记录"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setEditModalVisible(false)
          setCurrentWaybill(null)
          setOperationError(null)
          form.resetFields()
        }}
        okText="提交"
        cancelText="取消"
        confirmLoading={loading}
        width={520}
      >
        {currentWaybill && (
          <Alert
            message={`运单号: ${currentWaybill.id}`}
            description={`当前状态: ${currentWaybill.statusLabel} | 位置: ${currentWaybill.currentLocation}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {operationError && (
          <Alert
            message="操作失败"
            description={operationError}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="更新状态"
            rules={[{ required: true, message: '请选择状态' }]}
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
            rules={[{ validator: validateLocation }]}
          >
            <Input 
              placeholder="请输入当前所在位置" 
              prefix={<EnvironmentOutlined />}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="跟踪描述"
            rules={[{ validator: validateDescription }]}
            extra="5-200字符，描述当前运输情况"
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

      <Modal
        title="运单详细信息"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setCurrentWaybill(null)
        }}
        footer={null}
        width={600}
      >
        {currentWaybill && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="运单号" span={2}>
                <Text strong>{currentWaybill.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <StatusTag status={currentWaybill.status} label={currentWaybill.statusLabel} />
              </Descriptions.Item>
              <Descriptions.Item label="货物名称">
                {currentWaybill.goodsName}
              </Descriptions.Item>
              <Descriptions.Item label="货物类型">
                {currentWaybill.goodsType}
              </Descriptions.Item>
              <Descriptions.Item label="重量/体积">
                {currentWaybill.weight}kg / {currentWaybill.volume}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '8px 0' }} />

            <Card size="small" title="寄件信息" type="inner">
              <Space>
                <UserOutlined />
                <Text strong>{currentWaybill.sender?.name}</Text>
                <Text type="secondary">
                  <PhoneOutlined /> {currentWaybill.sender?.phone}
                </Text>
              </Space>
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                <EnvironmentOutlined /> {currentWaybill.sender?.address}
              </Paragraph>
            </Card>

            <Card size="small" title="收件信息" type="inner">
              <Space>
                <UserOutlined />
                <Text strong>{currentWaybill.receiver?.name}</Text>
                <Text type="secondary">
                  <PhoneOutlined /> {currentWaybill.receiver?.phone}
                </Text>
              </Space>
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                <EnvironmentOutlined /> {currentWaybill.receiver?.address}
              </Paragraph>
            </Card>

            {currentWaybill.hasException && (
              <Alert
                message="运单异常"
                description={currentWaybill.exceptionDesc || '该运单存在异常情况'}
                type="warning"
                showIcon
              />
            )}
          </Space>
        )}
      </Modal>
    </div>
  )
}

export default Management
