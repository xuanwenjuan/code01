import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Checkbox,
  InputNumber,
  Button,
  Card,
  Typography,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  Switch,
  Divider,
  Collapse,
  Tag,
  Row,
  Col,
} from 'antd';
import { DeleteOutlined, ShoppingOutlined, GiftOutlined, InfoCircleOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import Empty from '../../components/Empty';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const provinces = [
  { code: '110000', name: '北京市' },
  { code: '310000', name: '上海市' },
  { code: '440000', name: '广东省' },
  { code: '330000', name: '浙江省' },
  { code: '320000', name: '江苏省' },
  { code: '510000', name: '四川省' },
  { code: '420000', name: '湖北省' },
  { code: '430000', name: '湖南省' },
];

const cities = {
  '110000': [{ code: '110100', name: '北京市' }],
  '310000': [{ code: '310100', name: '上海市' }],
  '440000': [
    { code: '440100', name: '广州市' },
    { code: '440300', name: '深圳市' },
    { code: '440600', name: '佛山市' },
    { code: '441900', name: '东莞市' },
  ],
  '330000': [
    { code: '330100', name: '杭州市' },
    { code: '330200', name: '宁波市' },
    { code: '330300', name: '温州市' },
  ],
  '320000': [
    { code: '320100', name: '南京市' },
    { code: '320200', name: '无锡市' },
    { code: '320500', name: '苏州市' },
  ],
  '510000': [
    { code: '510100', name: '成都市' },
    { code: '510300', name: '自贡市' },
  ],
  '420000': [
    { code: '420100', name: '武汉市' },
    { code: '420200', name: '黄石市' },
  ],
  '430000': [
    { code: '430100', name: '长沙市' },
    { code: '430200', name: '株洲市' },
  ],
};

const districts = {
  '110100': [
    { code: '110101', name: '东城区' },
    { code: '110102', name: '西城区' },
    { code: '110105', name: '朝阳区' },
    { code: '110106', name: '丰台区' },
    { code: '110108', name: '海淀区' },
  ],
  '310100': [
    { code: '310101', name: '黄浦区' },
    { code: '310104', name: '徐汇区' },
    { code: '310105', name: '长宁区' },
    { code: '310106', name: '静安区' },
    { code: '310110', name: '杨浦区' },
  ],
  '440100': [
    { code: '440103', name: '荔湾区' },
    { code: '440104', name: '越秀区' },
    { code: '440105', name: '海珠区' },
    { code: '440106', name: '天河区' },
  ],
  '440300': [
    { code: '440303', name: '罗湖区' },
    { code: '440304', name: '福田区' },
    { code: '440305', name: '南山区' },
    { code: '440306', name: '宝安区' },
  ],
};

const coupons = [
  { id: 1, name: '新人专享券', value: 10, condition: 99, desc: '满99减10' },
  { id: 2, name: '满减优惠券', value: 20, condition: 199, desc: '满199减20' },
  { id: 3, name: 'VIP专享券', value: 50, condition: 399, desc: '满399减50' },
];

const Cart = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const {
    cartItems,
    cartItemCount,
    totalPrice,
    originalTotalPrice,
    totalDiscount,
    allChecked,
    hasCheckedItems,
    checkedCount,
    updateQuantity,
    removeFromCart,
    toggleCheck,
    toggleAllCheck,
    clearCheckedItems,
    clearCart,
  } = useCart();

  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [needInvoice, setNeedInvoice] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('express');

  if (cartItems.length === 0) {
    return <Empty description="购物车是空的" buttonText="去购物" />;
  }

  const handleQuantityChange = (index, value) => {
    if (value <= 0) {
      message.warning('商品数量不能小于1');
      return;
    }
    const item = cartItems[index];
    if (value > item.stock) {
      message.warning(`库存不足，最多可购买 ${item.stock} 件`);
      return;
    }
    updateQuantity(index, value);
  };

  const handleDelete = (index) => {
    removeFromCart(index);
    message.success('已删除');
  };

  const handleBatchDelete = () => {
    if (!hasCheckedItems) {
      message.warning('请先选择要删除的商品');
      return;
    }
    clearCheckedItems();
    message.success('已删除选中商品');
  };

  const handleClearCart = () => {
    clearCart();
    message.success('购物车已清空');
  };

  const handleSubmitOrder = () => {
    if (!isLoggedIn) {
      message.warning('请先登录');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (!hasCheckedItems) {
      message.warning('请选择要购买的商品');
      return;
    }

    setOrderModalVisible(true);
    setSelectedProvince(null);
    setSelectedCity(null);
    setNeedInvoice(false);
    setSelectedCoupon(null);
    setShippingMethod('express');
    form.resetFields();
  };

  const handleOrderConfirm = () => {
    form.validateFields().then((values) => {
      const checkedItems = cartItems.filter((item) => item.checked);
      const couponValue = selectedCoupon ? selectedCoupon.value : 0;
      const shippingFee = shippingMethod === 'express' ? 0 : 12;
      const finalTotal = totalPrice - couponValue + shippingFee;

      const order = {
        id: Date.now(),
        items: checkedItems,
        totalPrice: finalTotal,
        originalPrice: totalPrice,
        couponValue,
        shippingFee,
        address: values,
        shippingMethod,
        invoice: needInvoice ? values.invoice : null,
        remark: values.remark,
        status: '待发货',
        createTime: new Date().toLocaleString(),
      };

      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.unshift(order);
      localStorage.setItem('orders', JSON.stringify(orders));

      clearCheckedItems();
      setOrderModalVisible(false);
      message.success('下单成功！');
      navigate('/orders');
    });
  };

  const getAvailableCoupons = () => {
    return coupons.filter((c) => totalPrice >= c.condition);
  };

  const getFinalTotal = () => {
    const couponValue = selectedCoupon ? selectedCoupon.value : 0;
    const shippingFee = shippingMethod === 'express' ? 0 : 12;
    return totalPrice - couponValue + shippingFee;
  };

  const columns = [
    {
      title: '选择',
      dataIndex: 'checked',
      width: 60,
      render: (_, record, index) => (
        <Checkbox
          checked={record.checked}
          onChange={() => toggleCheck(index)}
        />
      ),
    },
    {
      title: '商品信息',
      dataIndex: 'name',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img
            src={record.image}
            alt={record.name}
            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
          />
          <div>
            <div
              style={{ cursor: 'pointer', color: '#1890ff' }}
              onClick={() => navigate(`/product/${record.id}`)}
            >
              {record.name}
            </div>
            {record.selectedSpecs && Object.keys(record.selectedSpecs).length > 0 && (
              <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                {Object.entries(record.selectedSpecs)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join('，')}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      width: 120,
      render: (price) => <span style={{ color: '#ff4d4f', fontWeight: 500 }}>¥{price}</span>,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 180,
      render: (quantity, record, index) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleQuantityChange(index, quantity - 1)}
            disabled={quantity <= 1}
          />
          <InputNumber
            min={1}
            max={record.stock}
            value={quantity}
            onChange={(value) => handleQuantityChange(index, value)}
            size="small"
            style={{ width: 60, textAlign: 'center' }}
            controls={false}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleQuantityChange(index, quantity + 1)}
            disabled={quantity >= record.stock}
          />
        </div>
      ),
    },
    {
      title: '小计',
      width: 120,
      render: (_, record) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 16 }}>
          ¥{(record.price * record.quantity).toFixed(2)}
        </span>
      ),
    },
    {
      title: '操作',
      width: 80,
      render: (_, record, index) => (
        <Popconfirm
          title="确定要删除这件商品吗？"
          onConfirm={() => handleDelete(index)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          购物车 ({cartItemCount})
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Checkbox
            checked={allChecked}
            onChange={(e) => toggleAllCheck(e.target.checked)}
          >
            全选
          </Checkbox>
          <span style={{ color: '#666' }}>
            已选择 <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{cartItems.filter((item) => item.checked).length}</span> 件商品
          </span>
        </div>
      </div>

      <Card style={{ borderRadius: 8 }}>
        <Table
          rowKey={(record, index) => `${record.id}-${index}`}
          columns={columns}
          dataSource={cartItems}
          pagination={false}
          bordered
        />

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              disabled={!hasCheckedItems}
            >
              删除选中
            </Button>
            <Popconfirm
              title="确定要清空购物车吗？"
              onConfirm={handleClearCart}
              okText="确定"
              cancelText="取消"
            >
              <Button>清空购物车</Button>
            </Popconfirm>
            <Button onClick={() => navigate('/')}>继续购物</Button>
          </div>

          <Card
            style={{
              width: 360,
              borderRadius: 8,
              background: '#fafafa',
            }}
            bodyStyle={{ padding: '16px 24px' }}
          >
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">商品件数：</Text>
              <span>{cartItemCount} 件</span>
            </div>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">已选件数：</Text>
              <span>{checkedCount} 件</span>
            </div>
            {totalDiscount > 0 && (
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">商品原价：</Text>
                <span style={{ textDecoration: 'line-through', color: '#999' }}>
                  ¥{originalTotalPrice.toFixed(2)}
                </span>
              </div>
            )}
            {totalDiscount > 0 && (
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">优惠金额：</Text>
                <span style={{ color: '#52c41a' }}>-¥{totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ color: '#666' }}>应付金额：</span>
              <span style={{ color: '#ff4d4f', fontSize: 28, fontWeight: 'bold' }}>
                ¥{totalPrice.toFixed(2)}
              </span>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={handleSubmitOrder}
              disabled={!hasCheckedItems}
              block
              style={{ height: 48, fontSize: 16 }}
            >
              去结算 ({checkedCount})
            </Button>
          </Card>
        </div>
      </Card>

      <Modal
        title="确认订单"
        open={orderModalVisible}
        onOk={handleOrderConfirm}
        onCancel={() => setOrderModalVisible(false)}
        width={700}
        okText="确认下单"
        cancelText="取消"
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          <Card
            title="商品清单"
            size="small"
            style={{ marginBottom: 16 }}
          >
            {cartItems.filter((item) => item.checked).map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 0',
                  borderBottom: index < cartItems.filter((i) => i.checked).length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <img src={item.image} alt="" style={{ width: 40, height: 40, borderRadius: 4 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{item.name}</div>
                  <div style={{ color: '#999', fontSize: 11 }}>
                    {item.selectedSpecs && Object.entries(item.selectedSpecs).map(([k, v]) => `${k}: ${v}`).join('，')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#ff4d4f', fontSize: 13 }}>¥{item.price}</div>
                  <div style={{ color: '#999', fontSize: 11 }}>x{item.quantity}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card title="收货地址" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="name"
                  label="收货人姓名"
                  rules={[{ required: true, message: '请输入收货人姓名' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="请输入收货人姓名" size="small" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="联系电话"
                  rules={[
                    { required: true, message: '请输入联系电话' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="请输入联系电话" size="small" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="province"
                  label="省份"
                  rules={[{ required: true, message: '请选择省份' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="请选择省份"
                    size="small"
                    onChange={(value) => {
                      setSelectedProvince(value);
                      setSelectedCity(null);
                      form.setFieldsValue({ city: null, district: null });
                    }}
                  >
                    {provinces.map((p) => (
                      <Option key={p.code} value={p.code}>
                        {p.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="city"
                  label="城市"
                  rules={[{ required: true, message: '请选择城市' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="请选择城市"
                    size="small"
                    disabled={!selectedProvince}
                    onChange={(value) => {
                      setSelectedCity(value);
                      form.setFieldsValue({ district: null });
                    }}
                  >
                    {(cities[selectedProvince] || []).map((c) => (
                      <Option key={c.code} value={c.code}>
                        {c.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="district"
                  label="区县"
                  rules={[{ required: true, message: '请选择区县' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="请选择区县"
                    size="small"
                    disabled={!selectedCity}
                  >
                    {(districts[selectedCity] || []).map((d) => (
                      <Option key={d.code} value={d.code}>
                        {d.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="address"
              label="详细地址"
              rules={[{ required: true, message: '请输入详细地址' }]}
              style={{ marginBottom: 0 }}
            >
              <TextArea rows={2} placeholder="请输入详细地址（街道、门牌号等）" size="small" />
            </Form.Item>
          </Card>

          <Card title="配送方式" size="small" style={{ marginBottom: 16 }}>
            <Radio.Group value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
              <Radio.Button value="express">
                顺丰速运（免运费）
              </Radio.Button>
              <Radio.Button value="standard">
                普通快递（¥12）
              </Radio.Button>
            </Radio.Group>
          </Card>

          <Collapse ghost style={{ marginBottom: 16 }}>
            <Panel
              header={
                <span>
                  <GiftOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                  优惠券
                  {selectedCoupon && (
                    <Tag color="orange" style={{ marginLeft: 8 }}>
                      已选：-{selectedCoupon.value}元
                    </Tag>
                  )}
                </span>
              }
              key="1"
            >
              {getAvailableCoupons().length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {getAvailableCoupons().map((coupon) => (
                    <div
                      key={coupon.id}
                      onClick={() => setSelectedCoupon(coupon.id === selectedCoupon?.id ? null : coupon)}
                      style={{
                        padding: '8px 12px',
                        border: selectedCoupon?.id === coupon.id ? '2px solid #fa8c16' : '1px dashed #d9d9d9',
                        borderRadius: 4,
                        cursor: 'pointer',
                        background: selectedCoupon?.id === coupon.id ? '#fff7e6' : '#fff',
                        transition: 'all 0.3s',
                      }}
                    >
                      <div style={{ color: '#fa8c16', fontWeight: 'bold' }}>¥{coupon.value}</div>
                      <div style={{ fontSize: 11, color: '#999' }}>{coupon.desc}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  暂无可用优惠券（满99元可用）
                </Text>
              )}
            </Panel>
          </Collapse>

          <Card title="支付方式" size="small" style={{ marginBottom: 16 }}>
            <Form.Item
              name="payment"
              rules={[{ required: true, message: '请选择支付方式' }]}
              style={{ marginBottom: 0 }}
            >
              <Radio.Group>
                <Radio.Button value="alipay">支付宝</Radio.Button>
                <Radio.Button value="wechat">微信支付</Radio.Button>
                <Radio.Button value="card">银行卡</Radio.Button>
                <Radio.Button value="cod">货到付款</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Card>

          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                发票信息
                <Switch
                  checked={needInvoice}
                  onChange={setNeedInvoice}
                  size="small"
                />
              </span>
            }
            size="small"
            style={{ marginBottom: 16 }}
          >
            {needInvoice && (
              <>
                <Form.Item
                  name={['invoice', 'type']}
                  label="发票类型"
                  rules={[{ required: true, message: '请选择发票类型' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Select placeholder="请选择发票类型" size="small">
                    <Option value="personal">个人发票</Option>
                    <Option value="company">企业发票</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name={['invoice', 'title']}
                  label="发票抬头"
                  rules={[{ required: true, message: '请输入发票抬头' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="请输入发票抬头" size="small" />
                </Form.Item>
              </>
            )}
          </Card>

          <Form.Item
            name="remark"
            label="订单备注"
            style={{ marginBottom: 16 }}
          >
            <TextArea
              rows={2}
              placeholder="选填，可填写您的特殊需求（如：生日贺卡、留言等）"
              size="small"
              maxLength={100}
              showCount
            />
          </Form.Item>

          <div
            style={{
              padding: 16,
              background: '#fff7e6',
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text type="secondary">商品总价：</Text>
              <span>¥{totalPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text type="secondary">运费：</Text>
              <span>{shippingMethod === 'express' ? '免运费' : '¥12.00'}</span>
            </div>
            {selectedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">优惠券：</Text>
                <span style={{ color: '#fa8c16' }}>-¥{selectedCoupon.value.toFixed(2)}</span>
              </div>
            )}
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>应付金额：</Text>
              <span style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold' }}>
                ¥{getFinalTotal().toFixed(2)}
              </span>
            </div>
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <InfoCircleOutlined style={{ marginRight: 4 }} />
                下单后24小时内发货，顺丰包邮
              </Text>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Cart;
