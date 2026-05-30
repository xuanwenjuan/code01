import { useEffect, useState } from 'react'
import {
  Table,
  Tag,
  Select,
  Input,
  Space,
  Card,
  Button,
  Rate,
  Image,
  Form,
  Divider,
  Row,
  Col,
  Statistic,
  Progress,
  message,
} from 'antd'
import { SearchOutlined, MessageOutlined, EditOutlined, CommentOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import useStore from '../store'
import { reviews as mockReviews } from '../mock'
import { Review, ReviewType } from '../types'
import CommonModal from './CommonModal'
import CommonForm from './CommonForm'

const { Option } = Select
const { TextArea } = Input

const reviewTypeMap: Record<ReviewType, { text: string; color: string }> = {
  good: { text: '好评', color: 'green' },
  neutral: { text: '中评', color: 'orange' },
  bad: { text: '差评', color: 'red' },
}

const ReviewManagement: React.FC = () => {
  const { reviews, setReviews, updateReviewReply } = useStore()
  const [typeFilter, setTypeFilter] = useState<ReviewType | 'all'>('all')
  const [searchText, setSearchText] = useState('')
  const [replyModalOpen, setReplyModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (reviews.length === 0) {
      setReviews(mockReviews)
    }
  }, [])

  const getReviewStats = () => {
    const total = reviews.length
    const goodCount = reviews.filter((r) => r.type === 'good').length
    const neutralCount = reviews.filter((r) => r.type === 'neutral').length
    const badCount = reviews.filter((r) => r.type === 'bad').length
    const repliedCount = reviews.filter((r) => r.reply).length
    const replyRate = total > 0 ? Math.round((repliedCount / total) * 100) : 0
    const avgRating =
      total > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : '0'

    return { total, goodCount, neutralCount, badCount, repliedCount, replyRate, avgRating }
  }

  const stats = getReviewStats()

  const handleReplyOk = async () => {
    try {
      const values = await form.validateFields()
      if (selectedReview) {
        updateReviewReply(selectedReview.id, values.reply)
        message.success(selectedReview.reply ? '回复更新成功' : '回复成功')
      }
      setReplyModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const filteredReviews = reviews.filter((review) => {
    const matchType = typeFilter === 'all' || review.type === typeFilter
    const matchSearch =
      review.productName.toLowerCase().includes(searchText.toLowerCase()) ||
      review.buyerName.includes(searchText) ||
      review.content.toLowerCase().includes(searchText.toLowerCase())
    return matchType && matchSearch
  })

  const columns: ColumnsType<Review> = [
    {
      title: '商品',
      dataIndex: 'productId',
      key: 'product',
      width: 240,
      fixed: 'left',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image
            width={50}
            height={50}
            src={record.productImage}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
          <span ellipsis style={{ maxWidth: 150 }}>
            {record.productName}
          </span>
        </div>
      ),
    },
    {
      title: '买家',
      dataIndex: 'buyerName',
      key: 'buyerName',
      width: 100,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 140,
      render: (rating: number) => (
        <div>
          <Rate disabled value={rating} allowHalf style={{ fontSize: 14 }} />
          <span style={{ marginLeft: 8, color: '#666' }}>{rating}分</span>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: ReviewType) => {
        const { text, color } = reviewTypeMap[type]
        return (
          <Tag color={color} style={{ margin: 0 }}>
            {text}
          </Tag>
        )
      },
    },
    {
      title: '评价内容',
      dataIndex: 'content',
      key: 'content',
      width: 250,
      ellipsis: true,
    },
    {
      title: '商家回复',
      dataIndex: 'reply',
      key: 'reply',
      width: 180,
      ellipsis: true,
      render: (reply) =>
        reply ? (
          <Space>
            <CommentOutlined style={{ color: '#52c41a' }} />
            <span>已回复</span>
          </Space>
        ) : (
          <span style={{ color: '#999' }}>待回复</span>
        ),
    },
    {
      title: '追评',
      dataIndex: 'hasFollowUp',
      key: 'hasFollowUp',
      width: 80,
      render: (has) => (has ? <Tag color="purple">有追评</Tag> : '-'),
    },
    {
      title: '评价时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record: Review) => (
        <Button
          type="link"
          size="small"
          icon={record.reply ? <EditOutlined /> : <MessageOutlined />}
          onClick={() => {
            setSelectedReview(record)
            form.setFieldsValue({ reply: record.reply })
            setReplyModalOpen(true)
          }}
        >
          {record.reply ? '编辑回复' : '回复'}
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card title="评价管理">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card size="small">
              <Statistic
                title="总评价"
                value={stats.total}
                valueStyle={{ color: '#1890ff', fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card size="small">
              <Statistic
                title="平均评分"
                value={stats.avgRating}
                suffix="分"
                valueStyle={{ color: '#faad14', fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card size="small">
              <Statistic
                title="好评数"
                value={stats.goodCount}
                valueStyle={{ color: '#52c41a', fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card size="small">
              <div>
                <div style={{ marginBottom: 4, color: '#666' }}>回复率</div>
                <Progress percent={stats.replyRate} size="small" status="active" />
                <div style={{ textAlign: 'right', fontSize: 12, color: '#666' }}>
                  {stats.repliedCount}/{stats.total}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="搜索商品/买家/评价内容"
              prefix={<SearchOutlined />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="评价类型"
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={(value) => setTypeFilter(value as ReviewType | 'all')}
              allowClear
            >
              <Option value="all">全部评价</Option>
              {Object.entries(reviewTypeMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredReviews}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条评价`,
          }}
          scroll={{ x: 'max-content' }}
          size="middle"
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '0 20px' }}>
                <Divider orientation="left" orientationMargin="0">
                  评价详情
                </Divider>
                <p style={{ marginBottom: 12, lineHeight: 1.6 }}>{record.content}</p>
                {record.images && record.images.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {record.images.map((img, index) => (
                      <Image
                        key={index}
                        width={100}
                        height={100}
                        src={img}
                        style={{ borderRadius: 4 }}
                      />
                    ))}
                  </div>
                )}

                {record.hasFollowUp && (
                  <>
                    <Divider orientation="left" orientationMargin="0">
                      追评
                    </Divider>
                    <p style={{ marginBottom: 12, lineHeight: 1.6 }}>{record.followUpContent}</p>
                    {record.followUpImages && record.followUpImages.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {record.followUpImages.map((img, index) => (
                          <Image
                            key={index}
                            width={100}
                            height={100}
                            src={img}
                            style={{ borderRadius: 4 }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {record.reply && (
                  <>
                    <Divider orientation="left" orientationMargin="0">
                      商家回复
                    </Divider>
                    <div
                      style={{
                        background: '#f6ffed',
                        padding: 16,
                        borderRadius: 4,
                        border: '1px solid #b7eb8f',
                      }}
                    >
                      <p style={{ marginBottom: 8, lineHeight: 1.6 }}>{record.reply}</p>
                      {record.replyTime && (
                        <span style={{ fontSize: 12, color: '#999' }}>回复时间: {record.replyTime}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ),
          }}
        />
      </Card>

      <CommonModal
        title={selectedReview?.reply ? '编辑回复' : '回复评价'}
        open={replyModalOpen}
        onCancel={() => {
          setReplyModalOpen(false)
          form.resetFields()
        }}
        onOk={handleReplyOk}
        width={600}
      >
        {selectedReview && (
          <div>
            <Card
              size="small"
              style={{
                marginBottom: 16,
                background: '#fafafa',
                border: '1px solid #e8e8e8',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Image
                  width={40}
                  height={40}
                  src={selectedReview.productImage}
                  style={{ borderRadius: 4 }}
                />
                <span style={{ fontWeight: 500 }}>{selectedReview.productName}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#666' }}>买家：</span>
                {selectedReview.buyerName}
              </div>
              <Rate disabled value={selectedReview.rating} allowHalf style={{ fontSize: 14 }} />
              <Divider style={{ margin: '12px 0' }} />
              <p style={{ lineHeight: 1.6, margin: 0 }}>{selectedReview.content}</p>
            </Card>
            <CommonForm form={form} layout="vertical">
              <Form.Item
                name="reply"
                label="商家回复"
                rules={[{ required: true, message: '请输入回复内容' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="请输入您的回复，注意礼貌用语，体现服务态度..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </CommonForm>
          </div>
        )}
      </CommonModal>
    </div>
  )
}

export default ReviewManagement
