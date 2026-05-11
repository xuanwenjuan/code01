import { Modal, Form, Select, InputNumber, DatePicker, TimePicker, Button, message, Row, Col, Card, Tag } from 'antd';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import type { Resume, InterviewRecord } from '@/types';
import { useAppStore } from '@/store';

interface InterviewModalProps {
  open: boolean;
  onClose: () => void;
  resume: Resume | null;
}

const { Option } = Select;

const defaultInterviewers = ['王经理', '李总监', '张主管', '陈HR', '刘组长'];
const defaultLocations = ['一号会议室', '二号会议室', '三号会议室', '线上视频'];

export function InterviewModal({ open, onClose, resume }: InterviewModalProps) {
  const [form] = Form.useForm();
  const addInterview = useAppStore(state => state.addInterview);
  const jobs = useAppStore(state => state.jobs);

  const job = useMemo(() => {
    return resume ? jobs.find(j => j.id === resume.jobId) : null;
  }, [resume, jobs]);

  useEffect(() => {
    if (open && resume) {
      form.resetFields();
      form.setFieldsValue({
        round: resume.interviews.length + 1,
        date: dayjs(),
        time: dayjs().hour(10).minute(0)
      });
    }
  }, [open, resume, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!resume) return;

      const date = values.date as dayjs.Dayjs;
      const time = values.time as dayjs.Dayjs;
      const interviewTime = dayjs(`${date.format('YYYY-MM-DD')} ${time.format('HH:mm')}`).format('YYYY-MM-DD HH:mm');

      const interview: Omit<InterviewRecord, 'id' | 'resumeId' | 'createdAt'> = {
        round: values.round,
        interviewer: values.interviewer,
        interviewTime,
        location: values.location
      };

      addInterview(resume.id, interview);
      message.success('面试安排成功');
      onClose();
    } catch {
      message.error('请填写完整信息');
    }
  };

  const interviewHistory = resume?.interviews || [];

  return (
    <Modal
      title={
        <span>
          安排面试
          {resume && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {resume.name}
            </Tag>
          )}
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          确认安排
        </Button>
      ]}
      width={800}
    >
      <Row gutter={[24, 0]}>
        <Col xs={24} lg={14}>
          <Card size="small" title="面试安排" style={{ marginBottom: 16 }}>
            <Form
              form={form as FormInstance}
              layout="vertical"
              initialValues={{
                round: 1
              }}
            >
              <Form.Item
                name="interviewer"
                label="面试官"
                rules={[{ required: true, message: '请选择或输入面试官' }]}
              >
                <Select
                  mode="tags"
                  placeholder="请选择或输入面试官"
                  maxCount={1}
                  style={{ width: '100%' }}
                >
                  {defaultInterviewers.map(interviewer => (
                    <Option key={interviewer} value={interviewer}>
                      {interviewer}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="date"
                    label="面试日期"
                    rules={[{ required: true, message: '请选择面试日期' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      disabledDate={d => d && d.isBefore(dayjs().startOf('day'))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="time"
                    label="面试时间"
                    rules={[{ required: true, message: '请选择面试时间' }]}
                  >
                    <TimePicker
                      style={{ width: '100%' }}
                      format="HH:mm"
                      minuteStep={30}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="location"
                label="面试地点"
                rules={[{ required: true, message: '请选择面试地点' }]}
              >
                <Select placeholder="请选择面试地点" style={{ width: '100%' }}>
                  {defaultLocations.map(location => (
                    <Option key={location} value={location}>
                      {location}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="round"
                label="面试轮次"
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: '100%' }}
                  addonAfter="轮"
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card size="small" title="候选人信息">
            {resume && (
              <div style={{ fontSize: 14, lineHeight: 2 }}>
                <p><strong>姓名：</strong>{resume.name}</p>
                <p><strong>性别：</strong>{resume.gender} | <strong>年龄：</strong>{resume.age}岁</p>
                <p><strong>学历：</strong>{resume.education}</p>
                <p><strong>学校：</strong>{resume.school}</p>
                <p><strong>工作经验：</strong>{resume.experience}</p>
                <p><strong>应聘职位：</strong>{job?.name || '-'}</p>
                <p><strong>当前状态：</strong><Tag color={
                  resume.status === '初筛' ? 'blue' : 
                  resume.status === '面试中' ? 'gold' : 
                  resume.status === '已录用' ? 'green' : 'red'
                }>{resume.status}</Tag></p>
              </div>
            )}
          </Card>

          {interviewHistory.length > 0 && (
            <Card size="small" title="历史面试记录" style={{ marginTop: 16 }}>
              {interviewHistory.map(interview => (
                <Card
                  key={interview.id}
                  size="small"
                  type="inner"
                  style={{ marginBottom: 8 }}
                >
                  <p style={{ margin: 0 }}><strong>第 {interview.round} 轮</strong> · {interview.interviewer}</p>
                  <p style={{ margin: 4, fontSize: 12, color: '#999' }}>
                    {interview.interviewTime} · {interview.location}
                  </p>
                  {interview.result && (
                    <Tag color={
                      interview.result === '通过' ? 'green' : 
                      interview.result === '未通过' ? 'red' : 'gold'
                    } style={{ marginTop: 4 }}>
                      {interview.result}
                    </Tag>
                  )}
                </Card>
              ))}
            </Card>
          )}
        </Col>
      </Row>
    </Modal>
  );
}
