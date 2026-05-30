import React, { useState, useEffect, useMemo } from 'react'
import { Row, Col, Card, Table, Button, Tag, Select, Input, Typography, Space, Alert } from 'antd'
import {
  InboxOutlined,
  TruckOutlined,
  SwapOutlined,
  SendOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import {
  fetchWaybills,
  selectFilteredWaybills,
  selectWaybillLoading,
  selectWaybillList
} from '@/store/slices/waybillSlice'
import { StatCard, StatusTag, DataTable, Loading } from '@/components'
import { statusList } from '@/mock/waybills'

const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input

const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const waybills = useSelector(selectWaybillList)
  const filteredWaybills = useSelector(selectFilteredWaybills)
  const loading = useSelector(selectWaybillLoading)

  const [statusFilter, setStatusFilter] = useState('all')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    dispatch(fetchWaybills())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchWaybills({ status: statusFilter, keyword }))
  }, [dispatch, statusFilter, keyword])

  const stats = useMemo(() => {
    const counts = {
      pending: 0,
      in_transit: 0,
      transfer: 0,
      delivery: 0,
      signed: 0
    }
    let exceptionCount = 0

    waybills.forEach(w => {
      if (counts[w.status] !== undefined) {
        counts[w.status]++
      }
      if (w.hasException) {
        exceptionCount++
      }
    })

    return {
      ...counts,
      total: waybills.length,
      exception: exceptionCount
    }
  }, [waybills])

  const exceptionWaybills = useMemo(() => {
    return waybills.filter(w => w.hasException).slice(0, 5)
  }, [waybills])

  const recentWaybills = useMemo(() => {
    return [...filteredWaybills]
      .sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
      .slice(0, 10)
  }, [filteredWaybills])

  const statusChartOption = useMemo(() => ({
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
        name: '货物状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
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
        data: [
          { value: stats.pending, name: '待揽收', itemStyle: { color: '#8c8c8c' } },
          { value: stats.in_transit, name: '在途', itemStyle: { color: '#1890ff' } },
          { value: stats.transfer, name: '中转', itemStyle: { color: '#13c2c2' } },
          { value: stats.delivery, name: '派件中', itemStyle: { color: '#fa8c16' } },
          { value: stats.signed, name: '已签收', itemStyle: { color: '#52c41a' } }
        ]
      }
    ]
  }), [stats])

  const trendChartOption = useMemo(() => {
    const days = []
    const date = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(date)
      d.setDate(d.getDate() - i)
      days.push(d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))
    }

    return {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['新增运单', '完成运单']
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
        data: days
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '新增运单',
          type: 'line',
          smooth: true,
          data: [12, 19, 15, 22, 18, 25, 20],
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
              ]
            }
          },
          lineStyle: {
            color: '#1890ff',
            width: 2
          },
          itemStyle: {
            color: '#1890ff'
          }
        },
        {
          name: '完成运单',
          type: 'line',
          smooth: true,
          data: [8, 14, 12, 18, 15, 20, 16],
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
                { offset: 1, color: 'rgba(82, 196, 26, 0.05)' }
              ]
            }
          },
          lineStyle: {
            color: '#52c41a',
            width: 2
          },
          itemStyle: {
            color: '#52c41a'
          }
        }
      ]
    }
  }, [])

  const waybillColumns = [
    {
      title: '运单号',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>
    },
    {
      title: '货物名称',
      dataIndex: 'goodsName',
      key: 'goodsName'
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
      title: '发件人',
      dataIndex: ['sender', 'name'],
      key: 'senderName'
    },
    {
      title: '收件人',
      dataIndex: ['receiver', 'name'],
      key: 'receiverName'
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 170
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/tracking?id=${record.id}`)}
        >
          查看详情
        </Button>
      )
    }
  ]

  const handleReset = () => {
    setStatusFilter('all')
    setKeyword('')
  }

  return (
    <div>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>平台首页</Title>
          <Text type="secondary">货物状态概览与今日跟踪任务</Text>
        </div>

        {exceptionWaybills.length > 0 && (
          <Alert
            message="异常货物提醒"
            description={`当前有 ${exceptionWaybills.length} 票货物存在异常情况，请及时处理！`}
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            action={
              <Button size="small" type="primary" onClick={() => navigate('/tracking')}>
                查看详情
              </Button>
            }
            closable
          />
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <StatCard
              title="全部运单"
              value={stats.total}
              icon={<InboxOutlined />}
              color="#1890ff"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <StatCard
              title="待揽收"
              value={stats.pending}
              icon={<InboxOutlined />}
              color="#8c8c8c"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <StatCard
              title="在途"
              value={stats.in_transit}
              icon={<TruckOutlined />}
              color="#1890ff"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <StatCard
              title="中转中"
              value={stats.transfer}
              icon={<SwapOutlined />}
              color="#13c2c2"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <StatCard
              title="派件中"
              value={stats.delivery}
              icon={<SendOutlined />}
              color="#fa8c16"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <StatCard
              title="已签收"
              value={stats.signed}
              icon={<CheckCircleOutlined />}
              color="#52c41a"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={10}>
            <Card title="货物状态分布" bordered={false}>
              <ReactECharts
                option={statusChartOption}
                style={{ height: 300 }}
                notMerge={true}
                lazyUpdate={true}
              />
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card title="近7日运单趋势" bordered={false}>
              <ReactECharts
                option={trendChartOption}
                style={{ height: 300 }}
                notMerge={true}
                lazyUpdate={true}
              />
            </Card>
          </Col>
        </Row>

        {exceptionWaybills.length > 0 && (
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#faad14' }} />
                <span>异常货物提醒</span>
                <Tag color="red">{exceptionWaybills.length} 票</Tag>
              </Space>
            }
            bordered={false}
          >
            <Table
              dataSource={exceptionWaybills}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: '运单号',
                  dataIndex: 'id',
                  key: 'id',
                  render: (text) => <Text strong>{text}</Text>
                },
                {
                  title: '货物名称',
                  dataIndex: 'goodsName',
                  key: 'goodsName'
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status, record) => (
                    <StatusTag status={status} label={record.statusLabel} />
                  )
                },
                {
                  title: '异常描述',
                  dataIndex: 'exceptionDesc',
                  key: 'exceptionDesc',
                  render: (text) => <Text type="danger">{text}</Text>
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <Button
                      type="link"
                      size="small"
                      danger
                      onClick={() => navigate(`/tracking?id=${record.id}`)}
                    >
                      处理
                    </Button>
                  )
                }
              ]}
            />
          </Card>
        )}

        <Card
          title="最新运单动态"
          bordered={false}
          extra={
            <Space>
              <Search
                placeholder="搜索运单号/收发件人"
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
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          }
        >
          {loading ? (
            <Loading tip="加载数据中..." />
          ) : (
            <DataTable
              columns={waybillColumns}
              dataSource={recentWaybills}
              pagination={false}
              scroll={{ x: 800 }}
            />
          )}
        </Card>
      </Space>
    </div>
  )
}

export default Dashboard
