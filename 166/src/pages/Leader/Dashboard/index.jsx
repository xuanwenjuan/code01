import React from 'react'
import { Card, Statistic, Row, Col, Table, Progress, Tag } from 'antd'
import {
  ShoppingOutlined, UserOutlined, DollarOutlined,
  PackageOutlined, RiseOutlined
} from '@ant-design/icons'
import { orders } from '@/mock'
import './index.scss'

const LeaderDashboard = () => {
  const leaderOrders = orders.filter(o => o.communityId === 1)
  const totalSales = leaderOrders.reduce((sum, o) => sum + o.payAmount, 0)

  const stats = [
    { title: '总订单数', value: leaderOrders.length, icon: <ShoppingOutlined />, color: '#1890ff' },
    { title: '总用户数', value: 156, icon: <UserOutlined />, color: '#52c41a' },
    { title: '总销售额', value: `¥${totalSales.toFixed(1)}`, icon: <DollarOutlined />, color: '#faad14' },
    { title: '待处理', value: 8, icon: <PackageOutlined />, color: '#ff4d4f' }
  ]

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName'
    },
    {
      title: '商品',
      dataIndex: 'products',
      key: 'products',
      render: (products) => products.map(p => p.name).join(', ')
    },
    {
      title: '金额',
      dataIndex: 'payAmount',
      key: 'payAmount',
      render: (value) => <span className="price">¥{value.toFixed(1)}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { text: '待付款', color: 'orange' },
          shipping: { text: '待自提', color: 'blue' },
          completed: { text: '已完成', color: 'green' },
          cancelled: { text: '已取消', color: 'default' }
        }
        return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      }
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      key: 'createTime'
    }
  ]

  return (
    <div className="leader-dashboard">
      <h2 className="page-title">团长工作台</h2>

      <Row gutter={[16, 16]} className="stats-row">
        {stats.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card className="stat-card">
              <div className="stat-content">
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  {stat.icon}
                </div>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  className="stat-value"
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} md={12}>
          <Card title="销售趋势" className="chart-card">
            <div className="sales-chart">
              <div className="chart-item">
                <span>今日订单</span>
                <Progress percent={65} showInfo={false} strokeColor="#1890ff" />
                <strong>32</strong>
              </div>
              <div className="chart-item">
                <span>本周订单</span>
                <Progress percent={78} showInfo={false} strokeColor="#52c41a" />
                <strong>256</strong>
              </div>
              <div className="chart-item">
                <span>本月订单</span>
                <Progress percent={85} showInfo={false} strokeColor="#faad14" />
                <strong>1,234</strong>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="团长数据" className="chart-card">
            <div className="leader-stats">
              <div className="leader-stat-item">
                <div className="stat-label">自提点</div>
                <div className="stat-value">阳光社区店</div>
              </div>
              <div className="leader-stat-item">
                <div className="stat-label">团长等级</div>
                <div className="stat-value"><Tag color="gold">金牌团长</Tag></div>
              </div>
              <div className="leader-stat-item">
                <div className="stat-label">佣金比例</div>
                <div className="stat-value">10%</div>
              </div>
              <div className="leader-stat-item">
                <div className="stat-label">可提现金额</div>
                <div className="stat-value price">¥1,256.80</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="最近订单" className="orders-card">
        <Table
          dataSource={leaderOrders.slice(0, 5)}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  )
}

export default LeaderDashboard
