import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  Card, Avatar, Button, Input, Rate, List, 
  message, Divider, Typography, Space 
} from 'antd'
import { LikeOutlined, LikeFilled, SendOutlined } from '@ant-design/icons'
import { addTutorialComment, addWorkComment, likeComment, addCommentReply } from '../store/slices/dataSlice'

const { TextArea } = Input
const { Text } = Typography

const CommentSection = ({ type, itemId }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(state => state.user.currentUser)
  const allComments = useSelector(state => state.data.comments)
  
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [likedComments, setLikedComments] = useState(new Set())

  const comments = allComments[type]?.[itemId] || []

  const handleSubmit = () => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    if (!content.trim()) {
      message.warning('请输入评论内容')
      return
    }

    const newComment = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: content.trim(),
      rating,
      createTime: new Date().toLocaleString('zh-CN'),
      likes: 0,
      replies: []
    }

    if (type === 'tutorials') {
      dispatch(addTutorialComment({ tutorialId: itemId, comment: newComment }))
    } else {
      dispatch(addWorkComment({ workId: itemId, comment: newComment }))
    }

    setContent('')
    setRating(5)
    message.success('评论发布成功')
  }

  const handleLike = (commentId) => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    if (likedComments.has(commentId)) {
      return
    }
    setLikedComments(new Set([...likedComments, commentId]))
    dispatch(likeComment({ type, itemId, commentId }))
  }

  const handleReply = (commentId) => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    if (!replyContent.trim()) {
      message.warning('请输入回复内容')
      return
    }

    const newReply = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: replyContent.trim(),
      createTime: new Date().toLocaleString('zh-CN')
    }

    dispatch(addCommentReply({ type, itemId, commentId, reply: newReply }))
    setReplyContent('')
    setReplyingTo(null)
    message.success('回复成功')
  }

  const CommentItem = ({ comment, isReply = false }) => (
    <div style={{ 
      display: 'flex', 
      gap: 12, 
      paddingBottom: 16, 
      borderBottom: isReply ? 'none' : '1px solid #f0f0f0',
      marginBottom: isReply ? 12 : 16
    }}>
      <Avatar src={comment.userAvatar} size={isReply ? 28 : 36}>
        {comment.userName?.charAt(0)}
      </Avatar>
      <div style={{ flex: 1 }}>
        <Space size="middle" style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 500 }}>{comment.userName}</span>
          {comment.rating && !isReply && (
            <Rate disabled value={comment.rating} size="small" />
          )}
        </Space>
        <p style={{ 
          color: '#333', 
          lineHeight: 1.6, 
          marginBottom: 8, 
          fontSize: isReply ? 13 : 14 
        }}>
          {comment.content}
        </p>
        <Space size="middle" style={{ color: '#999', fontSize: 12 }}>
          <span>{comment.createTime}</span>
          {!isReply && (
            <span 
              style={{ cursor: 'pointer' }}
              onClick={() => handleLike(comment.id)}
            >
              {likedComments.has(comment.id) ? (
                <LikeFilled style={{ color: '#1890ff', marginRight: 4 }} />
              ) : (
                <LikeOutlined style={{ marginRight: 4 }} />
              )}
              {comment.likes}
            </span>
          )}
          {!isReply && (
            <span 
              style={{ cursor: 'pointer' }}
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              回复
            </span>
          )}
        </Space>

        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: 12, paddingLeft: 12, borderLeft: '2px solid #f0f0f0' }}>
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
        
        {!isReply && replyingTo === comment.id && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Avatar src={currentUser?.avatar} size={28}>
              {currentUser?.name?.charAt(0)}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Input
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="写下你的回复..."
                size="small"
                style={{ marginBottom: 8 }}
              />
              <Space>
                <Button 
                  size="small" 
                  type="primary"
                  onClick={() => handleReply(comment.id)}
                >
                  回复
                </Button>
                <Button 
                  size="small"
                  onClick={() => setReplyingTo(null)}
                >
                  取消
                </Button>
              </Space>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Card 
      title={`评论交流 (${comments.length})`} 
      style={{ marginBottom: 24 }}
      extra={
        <Text type="secondary" style={{ fontSize: 12 }}>
          分享您的学习心得和作品评价
        </Text>
      }
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <Avatar src={currentUser?.avatar} size={40}>
            {currentUser?.name?.charAt(0)}
          </Avatar>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ marginRight: 12 }}>评分：</Text>
              <Rate value={rating} onChange={setRating} />
            </div>
            <TextArea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={currentUser ? '分享您的想法...' : '请先登录后发表评论'}
              rows={3}
              disabled={!currentUser}
              style={{ marginBottom: 12 }}
            />
            <div style={{ textAlign: 'right' }}>
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={handleSubmit}
                disabled={!currentUser}
              >
                发表评论
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Divider style={{ margin: '12px 0 24px' }} />

      {comments.length > 0 ? (
        <div>
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          <p>暂无评论，快来发表第一条评论吧！</p>
        </div>
      )}
    </Card>
  )
}

export default CommentSection
