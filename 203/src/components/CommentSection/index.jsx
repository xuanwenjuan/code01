import { useState } from 'react'
import { useSelector } from 'react-redux'
import { List, Form, Input, Button, Select, Avatar, Empty, message, Typography } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { mockComments } from '@/mock'
import './index.css'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

const CommentSection = () => {
  const { currentUser } = useSelector(state => state.user)
  const [comments, setComments] = useState(mockComments)
  const [form] = Form.useForm()
  const [replyTo, setReplyTo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (values) => {
    if (!currentUser) {
      message.warning('请先登录后再留言')
      return
    }

    setSubmitting(true)
    try {
      const newComment = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.username,
        userAvatar: currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
        content: values.content,
        type: values.type,
        createdAt: new Date().toLocaleString('zh-CN'),
        replies: []
      }

      if (replyTo) {
        setComments(prev => prev.map(c => {
          if (c.id === replyTo) {
            return {
              ...c,
              replies: [...c.replies, {
                id: Date.now(),
                userId: currentUser.id,
                userName: currentUser.username,
                userAvatar: currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
                content: values.content,
                createdAt: new Date().toLocaleString('zh-CN')
              }]
            }
          }
          return c
        }))
        setReplyTo(null)
      } else {
        setComments(prev => [newComment, ...prev])
      }

      form.resetFields()
      message.success(replyTo ? '回复成功' : '留言成功')
    } catch (error) {
      message.error('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const getTypeTag = (type) => {
    const typeMap = {
      question: { color: 'blue', text: '提问' },
      comment: { color: 'green', text: '评论' },
      suggestion: { color: 'orange', text: '建议' }
    }
    return typeMap[type] || { color: 'default', text: '其他' }
  }

  return (
    <div className="comment-section">
      <h3 className="section-title">在线交流区</h3>

      <Form
        form={form}
        onFinish={handleSubmit}
        className="comment-form"
      >
        <Form.Item
          name="type"
          initialValue="comment"
          rules={[{ required: true, message: '请选择留言类型' }]}
        >
          <Select style={{ width: 120 }}>
            <Option value="comment">评论</Option>
            <Option value="question">提问</Option>
            <Option value="suggestion">建议</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="content"
          rules={[
            { required: true, message: '请输入留言内容' },
            { min: 5, message: '留言内容至少5个字符' },
            { max: 500, message: '留言内容最多500个字符' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder={currentUser ? '请输入您的留言...' : '请先登录后留言'}
            disabled={!currentUser}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {replyTo && (
              <span style={{ color: '#666' }}>
                正在回复...
                <Button type="link" size="small" onClick={() => setReplyTo(null)}>取消</Button>
              </span>
            )}
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={submitting}
              disabled={!currentUser}
            >
              {replyTo ? '发送回复' : '提交留言'}
            </Button>
          </div>
        </Form.Item>
      </Form>

      {comments.length > 0 ? (
        <List
          className="comment-list"
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={(item) => {
            const typeInfo = getTypeTag(item.type)
            return (
              <li key={item.id} className="comment-item">
                <div className="comment-wrapper">
                  <Avatar src={item.userAvatar} size="large" className="comment-avatar" />
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author-name">{item.userName}</span>
                      <span className={`comment-type-tag comment-type-${item.type}`}>
                        {typeInfo.text}
                      </span>
                      <span className="comment-datetime">{item.createdAt}</span>
                    </div>
                    <div className="comment-text">{item.content}</div>
                    {currentUser && (
                      <div className="comment-actions">
                        <span
                          className="comment-action"
                          onClick={() => setReplyTo(item.id)}
                        >
                          回复
                        </span>
                      </div>
                    )}
                    {item.replies && item.replies.length > 0 && (
                      <div className="comment-replies">
                        {item.replies.map((reply) => (
                          <div key={reply.id} className="reply-item">
                            <Avatar src={reply.userAvatar} size="small" className="comment-avatar" />
                            <div className="comment-content">
                              <div className="comment-header">
                                <span className="comment-author-name">{reply.userName}</span>
                                <span className="comment-datetime">{reply.createdAt}</span>
                              </div>
                              <div className="comment-text">{reply.content}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          }}
        />
      ) : (
        <Empty description="暂无留言，快来发表第一条评论吧" />
      )}
    </div>
  )
}

export default CommentSection
