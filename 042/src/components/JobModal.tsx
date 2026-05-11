import { Modal, Form, Input, Select, InputNumber, Button, message } from 'antd';
import type { FormInstance } from 'antd';
import { useEffect } from 'react';
import type { JobPosition, JobStatusType } from '@/types';
import { useAppStore } from '@/store';

interface JobModalProps {
  open: boolean;
  onClose: () => void;
  editJob?: JobPosition | null;
}

const { Option } = Select;
const { TextArea } = Input;

export function JobModal({ open, onClose, editJob }: JobModalProps) {
  const [form] = Form.useForm();
  const addJob = useAppStore(state => state.addJob);
  const updateJob = useAppStore(state => state.updateJob);

  useEffect(() => {
    if (open) {
      if (editJob) {
        form.setFieldsValue(editJob);
      } else {
        form.resetFields();
      }
    }
  }, [open, editJob, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editJob) {
        updateJob(editJob.id, values);
        message.success('职位信息更新成功');
      } else {
        addJob(values);
        message.success('职位创建成功');
      }
      onClose();
    } catch {
      message.error('请填写完整信息');
    }
  };

  return (
    <Modal
      title={editJob ? '编辑职位' : '新增职位'}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {editJob ? '保存' : '创建'}
        </Button>
      ]}
      width={700}
    >
      <Form<Omit<JobPosition, 'id' | 'hiredCount' | 'createdAt' | 'updatedAt'>>
        form={form as FormInstance<Omit<JobPosition, 'id' | 'hiredCount' | 'createdAt' | 'updatedAt'>>}
        layout="vertical"
        initialValues={{
          status: '招聘中' as JobStatusType,
          quota: 1
        }}
      >
        <Form.Item
          name="name"
          label="职位名称"
          rules={[{ required: true, message: '请输入职位名称' }]}
        >
          <Input placeholder="请输入职位名称" />
        </Form.Item>

        <Form.Item
          name="department"
          label="所属部门"
          rules={[{ required: true, message: '请选择部门' }]}
        >
          <Select placeholder="请选择部门">
            <Option value="技术研发">技术研发</Option>
            <Option value="市场营销">市场营销</Option>
            <Option value="职能管理">职能管理</Option>
            <Option value="产品运营">产品运营</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="salaryRange"
          label="薪资范围"
          rules={[{ required: true, message: '请输入薪资范围' }]}
        >
          <Input placeholder="例如：15-25K" />
        </Form.Item>

        <Form.Item
          name="quota"
          label="招聘名额"
          rules={[{ required: true, message: '请输入招聘名额' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入招聘名额" />
        </Form.Item>

        <Form.Item
          name="status"
          label="招聘状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select>
            <Option value="招聘中">招聘中</Option>
            <Option value="已暂停">已暂停</Option>
            <Option value="已关闭">已关闭</Option>
          </Select>
        </Form.Item>

        <Form.Item name="description" label="职位描述">
          <TextArea rows={4} placeholder="请输入职位描述" />
        </Form.Item>

        <Form.Item name="requirements" label="任职要求">
          <TextArea rows={4} placeholder="请输入任职要求" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
