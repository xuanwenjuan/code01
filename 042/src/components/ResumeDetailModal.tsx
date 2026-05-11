import { Modal, Descriptions, Tag, Select, Button, Table, Card, Space, message, Form, Input, Rate, InputNumber, Row, Col, Tooltip, Divider, Badge } from 'antd';
import { MailOutlined, PhoneOutlined, CalendarOutlined, TrophyOutlined, EyeOutlined, ScheduleOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import type { Resume, InterviewRecord, ResumeStatusType, InterviewResultType } from '@/types';
import { useAppStore } from '@/store';

const { Option } = Select;
const { TextArea } = Input;

interface ResumeDetailModalProps {
  open: boolean;
  onClose: () => void;
  resume: Resume | null;
  onArrangeInterview?: () => void;
}

const statusConfig: Record<ResumeStatusType, { color: string; icon: React.ReactNode; label: string }> = {
  '初筛': { color: 'blue', icon: <ClockCircleOutlined />, label: '初筛阶段' },
  '面试中': { color: 'gold', icon: <ScheduleOutlined />, label: '面试中' },
  '已录用': { color: 'green', icon: <CheckCircleOutlined />, label: '已录用' },
  '已淘汰': { color: 'red', icon: <CloseCircleOutlined />, label: '已淘汰' }
};

export function ResumeDetailModal({ open, onClose, resume, onArrangeInterview }: ResumeDetailModalProps) {
  const updateResumeStatus = useAppStore(state => state.updateResumeStatus);
  const submitInterviewEvaluation = useAppStore(state => state.submitInterviewEvaluation);
  const jobs = useAppStore(state => state.jobs);
  const [editMode, setEditMode] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const job = useMemo(() => {
    return resume ? jobs.find(j => j.id === resume.jobId) : null;
  }, [resume, jobs]);

  const isWarning = resume && resume.isHighPotential && (resume.status === '初筛' || resume.status === '面试中');
  const daysSinceFollowUp = resume ? dayjs().diff(dayjs(resume.lastFollowUpDate), 'day') : 0;

  useEffect(() => {
    if (open) {
      setEditMode(false);
      setSelectedInterviewId(null);
      form.resetFields();
    }
  }, [open, form]);

  const handleStatusChange = (status: ResumeStatusType) => {
    if (resume) {
      updateResumeStatus(resume.id, status);
      message.success(`状态已更新为：${status}`);
    }
  };

  const handleQuickAction = (action: 'interview' | 'hire' | 'reject') => {
    if (!resume) return;
    switch (action) {
      case 'interview':
        onArrangeInterview?.();
        break;
      case 'hire':
        updateResumeStatus(resume.id, '已录用');
        message.success('已标记为已录用');
        break;
      case 'reject':
        updateResumeStatus(resume.id, '已淘汰');
        message.success('已标记为已淘汰');
        break;
    }
  };

  const handleAddEvaluation = async () => {
    try {
      const values = await form.validateFields();
      if (resume && selectedInterviewId) {
        submitInterviewEvaluation(
          resume.id, 
          selectedInterviewId, 
          values.score,
          values.result,
          values.comment
        );
        message.success('评价提交成功');
        setEditMode(false);
        setSelectedInterviewId(null);
        form.resetFields();
      }
    } catch {
      message.error('请填写完整评价信息');
    }
  };

  const interviewColumns = [
    {
      title: '轮次',
      dataIndex: 'round',
      key: 'round',
      width: 80,
      align: 'center' as const
    },
    {
      title: '面试官',
      dataIndex: 'interviewer',
      key: 'interviewer'
    },
    {
      title: '面试时间',
      dataIndex: 'interviewTime',
      key: 'interviewTime'
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      width: 120,
      render: (score: number | undefined) => {
        if (score === undefined) return <Tag color="default">未评分</Tag>;
        return (
          <Space>
            <Rate disabled value={score / 20} />
            <span>{score}分</span>
          </Space>
        );
      }
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result: InterviewResultType | undefined) => {
        if (!result) return <Tag color="default">待评价</Tag>;
        return (
          <Tag color={
            result === '通过' ? 'green' : 
            result === '未通过' ? 'red' : 'gold'
          }>
            {result}
          </Tag>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: InterviewRecord) => (
        !record.result ? (
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedInterviewId(record.id);
              setEditMode(true);
              form.setFieldsValue({
                score: 80,
                result: '待定' as InterviewResultType
              });
            }}
          >
            评价
          </Button>
        ) : (
          <Tag color="green">已评价</Tag>
        )
      )
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <span>{resume?.name} 的详细信息</span>
          {isWarning && (
            <Badge status="error" text={
              <Tag icon={<TrophyOutlined />} color="red">
                高意向，{daysSinceFollowUp}天未跟进！
              </Tag>
            } />
          )}
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={1000}
      style={{ top: 20 }}
      footer={[
        <Button key="close" onClick={onClose}>关闭</Button>,
        resume && resume.status !== '已淘汰' && resume.status !== '已录用' && (
          <Space key="actions">
            <Button key="reject" danger onClick={() => handleQuickAction('reject')}>
              <CloseCircleOutlined /> 淘汰
            </Button>
            <Button key="hire" type="primary" onClick={() => handleQuickAction('hire')}>
              <CheckCircleOutlined /> 录用
            </Button>
            {onArrangeInterview && (
              <Button key="interview" type="primary" onClick={onArrangeInterview}>
                <ScheduleOutlined /> 安排面试
              </Button>
            )}
          </Space>
        )
      ]}
    >
      {resume && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Card 
                size="small"
                title="基本信息"
                extra={
                  <Space>
                    <span>当前状态：</span>
                    <Select
                      value={resume.status}
                      onChange={handleStatusChange}
                      style={{ width: 120 }}
                    >
                      <Option value="初筛">初筛</Option>
                      <Option value="面试中">面试中</Option>
                      <Option value="已录用">已录用</Option>
                      <Option value="已淘汰">已淘汰</Option>
                    </Select>
                  </Space>
                }
              >
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="姓名">{resume.name}</Descriptions.Item>
                  <Descriptions.Item label="性别">{resume.gender}</Descriptions.Item>
                  <Descriptions.Item label="年龄">{resume.age}岁</Descriptions.Item>
                  <Descriptions.Item label="学历">{resume.education}</Descriptions.Item>
                  <Descriptions.Item label="学校">{resume.school}</Descriptions.Item>
                  <Descriptions.Item label="专业">{resume.major}</Descriptions.Item>
                  <Descriptions.Item label="工作经验">{resume.experience}</Descriptions.Item>
                  <Descriptions.Item label="应聘职位">
                    <Tag color="blue">{job?.name || '-'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="联系电话" span={2}>
                    <Tooltip title="点击复制（功能待实现）">
                      <span><PhoneOutlined /> {resume.phone}</span>
                    </Tooltip>
                  </Descriptions.Item>
                  <Descriptions.Item label="邮箱" span={2}>
                    <MailOutlined /> {resume.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="高意向候选人">
                    {resume.isHighPotential ? (
                      <Tag icon={<TrophyOutlined />} color="red">是</Tag>
                    ) : (
                      <Tag>否</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="最后跟进日期">
                    <CalendarOutlined /> {resume.lastFollowUpDate}
                    {daysSinceFollowUp > 7 && (
                      <Tag color="red" style={{ marginLeft: 8 }}>{daysSinceFollowUp}天前</Tag>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card size="small" title="状态概览">
                <div style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 48, marginBottom: 8, color: statusConfig[resume.status].color }}>
                    {statusConfig[resume.status].icon}
                  </div>
                  <Tag color={statusConfig[resume.status].color} style={{ fontSize: 14, padding: '4px 12px' }}>
                    {statusConfig[resume.status].label}
                  </Tag>
                  <Divider style={{ margin: '16px 0' }} />
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="面试轮次">
                      已进行 {resume.interviews.length} 轮
                    </Descriptions.Item>
                    <Descriptions.Item label="是否高意向">
                      {resume.isHighPotential ? '是' : '否'}
                    </Descriptions.Item>
                    <Descriptions.Item label="跟进频率">
                      {daysSinceFollowUp <= 3 ? '正常' : daysSinceFollowUp <= 7 ? '待跟进' : '预警'}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </Card>
            </Col>
          </Row>

          <Card size="small" title="技能标签">
            <Space wrap>
              {resume.skills.map((skill, idx) => (
                <Tag key={idx} color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
                  {skill}
                </Tag>
              ))}
            </Space>
          </Card>

          <Card size="small" title="工作经历">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {resume.workHistory.map((work, idx) => (
                <li key={idx} style={{ marginBottom: 8, lineHeight: 1.8 }}>
                  {work}
                </li>
              ))}
            </ul>
          </Card>

          <Card size="small" title="自我评价">
            <p style={{ lineHeight: 1.8, margin: 0 }}>{resume.selfIntroduction}</p>
          </Card>

          <Card 
            size="small"
            title="面试记录"
            extra={
              resume.interviews.length > 0 && (
                <Button
                  type="link"
                  onClick={() => {
                    if (editMode) {
                      setEditMode(false);
                      setSelectedInterviewId(null);
                    } else {
                      const lastInterview = resume.interviews[resume.interviews.length - 1];
                      if (lastInterview && !lastInterview.result) {
                        setSelectedInterviewId(lastInterview.id);
                        setEditMode(true);
                        form.setFieldsValue({
                          score: 80,
                          result: '待定' as InterviewResultType
                        });
                      }
                    }
                  }}
                >
                  {editMode ? '取消评价' : '添加评价'}
                </Button>
              )
            }
          >
            {resume.interviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <ScheduleOutlined style={{ fontSize: 48, marginBottom: 12 }} />
                <p>暂无面试记录</p>
              </div>
            ) : (
              <>
                <Table
                  dataSource={resume.interviews}
                  columns={interviewColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
                {editMode && selectedInterviewId && (
                  <Card type="inner" title="面试评价" style={{ marginTop: 16 }}>
                    <Form form={form} layout="vertical">
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="score"
                            label="评分（百分制）"
                            rules={[{ required: true, message: '请输入评分' }]}
                          >
                            <InputNumber min={0} max={100} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="result"
                            label="面试结果"
                            rules={[{ required: true, message: '请选择结果' }]}
                          >
                            <Select>
                              <Option value="通过">通过</Option>
                              <Option value="未通过">未通过</Option>
                              <Option value="待定">待定</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name="comment"
                        label="面试评价"
                        rules={[{ required: true, message: '请输入评价' }]}
                      >
                        <TextArea rows={3} placeholder="请输入面试评价..." />
                      </Form.Item>
                      <Button type="primary" onClick={handleAddEvaluation}>
                        提交评价
                      </Button>
                    </Form>
                  </Card>
                )}
              </>
            )}
          </Card>
        </Space>
      )}
    </Modal>
  );
}
