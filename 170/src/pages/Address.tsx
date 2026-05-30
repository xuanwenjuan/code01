import React, { useState } from 'react';
import { Card, List, Button, Modal, Form, Input, Switch, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../store';
import { addAddress, updateAddress, deleteAddress } from '../store/modules/user';
import type { Address } from '../types';
import EmptyState from '../components/common/EmptyState';
import { validatePhone } from '../utils';

interface AddressFormValues {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

const Address: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const addresses = currentUser?.address || [];

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form] = Form.useForm<AddressFormValues>();

  const handleAdd = () => {
    setEditingAddress(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    form.setFieldsValue(address);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个地址吗？',
      onOk: () => {
        dispatch(deleteAddress(id));
        message.success('删除成功');
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingAddress) {
        dispatch(updateAddress({ ...editingAddress, ...values }));
        message.success('地址更新成功');
      } else {
        const newAddress: Address = {
          id: Date.now().toString(),
          ...values,
        };
        dispatch(addAddress(newAddress));
        message.success('地址添加成功');
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <Card
        title="地址管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增地址
          </Button>
        }
      >
        {addresses.length > 0 ? (
          <List
            dataSource={addresses}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', marginRight: '12px' }}>
                      {item.name}
                    </span>
                    <span style={{ color: '#666', marginRight: '12px' }}>
                      <PhoneOutlined style={{ marginRight: '4px' }} />
                      {item.phone}
                    </span>
                    {item.isDefault && (
                      <span
                        style={{
                          background: '#1890ff',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        默认
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#666' }}>
                    <EnvironmentOutlined style={{ marginRight: '4px' }} />
                    {item.province} {item.city} {item.district} {item.detail}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(item)}>
                    编辑
                  </Button>
                  <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>
                    删除
                  </Button>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <EmptyState description="暂无收货地址" actionText="添加地址" actionPath="/address" />
        )}
      </Card>

      <Modal
        title={editingAddress ? '编辑地址' : '新增地址'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical" initialValues={{ isDefault: false }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="name"
              label="收货人姓名"
              rules={[{ required: true, message: '请输入收货人姓名' }]}
              style={{ flex: 1 }}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="联系电话"
              rules={[
                { required: true, message: '请输入联系电话' },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (validatePhone(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('请输入正确的手机号'));
                  },
                },
              ]}
              style={{ flex: 1 }}
            >
              <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" maxLength={11} />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="province"
              label="省份"
              rules={[{ required: true, message: '请输入省份' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入省份" />
            </Form.Item>
            <Form.Item
              name="city"
              label="城市"
              rules={[{ required: true, message: '请输入城市' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入城市" />
            </Form.Item>
            <Form.Item
              name="district"
              label="区县"
              rules={[{ required: true, message: '请输入区县' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入区县" />
            </Form.Item>
          </div>
          <Form.Item
            name="detail"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item name="isDefault" label="设为默认地址" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Address;
