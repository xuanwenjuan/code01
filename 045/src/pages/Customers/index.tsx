import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Input, Form, message, Modal, Descriptions, Row, Col, Select } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useAppStore } from '@/store';
import ModalForm from '@/components/ModalForm';
import { maskPhone, maskIdCard, maskName } from '@/utils/mask';
import type { Customer } from '@/types';
import mockApi from '@/mock';
import './index.scss';

interface CustomerFormData {
  name: string;
  phone: string;
  idCard: string;
  age: number;
  gender: 'male' | 'female';
  skinType: string;
  constitution: string;
  medicalHistory: string;
  contraindications: string;
}

const CustomersPage = () => {
  const { customers, setCustomers, addCustomer, updateCustomer } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = mockApi.getCustomers();
        setCustomers(res.data);
      } catch (error) {
        message.error('数据加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setCustomers]);

  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.name.includes(searchText) ||
      customer.phone.includes(searchText) ||
      customer.idCard.includes(searchText)
    );
  });

  const handleAdd = () => {
    setEditingCustomer(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Customer) => {
    setEditingCustomer(record);
    setModalVisible(true);
  };

  const handleView = (record: Customer) => {
    setViewingCustomer(record);
    setDetailVisible(true);
  };

  const handleSubmit = (values: CustomerFormData) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, values);
      message.success('档案更新成功');
    } else {
      const newCustomer: Customer = {
        ...values,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      addCustomer(newCustomer);
      message.success('档案创建成功');
    }
    setModalVisible(false);
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (name: string) => <span className="masked-text">{maskName(name)}</span>
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: string) => (
        <Tag color={gender === 'male' ? 'blue' : 'pink'}>
          {gender === 'male' ? '男' : '女'}
        </Tag>
      )
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone: string) => <span className="masked-text">{maskPhone(phone)}</span>
    },
    {
      title: '肤质',
      dataIndex: 'skinType',
      key: 'skinType',
      width: 100
    },
    {
      title: '体质',
      dataIndex: 'constitution',
      key: 'constitution',
      width: 100
    },
    {
      title: '禁忌事项',
      dataIndex: 'contraindications',
      key: 'contraindications',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: Customer) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="customers-page">
      <Card className="page-card">
        <div className="page-header">
          <h2 className="page-title">客户健康档案管理</h2>
          <Space wrap size="middle">
            <Input
              placeholder="搜索客户"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建档案
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          locale={{
            emptyText: <div className="empty-state">暂无客户档案</div>
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>

      <ModalForm<CustomerFormData>
        title={editingCustomer ? '编辑客户档案' : '新建客户档案'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editingCustomer}
        width={700}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="性别"
              rules={[{ required: true, message: '请选择性别' }]}
            >
              <Select placeholder="请选择性别">
                <Select.Option value="male">男</Select.Option>
                <Select.Option value="female">女</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="age"
              label="年龄"
              rules={[{ required: true, message: '请输入年龄' }]}
            >
              <Input type="number" placeholder="请输入年龄" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="idCard"
          label="身份证号"
          rules={[
            { required: true, message: '请输入身份证号' },
            { pattern: /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, message: '身份证号格式不正确' }
          ]}
        >
          <Input placeholder="请输入身份证号" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="skinType"
              label="肤质类型"
              rules={[{ required: true, message: '请选择肤质类型' }]}
            >
              <Select placeholder="请选择肤质类型">
                <Select.Option value="干性">干性</Select.Option>
                <Select.Option value="油性">油性</Select.Option>
                <Select.Option value="混合性">混合性</Select.Option>
                <Select.Option value="敏感性">敏感性</Select.Option>
                <Select.Option value="中性">中性</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="constitution"
              label="体质类型"
              rules={[{ required: true, message: '请选择体质类型' }]}
            >
              <Select placeholder="请选择体质类型">
                <Select.Option value="平和质">平和质</Select.Option>
                <Select.Option value="气虚质">气虚质</Select.Option>
                <Select.Option value="阳虚质">阳虚质</Select.Option>
                <Select.Option value="阴虚质">阴虚质</Select.Option>
                <Select.Option value="痰湿质">痰湿质</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="medicalHistory" label="过往医美记录">
          <Input.TextArea rows={3} placeholder="请输入过往医美记录" />
        </Form.Item>
        <Form.Item name="contraindications" label="禁忌事项">
          <Input.TextArea rows={2} placeholder="请输入禁忌事项" />
        </Form.Item>
      </ModalForm>

      <Modal
        title="客户档案详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {viewingCustomer && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="姓名" span={1}>
              {viewingCustomer.name}
            </Descriptions.Item>
            <Descriptions.Item label="性别" span={1}>
              {viewingCustomer.gender === 'male' ? '男' : '女'}
            </Descriptions.Item>
            <Descriptions.Item label="年龄" span={1}>
              {viewingCustomer.age}
            </Descriptions.Item>
            <Descriptions.Item label="手机号" span={1}>
              {maskPhone(viewingCustomer.phone)}
            </Descriptions.Item>
            <Descriptions.Item label="身份证号" span={2}>
              {maskIdCard(viewingCustomer.idCard)}
            </Descriptions.Item>
            <Descriptions.Item label="肤质类型" span={1}>
              {viewingCustomer.skinType}
            </Descriptions.Item>
            <Descriptions.Item label="体质类型" span={1}>
              {viewingCustomer.constitution}
            </Descriptions.Item>
            <Descriptions.Item label="过往医美记录" span={2}>
              {viewingCustomer.medicalHistory}
            </Descriptions.Item>
            <Descriptions.Item label="禁忌事项" span={2}>
              {viewingCustomer.contraindications}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>
              {viewingCustomer.createdAt}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CustomersPage;
