import { useMemo } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Spin } from 'antd';
import { UserOutlined, UserAddOutlined, CheckCircleOutlined, RiseOutlined, ThunderboltOutlined, TeamOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store';
import type { DepartmentType, DepartmentStat } from '@/types';

const deptColors: Record<DepartmentType, string> = {
  '技术研发': '#1890ff',
  '市场营销': '#52c41a',
  '职能管理': '#faad14',
  '产品运营': '#722ed1'
};

export function Dashboard() {
  const loading = useAppStore(state => state.loading);
  const selectors = useAppStore(state => state.selectors);
  const stats = useMemo(() => selectors.getStats(), [selectors]);

  const funnelOption = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; value: number; data: { percentage: number } }) => {
        return `${params.name}: ${params.value}人 (转化率: ${params.data.percentage}%)`;
      }
    },
    series: [
      {
        type: 'funnel',
        left: '10%',
        width: '80%',
        top: 60,
        bottom: 60,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}\n{c}人'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 16
          }
        },
        data: stats.funnelData.map(item => ({
          value: item.value,
          name: item.stage,
          percentage: item.percentage
        })),
        color: ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96']
      }
    ]
  }), [stats]);

  const barOption = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['简历投递', '面试人数', '录用人数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: stats.departmentStats.map(d => d.department),
      axisLabel: {
        interval: 0,
        rotate: 0
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '简历投递',
        type: 'bar',
        stack: 'total',
        data: stats.departmentStats.map(d => d.totalResumes),
        color: '#1890ff',
        emphasis: {
          focus: 'series'
        }
      },
      {
        name: '面试人数',
        type: 'bar',
        stack: 'total',
        data: stats.departmentStats.map(d => d.interviews),
        color: '#52c41a',
        emphasis: {
          focus: 'series'
        }
      },
      {
        name: '录用人数',
        type: 'bar',
        stack: 'total',
        data: stats.departmentStats.map(d => d.hired),
        color: '#faad14',
        emphasis: {
          focus: 'series'
        }
      }
    ]
  }), [stats]);

  const fillRateOption = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100
    },
    yAxis: {
      type: 'category',
      data: stats.departmentStats.map(d => d.department)
    },
    series: [
      {
        name: '面试通过率',
        type: 'bar',
        data: stats.departmentStats.map(d => d.passRate),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%'
        },
        itemStyle: {
          color: (params: { dataIndex: number }) => {
            const colors = ['#1890ff', '#52c41a', '#faad14', '#722ed1'];
            return colors[params.dataIndex];
          }
        }
      }
    ]
  }), [stats]);

  const deptTableColumns = useMemo(() => [
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      render: (dept: DepartmentType) => (
        <Tag color={deptColors[dept]} style={{ margin: 0 }}>{dept}</Tag>
      )
    },
    {
      title: '简历投递',
      dataIndex: 'totalResumes',
      key: 'totalResumes',
      sorter: (a: DepartmentStat, b: DepartmentStat) => a.totalResumes - b.totalResumes,
      sortDirections: ['descend', 'ascend'] as const
    },
    {
      title: '面试人数',
      dataIndex: 'interviews',
      key: 'interviews',
      sorter: (a: DepartmentStat, b: DepartmentStat) => a.interviews - b.interviews
    },
    {
      title: '录用人数',
      dataIndex: 'hired',
      key: 'hired',
      sorter: (a: DepartmentStat, b: DepartmentStat) => a.hired - b.hired
    },
    {
      title: '面试通过率',
      key: 'passRate',
      render: (_: unknown, record: DepartmentStat) => (
        <Progress
          percent={record.passRate}
          size="small"
          strokeColor={record.passRate >= 50 ? '#52c41a' : '#faad14'}
          format={p => `${p}%`}
        />
      )
    }
  ], []);

  return (
    <Spin spinning={loading} tip="加载中...">
      <div>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="总职位数"
                value={stats.totalPositions}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
                suffix={`/ 招聘中 ${stats.activePositions}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="总简历数"
                value={stats.totalResumes}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="面试人数"
                value={stats.totalInterviews}
                prefix={<UserAddOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="已录用"
                value={stats.totalHired}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="面试通过率"
                value={stats.interviewPassRate}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="职位填充率"
                value={stats.fillRate}
                suffix="%"
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="招聘漏斗图" extra="简历从投递到录用的转化过程">
              <ReactECharts option={funnelOption} style={{ height: 350 }} notMerge lazyUpdate />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="各部门招聘数据对比" extra="各部门简历、面试、录用人数">
              <ReactECharts option={barOption} style={{ height: 350 }} notMerge lazyUpdate />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="各部门面试通过率">
              <ReactECharts option={fillRateOption} style={{ height: 300 }} notMerge lazyUpdate />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="招聘效率指标">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" type="inner" title="平均每职位简历数">
                    <Statistic
                      value={stats.totalPositions > 0 ? Math.round(stats.totalResumes / stats.totalPositions) : 0}
                      suffix="份"
                      valueStyle={{ fontSize: 24 }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" type="inner" title="平均每职位录用数">
                    <Statistic
                      value={stats.totalPositions > 0 ? (stats.totalHired / stats.totalPositions).toFixed(1) : 0}
                      suffix="人"
                      valueStyle={{ fontSize: 24 }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" type="inner" title="活跃职位占比">
                    <Statistic
                      value={stats.totalPositions > 0 ? Math.round((stats.activePositions / stats.totalPositions) * 100) : 0}
                      suffix="%"
                      valueStyle={{ fontSize: 24, color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" type="inner" title="录用率">
                    <Statistic
                      value={stats.totalResumes > 0 ? Math.round((stats.totalHired / stats.totalResumes) * 100) : 0}
                      suffix="%"
                      valueStyle={{ fontSize: 24, color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Card title="部门招聘详情">
          <Table
            dataSource={stats.departmentStats}
            columns={deptTableColumns}
            rowKey="department"
            pagination={false}
            size="middle"
          />
        </Card>
      </div>
    </Spin>
  );
}
