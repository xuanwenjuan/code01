import { useState, useEffect } from 'react'
import { Form, Input, Button, List, Avatar, Card, Space, Tag, message, Popconfirm } from 'antd'
import {
  CommentOutlined,
  SendOutlined,
  DeleteOutlined,
  UserOutlined,
  LikeOutlined
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { validateRequired } from '../../utils/validators'
import dayjs from 'dayjs'

const { TextArea } = Input

const MessageBoard = ({ techniqueId }) => {
  const { user } = useSelector(state => state.auth)
  const [form] = Form.useForm()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const getStoredMessages = () => {
    const stored = localStorage.getItem(`technique_messages_${techniqueId}`)
    return stored ? JSON.parse(stored) : []
  }

  useEffect(() => {
    setMessages(getStoredMessages())
  }, [techniqueId])

  const handleSubmit = async (values) => {
    if (!user) {
      message.warning('请先登录后再留言')
      return
    }

    setLoading(true)
    try {
      const newMessage = {
        id: Date.now(),
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: values.content,
        likes: 0,
        createdAt: new Date().toISOString(),
        replies: []
      }

      const allMessages = getStoredMessages()
      allMessages.unshift(newMessage)
      localStorage.setItem(`technique_messages_${techniqueId}`, JSON.stringify(allMessages))
      setMessages(allMessages)
      form.resetFields()
      message.success('留言发表成功！')
    } catch (err) {
      message.error('留言发表失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (messageId) => {
    const allMessages = getStoredMessages()
    const filtered = allMessages.filter(m => m.id !== messageId)
    localStorage.setItem(`technique_messages_${techniqueId}`, JSON.stringify(filtered))
    setMessages(filtered)
    message.success('删除成功')
  }

  const handleLike = (messageId) => {
    const allMessages = getStoredMessages()
    const updated = allMessages.map(m =>
      m.id === messageId ? { ...m, likes: m.likes + 1 } : m
    )
    localStorage.setItem(`technique_messages_${techniqueId}`, JSON.stringify(updated))
    setMessages(updated)
  }

  const handleReply = (messageId, replyContent) => {
    if (!user) {
      message.warning('请先登录后再回复')
      return
    }

    const allMessages = getStoredMessages()
    const updated = allMessages.map(m => {
      if (m.id === messageId) {
        return {
          ...m,
          replies: [
            ...m.replies,
            {
              id: Date.now(),
              userId: user.id,
              userName: user.name,
              userAvatar: user.avatar,
              content: replyContent,
              createdAt: new Date().toISOString()
            }
          ]
        }
      }
      return m
    })
    localStorage.setItem(`technique_messages_${techniqueId}`, JSON.stringify(updated))
    setMessages(updated)
    message.success('回复成功')
  }

  const ReplyForm = ({ messageId, onCancel }) => {
    const [replyForm] = Form.useForm()

    const handleReplySubmit = (values) => {
      handleReply(messageId, values.replyContent)
      onCancel()
    }

    return (
      <Form
        form={replyForm}
        onFinish={handleReplySubmit}
        size="small"
        style={{ marginTop: 12, paddingLeft: 48 }}
      >
        <Form.Item
          name="replyContent"
          rules={[validateRequired('请输入回复内容')]}
          style={{ marginBottom: 8 }}
        >
          <TextArea
            rows={2}
            placeholder="写下你的回复..."
            maxLength={200}
            showCount
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button size="small" onClick={onCancel}>取消</Button>
            <Button size="small" type="primary" htmlType="submit">
              回复
            </Button>
          </Space>
        </Form.Item>
      </Form>
    )
  }

  const [replyingTo, setReplyingTo] = useState(null)

  return (
    <Card
      title={
        <Space>
          <CommentOutlined />
          <span>技法疑问交流</span>
          <Tag color="blue">{messages.length} 条留言</Tag>
        </Space>
      }
      variant="outlined"
      style={{ marginTop: 24 }}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="content"
          rules={[
            validateRequired('请输入留言内容'),
            { min: 5, message: '留言内容至少5个字符' },
            { max: 500, message: '留言内容最多500个字符' }
          ]}
          style={{ marginBottom: 12 }}
        >
          <TextArea
            rows={4}
            placeholder={user ? "分享你的疑问、经验或心得..." : "请先登录后再留言"}
            maxLength={500}
            showCount
            disabled={!user}
          />
        </Form.Item>
        <div style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SendOutlined />}
            disabled={!user}
          >
            发表留言
          </Button>
        </div>
      </Form>

      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          <CommentOutlined style={{ fontSize: 48, marginBottom: 12 }} />
          <p>暂无留言，来发表第一条留言吧！</p>
        </div>
      ) : (
        <List
          dataSource={messages}
          itemLayout="vertical"
          renderItem={item => (
            <List.Item
              key={item.id}
              style={{ borderBottom: '1px solid #f0f0f0', padding: '16px 0' }}
              actions={[
                <span
                  key="like"
                  style={{ cursor: 'pointer', color: '#8c8c8c' }}
                  onClick={() => handleLike(item.id)}
                >
                  <LikeOutlined style={{ marginRight: 4 }} />
                  {item.likes}
                </span>,
                <span
                  key="reply"
                  style={{ cursor: 'pointer', color: '#8c8c8c' }}
                  onClick={() => setReplyingTo(replyingTo === item.id ? null : item.id)}
                >
                  回复
                </span>,
                user?.id === item.userId && (
                  <Popconfirm
                    key="delete"
                    title="确定删除这条留言吗？"
                    onConfirm={() => handleDelete(item.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <span style={{ cursor: 'pointer', color: '#ff4d4f' }}>
                      <DeleteOutlined /> 删除
                    </span>
                  </Popconfirm>
                )
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={item.userAvatar} icon={<UserOutlined />} />}
                title={
                  <Space>
                    <span style={{ fontWeight: 500 }}>{item.userName}</span>
                    <Tag color="default" style={{ fontSize: 12 }}>
                      {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                    </Tag>
                  </Space>
                }
                description={
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {item.content}
                  </div>
                }
              />
              {replyingTo === item.id && (
                <ReplyForm
                  messageId={item.id}
                  onCancel={() => setReplyingTo(null)}
                />
              )}
              {item.replies?.length > 0 && (
                <div style={{ marginTop: 12, paddingLeft: 48 }}>
                  {item.replies.map(reply => (
                    <div
                      key={reply.id}
                      style={{
                        background: '#fafafa',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 8
                      }}
                    >
                      <Space style={{ marginBottom: 4 }}>
                        <Avatar size="small" src={reply.userAvatar} icon={<UserOutlined />} />
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{reply.userName}</span>
                        <span style={{ color: '#999', fontSize: 12 }}>
                          {dayjs(reply.createdAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                      </Space>
                      <div style={{ fontSize: 14, marginLeft: 32 }}>
                        {reply.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}

export default MessageBoard
