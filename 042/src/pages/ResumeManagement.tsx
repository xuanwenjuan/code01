import { useState, useMemo, useCallback } from 'react';
import { Card, Table, Button, Tag, Space, Popconfirm, message, Badge, Row, Col, Statistic, Tooltip, Avatar, Empty, Alert, Spin } from 'antd';
import { EyeOutlined, ScheduleOutlined, UserOutlined, UserAddOutlined, TrophyOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import type { Resume, ResumeStatusType, GenderType } from '@/types';
import { ResumeDetailModal } from '@/components/ResumeDetailModal';
import { InterviewModal } from '@/components/InterviewModal';
import { FilterPanel } from '@/components/FilterPanel';

const statusColors: Record<ResumeStatusType, string> = {
  '初筛': 'blue',
  '面试中': 'gold',
  '已录用': 'green',
  '已淘汰': 'red'
};

const avatarColors: Record<GenderType, string> = {
  '男': '#1890ff',
  '女': '#eb2f96'
};

export function ResumeManagement() {
  const jobs = useAppStore(state => state.jobs);
  const selectors = useAppStore(state => state.selectors);
  const updateResumeStatus = useAppStore(state => state.updateResumeStatus);
  const updateResume = useAppStore(state => state.updateResume);
  const loading = useAppStore(state => state.loading);
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  const filteredResumes = useMemo(() => selectors.getFilteredResumes(), [selectors]);
  const warningResumes = useMemo(() => selectors.getWarningResumes(), [selectors]);
  const warningCount = useMemo(() => warningResumes.length, [warningResumes]);

  const isWarningResume = useCallback((resume: Resume): boolean => {
    return warningResumes.some(w => w.id === resume.id);
  }, [warningResumes]);

  const handleViewDetail = useCallback((resume: Resume) => {
    setSelectedResume(resume);
    setDetailOpen(true);
  }, []);

  const handleArrangeInterview = useCallback((resume: Resume) => {
    setSelectedResume(resume);
    setInterviewOpen(true);
  }, []);

  const handleReject = useCallback((id: string) => {
    updateResumeStatus(id, '已淘汰');
    message.success('简历已标记为已淘汰');
  }, [updateResumeStatus]);

  const handleMarkHighPotential = useCallback((resume: Resume) => {
    updateResume(resume.id, { isHighPotential: !resume.isHighPotential });
    message.success(resume.isHighPotential ? '已取消高意向标记' : '已标记为高意向候选人');
  }, [updateResume]);

  const getJobName = useCallback((jobId: string): string => {
    const job = jobs.find(j => j.id === jobId);
    return job?.name || '-';
  }, [jobs]);

  const getFollowUpStatus = useCallback((resume: Resume) => {
    const days = dayjs().diff(dayjs(resume.lastFollowUpDate), 'day');
    if (days <= 3) return { text: '正常', color: 'green' as const };
    if (days <= 7) return { text: '待跟进', color: 'gold' as const };
    return { text: `${days}天未跟进`, color: 'red' as const };
  }, []);

  const statistics = useMemo(() => {
    const statusCounts = {
      '初筛': 0,
      '面试中': 0,
      '已录用': 0,
      '已淘汰': 0
    } as Record<ResumeStatusType, number>;

    let highPotentialCount = 0;

    filteredResumes.forEach(resume => {
      statusCounts[resume.status]++;
      if (resume.isHighPotential) highPotentialCount++;
    });

    return {
      total: filteredResumes.length,
      ...statusCounts,
      highPotential: highPotentialCount
    };
  }, [filteredResumes]);

  const columns = useMemo((): ColumnsType<Resume> => [
    {
      title: '候选人',
      dataIndex: 'name',
      key: 'name',
      width: 140,
      fixed: 'left' as const,
      render: (name: string, record: Resume) => (
        <Space>
          <Avatar 
            style={{ backgroundColor: avatarColors[record.gender] }}
            icon={<UserOutlined />}
            size="small"
          />
          <span style={{ 
            color: isWarningResume(record) ? '#ff4d4f' : undefined,
            fontWeight: isWarningResume(record) ? 600 : undefined
          }}>
            {name}
            {isWarningResume(record) && (
              <Badge dot offset={[4, 0]} style={{ backgroundColor: '#ff4d4f' }} />
            )}
          </span>
        </Space>
      )
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 70,
      align: 'center' as const
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 70,
      align: 'center' as const,
      sorter: (a, b) => a.age - b.age
    },
    {
      title: '学历',
      dataIndex: 'education',
      key: 'education',
      width: 90,
      filters: [
        { text: '博士', value: '博士' },
        { text: '硕士', value: '硕士' },
        { text: '本科', value: '本科' },
        { text: '大专', value: '大专' },
        { text: '高中及以下', value: '高中及以下' }
      ],
      onFilter: (value, record) => record.education === value
    },
    {
      title: '学校',
      dataIndex: 'school',
      key: 'school',
      width: 140,
      ellipsis: true
    },
    {
      title: '工作经验',
      dataIndex: 'experience',
      key: 'experience',
      width: 110,
      filters: [
        { text: '应届毕业生', value: '应届毕业生' },
        { text: '1-3年', value: '1-3年' },
        { text: '3-5年', value: '3-5年' },
        { text: '5-10年', value: '5-10年' },
        { text: '10年以上', value: '10年以上' }
      ],
      onFilter: (value, record) => record.experience === value
    },
    {
      title: '应聘职位',
      key: 'jobName',
      width: 150,
      ellipsis: true,
      render: (_: unknown, record: Resume) => (
        <Tooltip title={getJobName(record.jobId)}>
          <Tag color="blue">{getJobName(record.jobId)}</Tag>
        </Tooltip>
      )
    },
    {
      title: '面试轮次',
      key: 'interviewCount',
      width: 90,
      align: 'center' as const,
      render: (_: unknown, record: Resume) => (
        <Badge count={record.interviews.length} style={{ backgroundColor: '#1890ff' }}>
          <Tag color="default">面试</Tag>
        </Badge>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '初筛', value: '初筛' },
        { text: '面试中', value: '面试中' },
        { text: '已录用', value: '已录用' },
        { text: '已淘汰', value: '已淘汰' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: ResumeStatusType) => (
        <Tag color={statusColors[status]}>{status}</Tag>
      )
    },
    {
      title: '高意向',
      dataIndex: 'isHighPotential',
      key: 'isHighPotential',
      width: 90,
      align: 'center' as const,
      filters: [
        { text: '是', value: true },
        { text: '否', value: false }
      ],
      onFilter: (value, record) => record.isHighPotential === value,
      render: (isHigh: boolean) => (
        isHigh 
          ? <Tag icon={<TrophyOutlined />} color="red">是</Tag> 
          : <Tag>否</Tag>
      )
    },
    {
      title: '跟进状态',
      key: 'followUp',
      width: 110,
      render: (_: unknown, record: Resume) => {
        const status = getFollowUpStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: Resume) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status !== '已录用' && record.status !== '已淘汰' && (
            <Button
              type="link"
              size="small"
              icon={<ScheduleOutlined />}
              onClick={() => handleArrangeInterview(record)}
            >
              面试
            </Button>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => handleMarkHighPotential(record)}
            style={{ color: record.isHighPotential ? '#ff4d4f' : undefined }}
          >
            {record.isHighPotential ? '取消标记' : '标记高意向'}
          </Button>
          {record.status !== '已录用' && record.status !== '已淘汰' && (
            <Popconfirm
              title="确认淘汰该候选人？"
              onConfirm={() => handleReject(record.id)}
              okText="确认"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button type="link" size="small" danger>
                淘汰
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ], [isWarningResume, getJobName, getFollowUpStatus, handleViewDetail, handleArrangeInterview, handleMarkHighPotential, handleReject]);

  const handleOpenDetailFromInterview = useCallback(() => {
    setDetailOpen(false);
    setInterviewOpen(true);
  }, []);

  return (
    <Spin spinning={loading} tip="加载中...">
      <div>
        <Card
          title={
            <Space>
              <span>简历管理</span>
              {warningCount > 0 && (
                <Tooltip title={`有 ${warningCount} 位高意向候选人超过 7 天未跟进`}>
                  <Badge count={warningCount} overflowCount={99} style={{ backgroundColor: '#ff4d4f' }}>
                    <Tag icon={<WarningOutlined />} color="red">
                      高意向待跟进
                    </Tag>
                  </Badge>
                </Tooltip>
              )}
            </Space>
          }
        >
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card size="small" type="inner" hoverable>
                <Statistic
                  title="总简历数"
                  value={statistics.total}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card size="small" type="inner" hoverable>
                <Statistic
                  title="初筛中"
                  value={statistics.初筛}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card size="small" type="inner" hoverable>
                <Statistic
                  title="面试中"
                  value={statistics.面试中}
                  prefix={<UserAddOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card size="small" type="inner" hoverable>
                <Statistic
                  title="已录用"
                  value={statistics.已录用}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card size="small" type="inner" hoverable>
                <Statistic
                  title="已淘汰"
                  value={statistics.已淘汰}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card size="small" type="inner" hoverable>
                <Statistic
                  title="高意向候选人"
                  value={statistics.highPotential}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#eb2f96' }}
                />
              </Card>
            </Col>
          </Row>

          {warningCount > 0 && (
            <Alert
              message="跟进提醒"
              description={`有 ${warningCount} 位高意向候选人超过 7 天未跟进，请及时跟进！`}
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              closable
              style={{ marginBottom: 16 }}
            />
          )}

          <FilterPanel mode="resume" />
          
          <Table
            dataSource={filteredResumes}
            columns={columns}
            rowKey="id"
            scroll={{ x: 1500 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            size="middle"
            rowClassName={(record) => isWarningResume(record) ? 'warning-row' : ''}
            locale={{
              emptyText: <Empty description="暂无简历数据" />
            }}
          />
        </Card>

        <ResumeDetailModal
          open={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setSelectedResume(null);
          }}
          resume={selectedResume}
          onArrangeInterview={selectedResume ? handleOpenDetailFromInterview : undefined}
        />

        <InterviewModal
          open={interviewOpen}
          onClose={() => {
            setInterviewOpen(false);
            setSelectedResume(null);
          }}
          resume={selectedResume}
        />
      </div>
    </Spin>
  );
}
