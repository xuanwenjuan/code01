import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Row,
  Col,
  Card,
  Radio,
  Input,
  Button,
  InputNumber,
  Form,
  message,
  Divider,
  Typography,
  Tag,
  Rate,
  Select,
  Tabs,
  Alert,
} from 'antd'
import {
  ShoppingCartOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  StarOutlined,
  EyeOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import Loading from '../../components/Common/Loading'
import { addOrder } from '../../store/userSlice'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const paramLabels = {
  sizes: '尺寸',
  colors: '颜色',
  materials: '材质',
  pages: '页数',
  shapes: '形状',
  processes: '工艺',
  styles: '款式',
  necklines: '领口',
  capacities: '容量',
  lids: '杯盖',
  sets: '套装类型',
  packages: '包装',
}

const fontOptions = [
  { value: 'default', label: '默认字体' },
  { value: 'serif', label: '宋体' },
  { value: 'sans-serif', label: '黑体' },
  { value: 'cursive', label: '手写体' },
  { value: 'monospace', label: '等宽字体' },
]

const colorOptions = [
  { value: '#000000', label: '黑色' },
  { value: '#333333', label: '深灰色' },
  { value: '#666666', label: '灰色' },
  { value: '#1890ff', label: '蓝色' },
  { value: '#52c41a', label: '绿色' },
  { value: '#faad14', label: '金色' },
  { value: '#ff4d4f', label: '红色' },
  { value: '#722ed1', label: '紫色' },
]

const positionOptions = [
  { value: 'center', label: '居中' },
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
  { value: 'top', label: '顶部' },
  { value: 'bottom', label: '底部' },
]

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { products } = useSelector((state) => state.product)
  const { isLoggedIn } = useSelector((state) => state.user)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [selectedParams, setSelectedParams] = useState({})
  const [quantity, setQuantity] = useState(1)
  const [customContent, setCustomContent] = useState('')
  const [fontFamily, setFontFamily] = useState('default')
  const [fontColor, setFontColor] = useState('#000000')
  const [fontSize, setFontSize] = useState(16)
  const [position, setPosition] = useState('center')
  const [isBold, setIsBold] = useState(false)
  const [activeTab, setActiveTab] = useState('params')

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundProduct = products.find((p) => p.id === parseInt(id))
      setProduct(foundProduct)
      setLoading(false)

      if (foundProduct?.params) {
        const initialParams = {}
        Object.keys(foundProduct.params).forEach((key) => {
          initialParams[key] = foundProduct.params[key][0]
        })
        setSelectedParams(initialParams)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [id, products])

  const handleParamChange = (paramKey, value) => {
    setSelectedParams((prev) => ({
      ...prev,
      [paramKey]: value,
    }))
    form.setFieldsValue({ [paramKey]: value })
  }

  const calculatePrice = () => {
    if (!product) return 0
    let basePrice = product.price
    let extraPrice = 0

    if (customContent) {
      if (customContent.length > 10) {
        extraPrice += 5
      }
      if (customContent.length > 30) {
        extraPrice += 3
      }
    }

    if (fontFamily !== 'default') {
      extraPrice += 2
    }

    if (isBold) {
      extraPrice += 1
    }

    if (fontSize > 20) {
      extraPrice += 2
    }

    return (basePrice + extraPrice) * quantity
  }

  const calculateExtraPrice = () => {
    let extraPrice = 0
    if (customContent) {
      if (customContent.length > 10) {
        extraPrice += 5
      }
      if (customContent.length > 30) {
        extraPrice += 3
      }
    }
    if (fontFamily !== 'default') {
      extraPrice += 2
    }
    if (isBold) {
      extraPrice += 1
    }
    if (fontSize > 20) {
      extraPrice += 2
    }
    return extraPrice
  }

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    try {
      const values = await form.validateFields()
      console.log('Form values:', values)

      const orderData = {
        id: `ORD${Date.now()}`,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        params: selectedParams,
        customContent: {
          text: customContent,
          fontFamily,
          fontColor,
          fontSize,
          position,
          isBold,
        },
        quantity,
        price: product.price,
        totalPrice: calculatePrice(),
        status: 'pending',
        createTime: new Date().toLocaleString('zh-CN'),
      }

      dispatch(addOrder(orderData))
      message.success('下单成功！请在个人中心查看订单')
      navigate('/profile/orders')
    } catch (error) {
      console.error('Validation error:', error)
      if (error.errorFields) {
        message.error('请完善表单信息')
      }
    }
  }

  const handleReset = () => {
    form.resetFields()
    setCustomContent('')
    setFontFamily('default')
    setFontColor('#000000')
    setFontSize(16)
    setPosition('center')
    setIsBold(false)
    setQuantity(1)
    if (product?.params) {
      const initialParams = {}
      Object.keys(product.params).forEach((key) => {
        initialParams[key] = product.params[key][0]
      })
      setSelectedParams(initialParams)
    }
    message.info('已重置所有选项')
  }

  const getPreviewStyle = () => {
    const positionStyles = {
      center: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      left: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 20px',
      },
      right: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 20px',
      },
      top: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20px 0',
      },
      bottom: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '20px 0',
      },
    }

    return {
      ...positionStyles[position],
      height: '100%',
      fontFamily: fontFamily === 'default' ? 'inherit' : fontFamily,
      fontSize: `${fontSize}px`,
      color: fontColor,
      fontWeight: isBold ? 'bold' : 'normal',
      textAlign: position === 'center' ? 'center' : position,
      wordBreak: 'break-word',
      padding: '20px',
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!product) {
    return (
      <div className="page-container">
        <Alert type="warning" message="产品不存在" showIcon />
        <Button onClick={() => navigate('/')} style={{ marginTop: '16px' }}>
          返回首页
        </Button>
      </div>
    )
  }

  const tabItems = [
    {
      key: 'params',
      label: '产品参数',
      children: (
        <div>
          {Object.keys(product.params).map((paramKey) => (
            <Form.Item
              key={paramKey}
              label={
                <span>
                  {paramLabels[paramKey] || paramKey}
                  <Text type="danger" style={{ marginLeft: '4px' }}>*</Text>
                </span>
              }
              name={paramKey}
              rules={[{ required: true, message: `请选择${paramLabels[paramKey] || paramKey}` }]}
              initialValue={selectedParams[paramKey]}
            >
              <Radio.Group
                value={selectedParams[paramKey]}
                onChange={(e) => handleParamChange(paramKey, e.target.value)}
                size="large"
              >
                {product.params[paramKey].map((option) => (
                  <Radio.Button key={option} value={option}>
                    {option}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          ))}

          <Form.Item label="购买数量">
            <InputNumber
              min={1}
              max={999}
              value={quantity}
              onChange={setQuantity}
              size="large"
              style={{ width: '150px' }}
              addonBefore="数量"
              addonAfter="件"
            />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'custom',
      label: '定制内容',
      children: (
        <div>
          <Form.Item
            label={
              <span>
                定制文字
                <Text type="danger" style={{ marginLeft: '4px' }}>*</Text>
                <InfoCircleOutlined
                  style={{ color: '#1890ff', marginLeft: '8px' }}
                  title="支持校徽、校训、姓名、日期等个性化定制内容"
                />
              </span>
            }
            name="customContent"
            rules={[
              { required: true, message: '请输入定制内容' },
              { min: 2, message: '定制内容至少2个字符' },
              { max: 50, message: '定制内容最多50个字符' },
              {
                pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s·！？、，。；：""''（）《》!?,;:\'\"\(\)\-\.]+$/,
                message: '定制内容只能包含中文、英文、数字和常用标点符号',
              },
            ]}
            initialValue={customContent}
          >
            <TextArea
              rows={3}
              placeholder="请输入定制内容，如：北京大学 1898 或 自强不息 厚德载物"
              value={customContent}
              onChange={(e) => {
                setCustomContent(e.target.value)
                form.setFieldsValue({ customContent: e.target.value })
              }}
              maxLength={50}
              showCount
              size="large"
            />
          </Form.Item>

          {customContent && (
            <>
              <Divider orientation="left">文字样式</Divider>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="字体">
                    <Select
                      value={fontFamily}
                      onChange={setFontFamily}
                      size="large"
                      style={{ width: '100%' }}
                    >
                      {fontOptions.map((font) => (
                        <Option key={font.value} value={font.value}>
                          {font.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="字体颜色">
                    <Select
                      value={fontColor}
                      onChange={setFontColor}
                      size="large"
                      style={{ width: '100%' }}
                    >
                      {colorOptions.map((color) => (
                        <Option key={color.value} value={color.value}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '16px',
                              height: '16px',
                              backgroundColor: color.value,
                              marginRight: '8px',
                              verticalAlign: 'middle',
                              borderRadius: '2px',
                            }}
                          />
                          {color.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="字体大小">
                    <InputNumber
                      min={12}
                      max={36}
                      value={fontSize}
                      onChange={setFontSize}
                      size="large"
                      style={{ width: '100%' }}
                      addonAfter="px"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="位置">
                    <Select
                      value={position}
                      onChange={setPosition}
                      size="large"
                      style={{ width: '100%' }}
                    >
                      {positionOptions.map((pos) => (
                        <Option key={pos.value} value={pos.value}>
                          {pos.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Radio.Group value={isBold} onChange={(e) => setIsBold(e.target.value)}>
                  <Radio.Button value={false}>常规</Radio.Button>
                  <Radio.Button value={true}>加粗</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'preview',
      label: '实时预览',
      children: (
        <div>
          <Card
            size="small"
            style={{
              border: '2px dashed #d9d9d9',
              minHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {customContent ? (
              <div style={getPreviewStyle()}>{customContent}</div>
            ) : (
              <div style={{ color: '#999', textAlign: 'center' }}>
                <EditOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
                <p>请先在"定制内容"标签页输入定制文字</p>
              </div>
            )}
          </Card>
          {customContent && (
            <Alert
              type="info"
              showIcon
              message="预览说明"
              description="此预览仅供参考，实际效果可能因产品材质、工艺等因素略有差异"
              style={{ marginTop: '16px' }}
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="page-container">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        style={{ marginBottom: '16px' }}
      >
        返回首页
      </Button>

      <Row gutter={[32, 32]}>
        <Col xs={24} md={12}>
          <Card cover={<img alt={product.name} src={product.image} style={{ height: '400px', objectFit: 'cover' }} />}>
            <div style={{ marginBottom: '16px' }}>
              <Title level={3} style={{ marginBottom: '8px' }}>
                {product.name}
              </Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Rate disabled defaultValue={product.rating} />
                <span style={{ color: '#faad14' }}>{product.rating}</span>
                <span style={{ color: '#999' }}>|</span>
                <span style={{ color: '#999' }}>已售 {product.sales}+</span>
                {product.originalPrice && (
                  <>
                    <span style={{ color: '#999' }}>|</span>
                    <span style={{ color: '#999', textDecoration: 'line-through' }}>
                      原价 ¥{product.originalPrice}
                    </span>
                  </>
                )}
              </div>
              <Paragraph style={{ color: '#666', fontSize: '14px' }}>
                {product.description}
              </Paragraph>
            </div>

            <Card size="small" style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
              <Row gutter={[16, 8]}>
                <Col xs={12}>
                  <Text type="secondary">产品单价</Text>
                  <div style={{ color: '#ff4d4f', fontSize: '24px', fontWeight: 'bold' }}>
                    ¥{product.price}
                  </div>
                </Col>
                <Col xs={12}>
                  <Text type="secondary">库存状态</Text>
                  <div style={{ color: '#52c41a', fontSize: '16px', fontWeight: '500' }}>
                    <CheckOutlined /> 充足
                  </div>
                </Col>
              </Row>
            </Card>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EditOutlined />
                产品定制
              </div>
            }
          >
            <Form form={form} layout="vertical">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                type="card"
              />

              <Divider />

              <Card size="small" style={{ background: '#f9f9f9', marginBottom: '16px' }}>
                <Title level={5} style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <EyeOutlined /> 价格明细
                </Title>
                <Row style={{ marginBottom: '8px' }}>
                  <Col span={12} style={{ color: '#666' }}>基础单价</Col>
                  <Col span={12} style={{ textAlign: 'right' }}>¥{product.price}</Col>
                </Row>
                <Row style={{ marginBottom: '8px' }}>
                  <Col span={12} style={{ color: '#666' }}>购买数量</Col>
                  <Col span={12} style={{ textAlign: 'right' }}>x {quantity}</Col>
                </Row>
                {calculateExtraPrice() > 0 && (
                  <>
                    <Row style={{ marginBottom: '8px' }}>
                      <Col span={12} style={{ color: '#666' }}>定制附加费</Col>
                      <Col span={12} style={{ textAlign: 'right', color: '#faad14' }}>+¥{calculateExtraPrice()}</Col>
                    </Row>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                      （文字超过10字+5元，超过30字+3元；特殊字体+2元；加粗+1元；字号大于20px+2元）
                    </Text>
                  </>
                )}
                <Divider style={{ margin: '12px 0' }} />
                <Row>
                  <Col span={12} style={{ fontWeight: '500', fontSize: '16px' }}>合计金额</Col>
                  <Col span={12} style={{ textAlign: 'right', color: '#ff4d4f', fontSize: '28px', fontWeight: 'bold' }}>
                    ¥{calculatePrice()}
                  </Col>
                </Row>
              </Card>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Button
                    size="large"
                    onClick={handleReset}
                    block
                    style={{ height: '48px' }}
                  >
                    重置选项
                  </Button>
                </Col>
                <Col xs={24} sm={12}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleSubmit}
                    block
                    style={{ height: '48px', fontSize: '16px' }}
                  >
                    立即下单定制
                  </Button>
                </Col>
              </Row>

              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#999', fontSize: '13px' }}>
                <span><CheckOutlined style={{ color: '#52c41a' }} /> 7天无理由退换</span>
                <span><CheckOutlined style={{ color: '#52c41a' }} /> 品质保证</span>
                <span><CheckOutlined style={{ color: '#52c41a' }} /> 极速发货</span>
                <span><CheckOutlined style={{ color: '#52c41a' }} /> 专业定制</span>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProductDetail
