import { useState, useEffect } from 'react';
import { Card, List, Avatar, Button, Input, Form, Tag, message, Typography } from 'antd';
import { MessageOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, addMessage, addReply } from '@/store/messagesSlice';
import Loading from './Loading';
import './MessageBoard.css';

const { TextArea } = Input;
const { Text } = Typography;

const MessageBoard = ({ techniqueId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { list: messages, loading } = useSelector(state => state.messages);
  const [replyTo, setReplyTo] = useState(null);
  const [form] = Form.useForm();
  const [replyForm] = Form.useForm();

  useEffect(() => {
    if (techniqueId) {
      dispatch(fetchMessages(techniqueId));
    }
  }, [dispatch, techniqueId]);

  const handleSubmit = values => {
    if (!user) {
      message.warning('请先登录后再留言');
      navigate('/login');
      return;
    }
    dispatch(addMessage({ techniqueId, content: values.content, user }));
    form.resetFields();
    message.success('留言成功');
  };

  const handleReply = (messageId, values) => {
    if (!user) {
      message.warning('请先登录后再回复');
      navigate('/login');
      return;
    }
    dispatch(addReply({ messageId, content: values.replyContent, user }));
    replyForm.resetFields();
    setReplyTo(null);
    message.success('回复成功');
  };

  if (loading) {
    return <Loading text="加载留言中..." />;
  }

  return (
    <Card
      className="message-board"
      title={
        <div className="board-header">
          <MessageOutlined className="board-icon" />
          <span>在线留言咨询</span>
          <Tag color="blue">{messages.length} 条留言</Tag>
        </div>
      }
    >
      <Form form={form} onFinish={handleSubmit} className="message-form">
        <Form.Item
          name="content"
          rules={[{ required: true, message: '请输入留言内容' }]}
        >
          <TextArea
            rows={4}
            placeholder="请输入您的问题或留言..."
            maxLength={500}
            showCount
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            block
          >
            发表留言
          </Button>
        </Form.Item>
      </Form>

      <div className="messages-list">
        {messages.length > 0 ? (
          <List
            dataSource={messages}
            renderItem={item => (
              <List.Item key={item.id} className="message-item">
                <List.Item.Meta
                  avatar={<Avatar src={item.userAvatar} icon={<UserOutlined />} />}
                  title={
                    <div className="message-title">
                      <span className="user-name">{item.userName}</span>
                      <span className="message-time">{item.time}</span>
                    </div>
                  }
                  description={
                    <div className="message-content">
                      <p>{item.content}</p>
                      {item.replies && item.replies.length > 0 && (
                        <div className="replies">
                          {item.replies.map(reply => (
                            <div key={reply.id} className="reply-item">
                              <div className="reply-header">
                                <Avatar size="small" src={reply.userAvatar} />
                                <span className="reply-name">
                                  {reply.userName}
                                  {reply.isAdmin && (
                                    <Tag color="gold" size="small">官方</Tag>
                                  )}
                                </span>
                                <span className="reply-time">{reply.time}</span>
                              </div>
                              <p className="reply-content">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="message-actions">
                        <Button
                          type="text"
                          size="small"
                          onClick={() => setReplyTo(replyTo === item.id ? null : item.id)}
                        >
                          {replyTo === item.id ? '取消回复' : '回复'}
                        </Button>
                      </div>
                      {replyTo === item.id && (
                        <Form
                          form={replyForm}
                          onFinish={values => handleReply(item.id, values)}
                          className="reply-form"
                        >
                          <Form.Item
                            name="replyContent"
                            rules={[{ required: true, message: '请输入回复内容' }]}
                            style={{ marginBottom: 8 }}
                          >
                            <TextArea
                              rows={2}
                              placeholder="输入回复内容..."
                              maxLength={300}
                            />
                          </Form.Item>
                          <Form.Item style={{ marginBottom: 0 }}>
                            <Button type="primary" size="small" htmlType="submit">
                              发送回复
                            </Button>
                          </Form.Item>
                        </Form>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="empty-messages">
            <MessageOutlined className="empty-icon" />
            <p>暂无留言，快来发表第一条留言吧！</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MessageBoard;
