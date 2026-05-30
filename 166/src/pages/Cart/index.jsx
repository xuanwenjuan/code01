import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Table, Checkbox, InputNumber, Button, Empty, Popconfirm,
  Row, Col, Card, message
} from 'antd'
import {
  DeleteOutlined, ShoppingOutlined, CheckCircleOutlined
} from '@ant-design/icons'
import {
  updateQuantity, removeFromCart, toggleSelect,
  selectAll, unselectAll, selectCartTotal, selectCartCount,
  selectSelectedCount, clearSelected
} from '@/store/cartSlice'
import './index.scss'

const Cart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, selectedIds } = useSelector(state => state.cart)
  const totalPrice = useSelector(selectCartTotal)
  const cartCount = useSelector(selectCartCount)
  const selectedCount = useSelector(selectSelectedCount)

  const allSelected = items.length > 0 && selectedIds.length === items.length

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      dispatch(selectAll())
    } else {
      dispatch(unselectAll())
    }
  }

  const handleDelete = (productId, spec) => {
    dispatch(removeFromCart({ productId, spec }))
    message.success('已删除')
  }

  const handleClearSelected = () => {
    if (selectedIds.length === 0) {
      message.warning('请先选择商品')
      return
    }
    dispatch(clearSelected())
    message.success('已删除所选商品')
  }

  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      message.warning('请先选择商品')
      return
    }
    navigate('/checkout')
  }

  const columns = [
    {
      title: <Checkbox checked={allSelected} onChange={handleSelectAll} />,
      dataIndex: 'select',
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedIds.includes(`${record.productId}-${record.spec}`)}
          onChange={() => dispatch(toggleSelect({ productId: record.productId, spec: record.spec }))}
        />
      )
    },
    {
      title: '商品信息',
      dataIndex: 'product',
      render: (_, record) => (
        <div className="product-cell">
          <img src={record.image} alt={record.name} className="product-image" />
          <div className="product-info">
            <div className="product-name">{record.name}</div>
            <div className="product-spec">规格：{record.spec}</div>
          </div>
        </div>
      )
    },
    {
      title: '单价',
      dataIndex: 'price',
      width: 120,
      render: (price) => <span className="price">¥{price.toFixed(1)}</span>
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 180,
      render: (quantity, record) => (
        <InputNumber
          min={1}
          max={record.stock}
          value={quantity}
          onChange={(value) => dispatch(updateQuantity({
            productId: record.productId,
            spec: record.spec,
            quantity: value
          }))}
        />
      )
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      width: 120,
      render: (_, record) => (
        <span className="subtotal">¥{(record.price * record.quantity).toFixed(1)}</span>
      )
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除这件商品吗？"
          onConfirm={() => handleDelete(record.productId, record.spec)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      )
    }
  ]

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <ShoppingOutlined className="empty-icon" />
          <p>购物车还是空的</p>
          <Button type="primary" onClick={() => navigate('/products')}>
            去购物
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h2 className="page-title">我的购物车 ({cartCount})</h2>

      <Card className="cart-table-card">
        <Table
          dataSource={items}
          columns={columns}
          rowKey={(record) => `${record.productId}-${record.spec}`}
          pagination={false}
          className="cart-table"
        />
      </Card>

      <div className="cart-footer">
        <Row justify="space-between" align="middle">
          <Col>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleClearSelected}
              disabled={selectedIds.length === 0}
            >
              删除选中
            </Button>
          </Col>
          <Col className="cart-summary">
            <div className="summary-item">
              <span>已选 <strong>{selectedCount}</strong> 件商品</span>
            </div>
            <div className="summary-item total">
              <span>合计：</span>
              <span className="total-price">¥{totalPrice.toFixed(1)}</span>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleCheckout}
              disabled={selectedIds.length === 0}
              className="checkout-btn"
            >
              去结算
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Cart
