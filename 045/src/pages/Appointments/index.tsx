import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Form, message, DatePicker, Badge, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAppStore } from '@/store';
import ModalForm from '@/components/ModalForm';
import type { Appointment } from '@/types';
import dayjs from 'dayjs';
import mockApi from '@/mock';
import './index.scss';

import type { Dayjs } from 'dayjs';

interface AppointmentFormData {
  customerId: string;
  doctorId: string;
  projectId: string;
  date: Dayjs | string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

const statusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'warning', text: '待确认' },
  confirmed: { color: 'processing', text: '已确认' },
  completed: { color: 'success', text: '已完成' },
  cancelled: { color: 'default', text: '已取消' }
};

const timeSlots = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00'
];

const AppointmentsPage = () => {
  const { appointments, customers, doctors, projects, setAppointments, setCustomers, setDoctors, setProjects, addAppointment, updateAppointment } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const custRes = mockApi.getCustomers();
        const docRes = mockApi.getDoctors();
        const projRes = mockApi.getProjects();
        const apptRes = mockApi.getAppointments();
        setCustomers(custRes.data);
        setDoctors(docRes.data);
        setProjects(projRes.data);
        setAppointments(apptRes.data);
      } catch (error) {
        message.error('数据加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setCustomers, setDoctors, setProjects, setAppointments]);

  const getOccupiedSlots = (doctorId: string, date: string): string[] => {
    return appointments
      .filter(
        (appt) =>
          appt.doctorId === doctorId &&
          appt.date === date &&
          appt.status !== 'cancelled'
      )
      .map((appt) => appt.timeSlot);
  };

  const getAvailableSlots = (doctorId: string, date: string): string[] => {
    const occupiedSlots = getOccupiedSlots(doctorId, date);
    return timeSlots.filter((slot) => !occupiedSlots.includes(slot));
  };

  const checkDuplicateAppointment = (
    customerId: string,
    doctorId: string,
    date: string,
    timeSlot: string,
    excludeId?: string
  ): boolean => {
    return appointments.some(
      (appt) =>
        appt.customerId === customerId &&
        appt.doctorId === doctorId &&
        appt.date === date &&
        appt.timeSlot === timeSlot &&
        appt.status !== 'cancelled' &&
        appt.id !== excludeId
    );
  };

  useEffect(() => {
    const doctorId = form.getFieldValue('doctorId');
    const dateValue = form.getFieldValue('date');
    if (doctorId && dateValue) {
      const dateStr = dayjs.isDayjs(dateValue) ? dateValue.format('YYYY-MM-DD') : dateValue;
      const available = getAvailableSlots(doctorId, dateStr);
      if (available.length === 0) {
        message.warning('该医生此日期已无可用时段');
      }
    }
  }, [form, appointments]);

  const filteredAppointments = appointments.filter((appt) => {
    const matchSearch = appt.customerName.includes(searchText) || appt.doctorName.includes(searchText);
    const matchStatus = filterStatus ? appt.status === filterStatus : true;
    const matchDate = filterDate ? appt.date === filterDate : true;
    return matchSearch && matchStatus && matchDate;
  });

  const handleAdd = () => {
    setEditingAppointment(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Appointment) => {
    setEditingAppointment(record);
    setModalVisible(true);
  };

  const handleCancel = (record: Appointment) => {
    updateAppointment(record.id, { status: 'cancelled' });
    message.success('预约已取消');
  };

  const handleSubmit = (values: AppointmentFormData) => {
    const customer = customers.find(c => c.id === values.customerId);
    const doctor = doctors.find(d => d.id === values.doctorId);
    const project = projects.find(p => p.id === values.projectId);
    const dateStr = dayjs.isDayjs(values.date) ? values.date.format('YYYY-MM-DD') : values.date;

    const isDuplicate = checkDuplicateAppointment(
      values.customerId,
      values.doctorId,
      dateStr,
      values.timeSlot,
      editingAppointment?.id
    );

    if (isDuplicate) {
      message.error('该客户在相同时段已有预约，请勿重复预约');
      return;
    }

    if (editingAppointment) {
      updateAppointment(editingAppointment.id, {
        ...values,
        date: dateStr,
        customerName: customer?.name || '',
        doctorName: doctor?.name || '',
        projectName: project?.name || ''
      });
      message.success('预约更新成功');
    } else {
      const newAppointment: Appointment = {
        ...values,
        id: Date.now().toString(),
        date: dateStr,
        customerName: customer?.name || '',
        doctorName: doctor?.name || '',
        projectName: project?.name || '',
        createdAt: new Date().toISOString()
      };
      addAppointment(newAppointment);
      message.success('预约创建成功');
    }
    setModalVisible(false);
  };

  const columns = [
    {
      title: '客户姓名',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120
    },
    {
      title: '医生',
      dataIndex: 'doctorName',
      key: 'doctorName',
      width: 120
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 120
    },
    {
      title: '预约日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => <Badge status="processing" text={date} />
    },
    {
      title: '时间段',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: Appointment) => (
        <Space>
          {record.status !== 'cancelled' && record.status !== 'completed' && (
            <Popconfirm
              title="确认取消预约?"
              onConfirm={() => handleCancel(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" danger>
                取消
              </Button>
            </Popconfirm>
          )}
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
    <div className="appointments-page">
      <Card className="page-card">
        <div className="page-header">
          <h2 className="page-title">预约排班管理</h2>
          <Space wrap size="middle">
            <Input
              placeholder="搜索客户/医生"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="状态筛选"
              value={filterStatus || undefined}
              onChange={setFilterStatus}
              allowClear
              style={{ width: 130 }}
            >
              <Select.Option value="pending">待确认</Select.Option>
              <Select.Option value="confirmed">已确认</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
            <DatePicker
              placeholder="选择日期"
              onChange={(date, dateString) => setFilterDate(dateString as string)}
              allowClear
              style={{ width: 150 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增预约
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredAppointments}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>

      <ModalForm<AppointmentFormData>
        title={editingAppointment ? '编辑预约' : '新增预约'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editingAppointment ? { ...editingAppointment, date: dayjs(editingAppointment.date) } : { status: 'pending' }}
        form={form}
        width={600}
      >
        <Form.Item
          name="customerId"
          label="选择客户"
          rules={[{ required: true, message: '请选择客户' }]}
        >
          <Select placeholder="请选择客户" showSearch filterOption={(input, option) => {
            const customer = customers.find(c => c.id === option?.value);
            return customer?.name.includes(input) || false;
          }}>
            {customers.map((cust) => (
              <Select.Option key={cust.id} value={cust.id}>
                {cust.name} - {cust.phone}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="doctorId"
          label="选择医生"
          rules={[{ required: true, message: '请选择医生' }]}
        >
          <Select placeholder="请选择医生">
            {doctors.map((doc) => (
              <Select.Option key={doc.id} value={doc.id}>
                {doc.name} - {doc.specialty}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="projectId"
          label="选择项目"
          rules={[{ required: true, message: '请选择项目' }]}
        >
          <Select placeholder="请选择项目">
            {projects.map((proj) => (
              <Select.Option key={proj.id} value={proj.id}>
                {proj.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="date"
          label="预约日期"
          rules={[{ required: true, message: '请选择日期' }]}
        >
          <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
        </Form.Item>
        <Form.Item
          name="timeSlot"
          label="预约时段"
          rules={[{ required: true, message: '请选择时段' }]}
        >
          <Select placeholder="请选择时段" disabled={!form.getFieldValue('doctorId') || !form.getFieldValue('date')}>
            {(() => {
              const doctorId = form.getFieldValue('doctorId');
              const dateValue = form.getFieldValue('date');
              if (!doctorId || !dateValue) {
                return timeSlots.map((slot) => (
                  <Select.Option key={slot} value={slot}>
                    {slot}
                  </Select.Option>
                ));
              }
              const dateStr = dayjs.isDayjs(dateValue) ? dateValue.format('YYYY-MM-DD') : dateValue;
              const availableSlots = getAvailableSlots(doctorId, dateStr);
              return timeSlots.map((slot) => (
                <Select.Option key={slot} value={slot} disabled={!availableSlots.includes(slot) && slot !== editingAppointment?.timeSlot}>
                  {slot} {!availableSlots.includes(slot) && slot !== editingAppointment?.timeSlot ? '(已占用)' : ''}
                </Select.Option>
              ));
            })()}
          </Select>
        </Form.Item>
        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Select.Option value="pending">待确认</Select.Option>
            <Select.Option value="confirmed">已确认</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
            <Select.Option value="cancelled">已取消</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="notes" label="备注">
          <Input.TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </ModalForm>
    </div>
  );
};

export default AppointmentsPage;
