import React, { useEffect } from 'react';
import { Form, Input, Select, Radio, message } from 'antd';
import type { FormInstance } from 'antd';
import CommonModal from './CommonModal';
import { CustomerCategoryOptions, CustomerLevelOptions, CustomerStatusOptions } from '@/constants';
import { useAppStore } from '@/store';
import type { 
  Customer, 
  CustomerWithValue,
  CustomerModalFormValues 
} from '@/types';

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer | CustomerWithValue | null;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ open, onClose, customer }) => {
  const [form] = Form.useForm<CustomerModalFormValues>();
  const { addCustomer, updateCustomer } = useAppStore();
  const isEdit: boolean = !!customer;

  useEffect(() => {
    if (open && customer) {
      form.setFieldsValue({
        category: customer.category,
        companyName: customer.companyName,
        contact: customer.contact,
        phone: customer.phone,
        level: customer.level,
        status: customer.status
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, customer, form]);

  const handleSubmit = async (): Promise<void> => {
    const values: CustomerModalFormValues = await form.validateFields();
    
    if (isEdit && customer) {
      updateCustomer(customer.id, values);
      message.success('客户信息更新成功');
    } else {
      addCustomer(values);
      message.success('客户创建成功');
    }
    onClose();
  };

  return (
    <CommonModal
      title={isEdit ? '编辑客户' : '新建客户'}
      open={open}
      onClose={onClose}
      onConfirm={handleSubmit}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          category: 'enterprise',
          level: 'C',
          status: 'not_cooperated'
        }}
      >
        <Form.Item<CustomerModalFormValues>
          name="category"
          label="客户分类"
          rules={[{ required: true, message: '请选择客户分类' }]}
        >
          <Radio.Group>
            {CustomerCategoryOptions.map((item) => (
              <Radio key={item.value} value={item.value}>
                {item.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        <Form.Item<CustomerModalFormValues>
          name="companyName"
          label="公司名称"
          rules={[{ required: true, message: '请输入公司名称' }]}
        >
          <Input placeholder="请输入公司名称" />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item<CustomerModalFormValues>
            name="contact"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人' }]}
          >
            <Input placeholder="请输入联系人姓名" />
          </Form.Item>

          <Form.Item<CustomerModalFormValues>
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item<CustomerModalFormValues>
            name="level"
            label="客户等级"
            rules={[{ required: true, message: '请选择客户等级' }]}
          >
            <Select placeholder="请选择客户等级">
              {CustomerLevelOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item<CustomerModalFormValues>
            name="status"
            label="合作状态"
            rules={[{ required: true, message: '请选择合作状态' }]}
          >
            <Select placeholder="请选择合作状态">
              {CustomerStatusOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </Form>
    </CommonModal>
  );
};

export default CustomerModal;
