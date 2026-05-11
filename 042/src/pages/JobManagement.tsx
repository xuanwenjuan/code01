import { useState, useMemo, useCallback } from 'react';
import { Card, Table, Button, Tag, Space, Popconfirm, message, Progress, Row, Col, Statistic, Tooltip, Spin, Empty, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, TeamOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppStore } from '@/store';
import type { JobPosition, DepartmentType, JobStatusType } from '@/types';
import { JobModal } from '@/components/JobModal';
import { FilterPanel } from '@/components/FilterPanel';

const deptColors: Record<DepartmentType, string> = {
  '技术研发': 'blue',
  '市场营销': 'green',
  '职能管理': 'gold',
  '产品运营': 'purple'
};

const statusColors: Record<JobStatusType, string> = {
  '招聘中': 'processing',
  '已暂停': 'warning',
  '已关闭': 'default'
};

export function JobManagement() {
  const jobs = useAppStore(state => state.jobs);
  const selectors = useAppStore(state => state.selectors);
  const deleteJob = useAppStore(state => state.deleteJob);
  const resetAllData = useAppStore(state => state.resetAllData);
  const loading = useAppStore(state => state.loading);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editJob, setEditJob] = useState<JobPosition | null>(null);
  const [detailJob, setDetailJob] = useState<JobPosition | null>(null);

  const filteredJobs = useMemo(() => selectors.getFilteredJobs(), [selectors]);
  
  const totalFillRate = useMemo(() => selectors.getTotalFillRate(), [selectors]);

  const handleAdd = useCallback(() => {
    setEditJob(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((job: JobPosition) => {
    setEditJob(job);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    const jobResumes = selectors.getResumesByJobId(id);
    if (jobResumes.length > 0) {
      message.warning(`该职位下有 ${jobResumes.length} 份简历，请先处理后再删除`);
      return;
    }
    deleteJob(id);
    message.success('职位已删除');
  }, [selectors, deleteJob]);

  const handleResetData = useCallback(() => {
    Modal.confirm({
      title: '确认重置所有数据？',
      content: '此操作将重置所有职位和简历数据为初始状态，且不可恢复！',
      okText: '确认重置',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        resetAllData();
        message.success('数据已重置');
      }
    });
  }, [resetAllData]);

  const overallStats = useMemo(() => {
    const activeJobs = jobs.filter(j => j.status !== '已关闭');
    const totalQuota = activeJobs.reduce((sum, j) => sum + j.quota, 0);
    const totalHired = activeJobs.reduce((sum, j) => sum + j.hiredCount, 0);
    return {
      total: jobs.length,
      active: activeJobs.length,
      totalQuota,
      totalHired,
      fillRate: totalFillRate
    };
  }, [jobs, totalFillRate]);

  const columns = useMemo((): ColumnsType<JobPosition> => [
    {
      title: '职位名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      fixed: 'left' as const,
      ellipsis: true
    },
    {
      title: '所属部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      filters: [
        { text: '技术研发', value: '技术研发' },
        { text: '市场营销', value: '市场营销' },
        { text: '职能管理', value: '职能管理' },
        { text: '产品运营', value: '产品运营' }
      ],
      onFilter: (value, record) => record.department === value,
      render: (dept: DepartmentType) => <Tag color={deptColors[dept]}>{dept}</Tag>
    },
    {
      title: '薪资范围',
      dataIndex: 'salaryRange',
      key: 'salaryRange',
      width: 120,
      sorter: (a, b) => {
        const aMin = parseInt(a.salaryRange.split('-')[0]) || 0;
        const bMin = parseInt(b.salaryRange.split('-')[0]) || 0;
        return aMin - bMin;
      }
    },
    {
      title: '简历投递',
      key: 'resumeCount',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: JobPosition) => {
        const count = selectors.getResumesByJobId(record.id).length;
        return (
          <Tooltip title={`共 ${count} 份简历`}>
            <Tag color="blue">{count}</Tag>
          </Tooltip>
        );
      }
    },
    {
      title: '招聘名额',
      key: 'quotaInfo',
      width: 140,
      align: 'center' as const,
      render: (_: unknown, record: JobPosition) => (
        <span>
          <Tag color="blue">已录 {record.hiredCount}</Tag>
          <Tag color="default">配额 {record.quota}</Tag>
        </span>
      )
    },
    {
      title: '填充率',
      key: 'fillRate',
      width: 180,
      render: (_: unknown, record: JobPosition) => {
        const progress = selectors.getJobFillRate(record);
        const isFull = progress >= 100;
        return (
          <Tooltip title={`已录用 ${record.hiredCount} 人，配额 ${record.quota} 人`}>
            <Progress
              percent={progress}
              size="small"
              strokeColor={isFull ? '#52c41a' : progress >= 50 ? '#faad14' : '#1890ff'}
              format={() => `${progress}%`}
            />
          </Tooltip>
        );
      }
    },
    {
      title: '招聘状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '招聘中', value: '招聘中' },
        { text: '已暂停', value: '已暂停' },
        { text: '已关闭', value: '已关闭' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: JobStatusType) => <Tag color={statusColors[status]}>{status}</Tag>
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt)
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: JobPosition) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setDetailJob(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除该职位？"
            description="删除后无法恢复，请确认是否继续"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ], [selectors, handleEdit, handleDelete]);

  return (
    <Spin spinning={loading} tip="加载中...">
      <div>
        <Card
          title="职位管理"
          extra={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleResetData}>
                重置数据
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增职位
              </Button>
            </Space>
          }
        >
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={6}>
              <Card size="small" type="inner" hoverable>
                <Statistic
                  title="总职位数"
                  value={overallStats.total}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card size="small" type="inner" hoverable>
                <Statistic
                  title="招聘中"
                  value={overallStats.active}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card size="small" type="inner" hoverable>
                <Statistic
                  title="招聘配额"
                  value={overallStats.totalQuota}
                  suffix="人"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card size="small" type="inner" hoverable>
                <Statistic
                  title="整体填充率"
                  value={overallStats.fillRate}
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <FilterPanel mode="job" />
          
          <Table
            dataSource={filteredJobs}
            columns={columns}
            rowKey="id"
            scroll={{ x: 1300 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSizeOptions: ['10', '20', '50']
            }}
            size="middle"
            locale={{
              emptyText: <Empty description="暂无职位数据" />
            }}
          />
        </Card>

        <JobModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          editJob={editJob}
        />

        {detailJob && (
          <Card
            title={`职位详情 - ${detailJob.name}`}
            style={{ marginTop: 24 }}
            extra={
              <Space>
                <Button onClick={() => handleEdit(detailJob)}>
                  编辑
                </Button>
                <Button onClick={() => setDetailJob(null)}>
                  关闭
                </Button>
              </Space>
            }
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" type="inner" title="所属部门">
                  <Tag color={deptColors[detailJob.department]}>{detailJob.department}</Tag>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" type="inner" title="薪资范围">
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
                    {detailJob.salaryRange}
                  </span>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" type="inner" title="招聘状态">
                  <Tag color={statusColors[detailJob.status]}>{detailJob.status}</Tag>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" type="inner" title="简历投递">
                  <Tag color="blue">{selectors.getResumesByJobId(detailJob.id).length} 份</Tag>
                </Card>
              </Col>
            </Row>

            <Row gutter={[24, 16]} style={{ marginTop: 16 }}>
              <Col xs={24}>
                <Card size="small" type="inner" title="招聘进度">
                  <Progress
                    percent={selectors.getJobFillRate(detailJob)}
                    format={() => `已录用 ${detailJob.hiredCount} 人 / 配额 ${detailJob.quota} 人`}
                    strokeColor={detailJob.hiredCount >= detailJob.quota ? '#52c41a' : '#1890ff'}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[24, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Card size="small" type="inner" title="职位描述">
                  <p style={{ lineHeight: 1.8, margin: 0 }}>
                    {detailJob.description || '暂无描述'}
                  </p>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" type="inner" title="任职要求">
                  <p style={{ lineHeight: 1.8, margin: 0 }}>
                    {detailJob.requirements || '暂无要求'}
                  </p>
                </Card>
              </Col>
            </Row>
          </Card>
        )}
      </div>
    </Spin>
  );
}
