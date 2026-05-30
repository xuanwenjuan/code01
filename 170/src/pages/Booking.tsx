import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Select,
  Button,
  Radio,
  DatePicker,
  TimePicker,
  InputNumber,
  message,
  Steps,
  Divider,
  Tag,
  Result,
  Avatar,
} from 'antd';
import {
  CheckCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { mockServices, mockTechnicians, mockAddresses } from '../mock';
import { useAppDispatch, useAppSelector } from '../store';
import { addOrder, addAddress } from '../store/modules/user';
import {
  formatPrice,
  generateOrderId,
  validatePhone,
  validateName,
  validateDetailAddress,
  validateDistrict,
} from '../utils';
import type { Order, Address } from '../types';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/common/EmptyState';

const { TextArea } = Input;
const { Option } = Select;

interface BookingFormValues {
  contactName: string;
  contactPhone: string;
  addressId: string;
  newAddress?: {
    province: string;
    city: string;
    district: string;
    detail: string;
  };
  appointmentDate: dayjs.Dayjs;
  appointmentTime: dayjs.Dayjs;
  quantity: number;
  couponId?: string;
  remark?: string;
}

const Booking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { coupons } = useAppSelector((state) => state.user);

  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<BookingFormValues>();
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [orderResult, setOrderResult] = useState<Order | null>(null);

  const service = useMemo(() => {
    return mockServices.find((s) => s.id === id);
  }, [id]);

  const technician = useMemo(() => {
    if (!service) return null;
    return mockTechnicians.find((t) => t.id === service.technicianId);
  }, [service]);

  const addresses = useMemo(() => {
    return user?.address || mockAddresses;
  }, [user]);

  const availableCoupons = useMemo(() => {
    if (!service) return [];
    return coupons.filter((c) => !c.used && service.price >= c.minAmount);
  }, [coupons, service]);

  const selectedCoupon = Form.useWatch('couponId', form);
  const quantity = Form.useWatch('quantity', form);

  const totalPrice = useMemo(() => {
    if (!service) return 0;
    const qty = quantity || 1;
    let price = service.price * qty;
    if (selectedCoupon) {
      const coupon = coupons.find((c) => c.id === selectedCoupon);
      if (coupon) {
        price -= coupon.discount;
      }
    }
    return Math.max(0, price);
  }, [service, selectedCoupon, coupons, quantity]);

  useEffect(() => {
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');
    if (dateParam) {
      form.setFieldsValue({ appointmentDate: dayjs(dateParam) });
    }
    if (timeParam) {
      form.setFieldsValue({ appointmentTime: dayjs(timeParam, 'HH:mm') });
    }
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      form.setFieldsValue({ addressId: defaultAddr.id });
    }
  }, [searchParams, form, addresses]);

  if (!service || !technician) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <EmptyState
          description="服务不存在"
          actionText="返回服务列表"
          actionPath="/services"
        />
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      let selectedAddress: Address;
      if (useNewAddress && values.newAddress) {
        const newAddr: Address = {
          id: Date.now().toString(),
          name: values.contactName,
          phone: values.contactPhone,
          province: values.newAddress.province,
          city: values.newAddress.city,
          district: values.newAddress.district,
          detail: values.newAddress.detail,
          isDefault: addresses.length === 0,
        };
        dispatch(addAddress(newAddr));
        selectedAddress = newAddr;
      } else {
        const addr = addresses.find((a) => a.id === values.addressId);
        if (!addr) {
          message.error('请选择收货地址');
          return;
        }
        selectedAddress = addr;
      }

      const appointmentTime = `${values.appointmentDate.format('YYYY-MM-DD')} ${values.appointmentTime.format('HH:mm')}`;

      const order: Order = {
        id: generateOrderId(),
        serviceId: service.id,
        serviceName: service.name,
        serviceImage: service.images[0],
        technicianId: technician.id,
        technicianName: technician.name,
        price: totalPrice,
        status: 'pending',
        appointmentTime,
        address: selectedAddress,
        createTime: new Date().toISOString(),
        remark: values.remark,
      };

      dispatch(addOrder(order));
      setOrderResult(order);
      setCurrentStep(1);
      message.success('预约提交成功！');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  if (currentStep === 1 && orderResult) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        <Result
          status="success"
          title={
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
              预约提交成功
            </span>
          }
          subTitle={
            <span style={{ color: '#666' }}>
              预约单号：{orderResult.id}
            </span>
          }
          icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '72px' }} />}
          extra={[
            <Button
              type="primary"
              key="view"
              size="large"
              onClick={() => navigate('/orders')}
              style={{
                background: 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)',
                border: 'none',
                borderRadius: '24px',
                height: '44px',
                padding: '0 32px',
              }}
            >
              查看订单
            </Button>,
            <Button
              key="home"
              size="large"
              onClick={() => navigate('/')}
              style={{ borderRadius: '24px', height: '44px', padding: '0 32px' }}
            >
              返回首页
            </Button>,
          ]}
        />
        <Card
          style={{
            marginTop: '32px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          }}
          headStyle={{
            fontWeight: 'bold',
            fontSize: '16px',
            borderBottom: '1px solid #f0f0f0',
          }}
          title="预约详情"
        >
          <Row gutter={[16, 20]}>
            <Col span={12}>
              <div style={{ color: '#999', marginBottom: '4px' }}>服务项目</div>
              <div style={{ fontWeight: '500' }}>{orderResult.serviceName}</div>
            </Col>
            <Col span={12}>
              <div style={{ color: '#999', marginBottom: '4px' }}>美甲师</div>
              <div style={{ fontWeight: '500' }}>{orderResult.technicianName}</div>
            </Col>
            <Col span={12}>
              <div style={{ color: '#999', marginBottom: '4px' }}>预约时间</div>
              <div style={{ fontWeight: '500' }}>{orderResult.appointmentTime}</div>
            </Col>
            <Col span={12}>
              <div style={{ color: '#999', marginBottom: '4px' }}>预约金额</div>
              <div style={{ color: '#ff4d4f', fontSize: '20px', fontWeight: 'bold' }}>
                {formatPrice(orderResult.price)}
              </div>
            </Col>
            <Col span={24}>
              <div style={{ color: '#999', marginBottom: '4px' }}>上门地址</div>
              <div style={{ fontWeight: '500' }}>
                {orderResult.address.province} {orderResult.address.city}{' '}
                {orderResult.address.district} {orderResult.address.detail}
              </div>
              <div style={{ color: '#666', marginTop: '4px' }}>
                {orderResult.address.name} {orderResult.address.phone}
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: '20px', fontSize: '14px' }}
      >
        返回
      </Button>

      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: '#333',
          }}
        >
          确认预约
        </h1>
        <p style={{ color: '#999', margin: 0 }}>
          请仔细核对预约信息，确保上门地址和时间准确无误
        </p>
      </div>

      <Steps
        current={0}
        size="small"
        style={{ marginBottom: '32px' }}
        items={[
          {
            title: '确认信息',
            status: 'process',
            icon: <div style={{ background: 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>1</div>,
          },
          {
            title: '预约成功',
            status: 'wait',
            icon: <div style={{ background: '#f0f0f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontWeight: 'bold' }}>2</div>,
          },
        ]}
      />

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card
            title="预约信息"
            style={{ marginBottom: '24px', borderRadius: '12px' }}
            headStyle={{
              fontWeight: 'bold',
              fontSize: '16px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{ quantity: 1 }}
            >
              <Card
                style={{
                  marginBottom: '24px',
                  background: '#fafafa',
                  borderRadius: '8px',
                  border: 'none',
                }}
                bodyStyle={{ padding: '16px' }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img
                    src={service.images[0]}
                    alt={service.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 'bold',
                        fontSize: '15px',
                        marginBottom: '6px',
                      }}
                    >
                      {service.name}
                    </div>
                    <div style={{ color: '#666', fontSize: '13px', marginBottom: '6px' }}>
                      <ClockCircleOutlined style={{ marginRight: '4px' }} />
                      服务时长：{service.duration}分钟
                    </div>
                    <div style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
                      {formatPrice(service.price)}
                    </div>
                  </div>
                </div>
              </Card>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="contactName"
                    label={
                      <span style={{ fontWeight: '500' }}>
                        联系人姓名 <span style={{ color: '#ff4d4f' }}>*</span>
                      </span>
                    }
                    rules={[
                      { required: true, message: '请输入联系人姓名' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          if (validateName(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('姓名长度2-20位，支持中英文和数字')
                          );
                        },
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="请输入您的姓名"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="contactPhone"
                    label={
                      <span style={{ fontWeight: '500' }}>
                        联系电话 <span style={{ color: '#ff4d4f' }}>*</span>
                      </span>
                    }
                    rules={[
                      { required: true, message: '请输入联系电话' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          if (validatePhone(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('请输入有效的11位手机号码'));
                        },
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="请输入11位手机号码"
                      maxLength={11}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  marginTop: '8px',
                }}
              >
                <EnvironmentOutlined style={{ color: '#ff85c0' }} />
                <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>
                  上门地址
                </span>
              </div>

              <Radio.Group
                value={useNewAddress ? 'new' : 'existing'}
                onChange={(e) => setUseNewAddress(e.target.value === 'new')}
                style={{ marginBottom: '20px', display: 'block' }}
              >
                <Radio.Button value="existing" style={{ borderRadius: '16px 0 0 16px' }}>
                  使用已有地址
                </Radio.Button>
                <Radio.Button value="new" style={{ borderRadius: '0 16px 16px 0' }}>
                  新增地址
                </Radio.Button>
              </Radio.Group>

              {!useNewAddress && (
                <Form.Item
                  name="addressId"
                  rules={[{ required: !useNewAddress, message: '请选择地址' }]}
                >
                  <Select
                    placeholder="请选择上门地址"
                    size="large"
                    style={{ width: '100%' }}
                  >
                    {addresses.map((addr) => (
                      <Option key={addr.id} value={addr.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>
                            {addr.province} {addr.city} {addr.district} {addr.detail}
                          </span>
                          <span style={{ color: '#999', fontSize: '12px' }}>
                            ({addr.name} {addr.phone})
                          </span>
                          {addr.isDefault && (
                            <Tag color="blue" style={{ margin: 0 }}>
                              默认
                            </Tag>
                          )}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              {useNewAddress && (
                <div style={{ marginBottom: '8px' }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name={['newAddress', 'province']}
                        label={
                          <span style={{ fontSize: '13px' }}>
                            省份 <span style={{ color: '#ff4d4f' }}>*</span>
                          </span>
                        }
                        rules={[{ required: true, message: '请输入省份' }]}
                      >
                        <Input placeholder="例：北京市" size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={['newAddress', 'city']}
                        label={
                          <span style={{ fontSize: '13px' }}>
                            城市 <span style={{ color: '#ff4d4f' }}>*</span>
                          </span>
                        }
                        rules={[{ required: true, message: '请输入城市' }]}
                      >
                        <Input placeholder="例：北京市" size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={['newAddress', 'district']}
                        label={
                          <span style={{ fontSize: '13px' }}>
                            区县 <span style={{ color: '#ff4d4f' }}>*</span>
                          </span>
                        }
                        rules={[
                          { required: true, message: '请输入区县' },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              if (validateDistrict(value)) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('请输入正确的区县名称'));
                            },
                          },
                        ]}
                      >
                        <Input placeholder="例：朝阳区" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name={['newAddress', 'detail']}
                    label={
                      <span style={{ fontSize: '13px' }}>
                        详细地址 <span style={{ color: '#ff4d4f' }}>*</span>
                      </span>
                    }
                    rules={[
                      { required: true, message: '请输入详细地址' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          if (validateDetailAddress(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('详细地址长度5-100个字符，请填写具体门牌号')
                          );
                        },
                      },
                    ]}
                  >
                    <Input
                      placeholder="请输入详细地址，如：建国路88号SOHO现代城A座1201"
                      size="large"
                    />
                  </Form.Item>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '24px 0 16px 0',
                }}
              >
                <ClockCircleOutlined style={{ color: '#ff85c0' }} />
                <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>
                  预约时间
                </span>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="appointmentDate"
                    label={
                      <span style={{ fontSize: '13px' }}>
                        预约日期 <span style={{ color: '#ff4d4f' }}>*</span>
                      </span>
                    }
                    rules={[{ required: true, message: '请选择预约日期' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      disabledDate={disabledDate}
                      placeholder="请选择日期"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="appointmentTime"
                    label={
                      <span style={{ fontSize: '13px' }}>
                        预约时间 <span style={{ color: '#ff4d4f' }}>*</span>
                      </span>
                    }
                    rules={[{ required: true, message: '请选择预约时间' }]}
                  >
                    <TimePicker
                      style={{ width: '100%' }}
                      format="HH:mm"
                      minuteStep={30}
                      placeholder="请选择时间"
                      size="large"
                      disabledHours={() => [
                        ...Array(8).keys(),
                        ...Array(4).keys(),
                      ].map((h) => h + 20)}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="quantity"
                label={
                  <span style={{ fontSize: '13px' }}>
                    购买数量 <span style={{ color: '#ff4d4f' }}>*</span>
                  </span>
                }
                rules={[{ required: true, message: '请输入购买数量' }]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: '120px' }}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="couponId"
                label={
                  <span style={{ fontSize: '13px' }}>
                    <GiftOutlined style={{ marginRight: '4px', color: '#faad14' }} />
                    优惠券
                  </span>
                }
              >
                <Select
                  placeholder="请选择优惠券"
                  allowClear
                  size="large"
                  style={{ width: '100%' }}
                >
                  {availableCoupons.length > 0 ? (
                    availableCoupons.map((coupon) => (
                      <Option key={coupon.id} value={coupon.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{coupon.name}</span>
                          <span style={{ color: '#52c41a' }}>
                            减{coupon.discount}元 (满{coupon.minAmount}可用)
                          </span>
                        </div>
                      </Option>
                    ))
                  ) : (
                    <Option value="" disabled>
                      暂无可用优惠券
                    </Option>
                  )}
                </Select>
              </Form.Item>

              <Form.Item
                name="remark"
                label={<span style={{ fontSize: '13px' }}>备注信息</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="有什么想对美甲师说的，如：喜欢的颜色、特殊要求等..."
                  maxLength={200}
                  showCount
                  size="large"
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="订单信息"
            style={{
              borderRadius: '12px',
              position: 'sticky',
              top: '80px',
            }}
            headStyle={{
              fontWeight: 'bold',
              fontSize: '16px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <img
                src={service.images[0]}
                alt={service.name}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: '500',
                    fontSize: '14px',
                    marginBottom: '6px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {service.name}
                </div>
                <div style={{ color: '#999', fontSize: '12px', marginBottom: '6px' }}>
                  美甲师：{technician.name}
                </div>
                <div style={{ color: '#ff4d4f', fontSize: '16px', fontWeight: 'bold' }}>
                  {formatPrice(service.price)}
                </div>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div
              style={{
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#666', fontSize: '13px' }}>服务单价</span>
              <span style={{ fontSize: '14px' }}>{formatPrice(service.price)}</span>
            </div>
            <div
              style={{
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#666', fontSize: '13px' }}>购买数量</span>
              <span style={{ fontSize: '14px' }}>x{quantity || 1}</span>
            </div>
            <div
              style={{
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#666', fontSize: '13px' }}>小计</span>
              <span style={{ fontSize: '14px' }}>
                {formatPrice(service.price * (quantity || 1))}
              </span>
            </div>
            {selectedCoupon && (
              <div
                style={{
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#666', fontSize: '13px' }}>
                  <GiftOutlined style={{ marginRight: '4px' }} />
                  优惠券
                </span>
                <span style={{ color: '#52c41a', fontSize: '14px' }}>
                  -{' '}
                  {formatPrice(
                    coupons.find((c) => c.id === selectedCoupon)?.discount || 0
                  )}
                </span>
              </div>
            )}
            <div
              style={{
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#666', fontSize: '13px' }}>上门费</span>
              <span style={{ color: '#52c41a', fontSize: '14px' }}>免费</span>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '15px', color: '#333' }}>实付金额</span>
              <span style={{ fontSize: '30px', color: '#ff4d4f', fontWeight: 'bold' }}>
                {formatPrice(totalPrice)}
              </span>
            </div>

            <div
              style={{
                background: '#fff0f6',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ff85c0',
                  fontSize: '12px',
                }}
              >
                <SafetyOutlined />
                <span>安全保障：服务不满意可申请退款</span>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              onClick={handleSubmit}
              icon={<CheckCircleOutlined />}
              style={{
                background: 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)',
                border: 'none',
                height: '52px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '26px',
                boxShadow: '0 4px 12px rgba(255, 133, 192, 0.4)',
              }}
            >
              确认提交预约
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Booking;
