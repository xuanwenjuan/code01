import React, { useEffect, useMemo } from 'react';
import { Form, InputNumber, Select, message, Tag } from 'antd';
import type { SelectOption } from '@/types';
import CommonModal from './CommonModal';
import { OrderStatusOptions, LARGE_ORDER_THRESHOLD } from '@/constants';
import type { Order, OrderStatus, OrderModalFormValues, Customer } from '@/types';
import { useAppStore } from '@/store';

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  order?: Order | null;
  defaultCustomerId?: string;
}

interface CustomerSelectOption extends SelectOption<string> {
  label: string;
  value: string;
}

const OrderModal: React.FC<OrderModalProps> = ({ open, onClose, order, defaultCustomerId }) => {
  const [form] = Form.useForm<OrderModalFormValues>();
  const { customers, addOrder, updateOrder } = useAppStore();
  const isEdit: boolean = !!order;

  const customerOptions: CustomerSelectOption[] = useMemo(() => {
    return customers.map((customer: Customer) => ({
      label: customer.companyName,
      value: customer.id
    }));
  }, [customers]);

  useEffect(() => {
    if (open && order) {
      form.setFieldsValue({
        customerId: order.customerId,
        amount: order.amount,
        status: order.status
      });
    } else if (open) {
      form.resetFields();
      if (defaultCustomerId) {
        form.setFieldValue('customerId', defaultCustomerId);
      }
    }
  }, [open, order, defaultCustomerId, form]);

  const handleSubmit = async (): Promise<void> => {
    const values: OrderModalFormValues = await form.validateFields();
    const customer: Customer | undefined = customers.find((c: Customer) => c.id === values.customerId);
    
    if (!customer) {
      message.error('请选择有效客户');
      return;
    }

    if (isEdit && order) {
      updateOrder(order.id, {
        customerId: values.customerId,
        customerName: customer.companyName,
        amount: values.amount,
        status: values.status,
        isLargeAmount: values.amount > LARGE_ORDER_THRESHOLD,
        processed: values.status !== 'pending_payment' || values.amount <= LARGE_ORDER_THRESHOLD
      });
      message.success('订单信息更新成功');
    } else {
      addOrder({
        customerId: values.customerId,
        customerName: customer.companyName,
        amount: values.amount,
        status: values.status
      });
      message.success('订单创建成功');
    }
    onClose();
  };

  return (
    <CommonModal
      title={isEdit ? '编辑订单' : '新建订单'}
      open={open}
      onClose={onClose}
      onConfirm={handleSubmit}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'pending_payment' as OrderStatus
        }}
      >
        <Form.Item<OrderModalFormValues>
          name="customerId"
          label="客户"
          rules={[{ required: true, message: '请选择客户' }]}
        >
          <Select placeholder="请选择客户" showSearch optionFilterProp="label">
            {customerOptions.map((item: CustomerSelectOption) => (
              <Select.Option key={item.value} value={item.value} label={item.label}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item<OrderModalFormValues>
          name="amount"
          label="订单金额（元）"
          rules={[
            { required: true, message: '请输入订单金额' },
            { type: 'number', min: 0, message: '订单金额必须大于等于0' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入订单金额"
            min={0}
            step={100}
            formatter={(value: number | undefined) => `¥ ${value ?? 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value: string | undefined) => Number(value?.replace(/\¥\s?|(,*)/g, '')) || 0}
          />
        </Form.Item>

        <Form.Item<OrderModalFormValues>
          name="status"
          label="订单状态"
          rules={[{ required: true, message: '请选择订单状态' }]}
        >
          <Select placeholder="请选择订单状态">
            {OrderStatusOptions.map((item) => (
              <Select.Option key={item.value} value={item.value}>
                <Tag color={item.color}>{item.label}</Tag>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </CommonModal>
  );
};

export default OrderModal;
