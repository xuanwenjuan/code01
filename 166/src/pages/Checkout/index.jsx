import React, { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Card, List, Button, Radio, Checkbox, Modal, Form,
  Input, Select, message, Tag, Divider, Row, Col
} from 'antd'
import {
  EnvironmentOutlined, ClockCircleOutlined,
  TagOutlined, CheckOutlined, PlusOutlined
} from '@ant-design/icons'
import {
  selectAddress, selectCoupon, selectDeliveryTime,
  addAddress, createOrder, calculateDiscount
} from '@/store/orderSlice'
import { clearSelected, selectCartTotal, selectSelectedCount } from '@/store/cartSlice'
import './index.scss'

const { Option } = Select
const { TextArea } = Input

const Checkout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, selectedIds } = useSelector(state => state.cart)
  const { addresses, coupons, deliveryTimes, selectedAddress, selectedCoupon, selectedDeliveryTime } = useSelector(state => state.order)
  const totalPrice = useSelector(selectCartTotal)
  const selectedCount = useSelector(selectSelectedCount)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [form] = Form.useForm()

  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.includes(`${item.productId}-${item.spec}`))
  }, [items, selectedIds])

  const discount = useSelector(state => calculateDiscount(state, totalPrice))
  const deliveryFee = totalPrice >= 99 ? 0 : 8
  const finalPrice = Math.max(0, totalPrice - discount) + deliveryFee

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      message.warning('请选择收货地址')
      return
    }
    if (!selectedDeliveryTime) {
      message.warning('请选择配送时段')
      return
    }

    Modal.confirm({
      title: '确认下单',
      content: `确认支付 ¥${finalPrice.toFixed(2)} 吗？`,
      onOk: () => {
        dispatch(createOrder({
          products: selectedItems,
          totalAmount: totalPrice,
          payAmount: finalPrice,
          address: selectedAddress,
          deliveryTime: selectedDeliveryTime?.time,
          coupon: selectedCoupon
        }))
        dispatch(clearSelected())
        message.success('下单成功！')
        navigate('/orders')
      }
    })
  }

  const handleAddAddress = (values) => {
    dispatch(addAddress(values))
    setShowAddressModal(false)
    form.resetFields()
    message.success('地址添加成功')
  }

  if (selectedItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-state">
          <p>请先选择要结算的商品</p>
          <Button type="primary" onClick={() => navigate('/cart')}>返回购物车</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <h2 className="page-title">确认订单</h2>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <Card className="checkout-card" title={<span><EnvironmentOutlined /> 收货地址</span>}>
            <div className="address-list">
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`address-item ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                  onClick={() => dispatch(selectAddress(addr))}
                >
                  <Radio checked={selectedAddress?.id === addr.id} />
                  <div className="address-info">
                    <div className="address-top">
                      <span className="name">{addr.name}</span>
                      <span className="phone">{addr.phone}</span>
                      {addr.isDefault && <Tag color="blue">默认</Tag>}
                      {addr.tag && <Tag>{addr.tag}</Tag>}
                    </div>
                    <div className="address-detail">
                      {addr.province}{addr.city}{addr.district}{addr.detail}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => setShowAddressModal(true)}
                className="add-address-btn"
              >
                添加新地址
              </Button>
            </div>
          </Card>

          <Card className="checkout-card" title={<span><ClockCircleOutlined /> 配送时段</span>}>
            <div className="delivery-list">
              {deliveryTimes.map(time => (
                <Button
                  key={time.id}
                  type={selectedDeliveryTime?.id === time.id ? 'primary' : 'default'}
                  disabled={!time.available}
                  onClick={() => dispatch(selectDeliveryTime(time))}
                  className="delivery-item"
                >
                  {time.time}
                  {!time.available && <span className="sold-out">已约满</span>}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="checkout-card" title="商品清单">
            <List
              dataSource={selectedItems}
              renderItem={item => (
                <List.Item key={`${item.productId}-${item.spec}`} className="order-item">
                  <img src={item.image} alt={item.name} className="item-image" />
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-spec">规格：{item.spec}</div>
                  </div>
                  <div className="item-price">
                    <span className="price">¥{item.price.toFixed(1)}</span>
                    <span className="quantity">x{item.quantity}</span>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="summary-card" title="订单摘要">
            <div className="summary-item">
              <span>商品总数</span>
              <span>{selectedCount}件</span>
            </div>
            <div className="summary-item">
              <span>商品金额</span>
              <span>¥{totalPrice.toFixed(1)}</span>
            </div>
            <div className="summary-item" onClick={() => setShowCouponModal(true)}>
              <span><TagOutlined /> 优惠券</span>
              <span className="coupon-select">
                {selectedCoupon ? (
                  <span className="selected-coupon">-¥{selectedCoupon.value}</span>
                ) : (
                  <span>{coupons.filter(c => c.minAmount <= totalPrice).length}张可用</span>
                )}
              </span>
            </div>
            <div className="summary-item">
              <span>配送费</span>
              <span>{deliveryFee === 0 ? <Tag color="green">免运费</Tag> : `¥${deliveryFee}`}</span>
            </div>
            <Divider />
            <div className="summary-item total">
              <span>实付金额</span>
              <span className="total-price">¥{finalPrice.toFixed(1)}</span>
            </div>
            <Button
              type="primary"
              size="large"
              block
              icon={<CheckOutlined />}
              onClick={handlePlaceOrder}
              className="submit-btn"
            >
              提交订单
            </Button>
          </Card>
        </Col>
      </Row>

      <Modal
        title="添加收货地址"
        open={showAddressModal}
        onCancel={() => setShowAddressModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddAddress}>
          <Form.Item name="name" label="收货人" rules={[{ required: true, message: '请输入收货人姓名' }]}>
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
          ]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="province" label="省份" rules={[{ required: true, message: '请选择省份' }]}>
                <Select placeholder="省份">
                  <Option value="北京市">北京市</Option>
                  <Option value="上海市">上海市</Option>
                  <Option value="广东省">广东省</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="城市" rules={[{ required: true, message: '请选择城市' }]}>
                <Select placeholder="城市">
                  <Option value="北京市">北京市</Option>
                  <Option value="上海市">上海市</Option>
                  <Option value="广州市">广州市</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="district" label="区县" rules={[{ required: true, message: '请选择区县' }]}>
                <Select placeholder="区县">
                  <Option value="朝阳区">朝阳区</Option>
                  <Option value="海淀区">海淀区</Option>
                  <Option value="丰台区">丰台区</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="detail" label="详细地址" rules={[{ required: true, message: '请输入详细地址' }]}>
            <TextArea rows={3} placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>设为默认地址</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>保存地址</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="选择优惠券"
        open={showCouponModal}
        onCancel={() => setShowCouponModal(false)}
        footer={null}
      >
        <div className="coupon-list">
          {coupons.length > 0 ? (
            coupons.map(coupon => (
              <div
                key={coupon.id}
                className={`coupon-item ${selectedCoupon?.id === coupon.id ? 'selected' : ''} ${coupon.minAmount > totalPrice ? 'disabled' : ''}`}
                onClick={() => {
                  if (coupon.minAmount <= totalPrice) {
                    dispatch(selectCoupon(selectedCoupon?.id === coupon.id ? null : coupon))
                  }
                }}
              >
                <div className="coupon-amount">
                  <span className="symbol">¥</span>
                  <span className="value">{coupon.value}</span>
                </div>
                <div className="coupon-info">
                  <div className="coupon-name">{coupon.name}</div>
                  <div className="coupon-condition">满{coupon.minAmount}可用</div>
                  <div className="coupon-time">{coupon.startTime} 至 {coupon.endTime}</div>
                </div>
                {selectedCoupon?.id === coupon.id && (
                  <CheckOutlined className="selected-icon" />
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">暂无可用优惠券</div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Checkout
