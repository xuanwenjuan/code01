import { Card, Tag, Avatar, Button, Modal, Form, Input, List, message, Tooltip } from 'antd';
import { HeartOutlined, EyeOutlined, MessageOutlined, StarFilled, StarOutlined, ShareAltOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { likeWork, addComment, toggleFavorite, deleteWork } from '../../store/slices/worksSlice';
import './Common.css';

const { Meta } = Card;
const { TextArea } = Input;

const WorkCard = ({ work, showActions = true, showManage = false, onEdit }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.auth);
  const { comments, favorites } = useSelector(state => state.works);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentForm] = Form.useForm();
  const [liked, setLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(favorites.includes(work.id));
  }, [favorites, work.id]);

  const categoryMap = {
    folk: { label: '民俗类', color: 'red' },
    flower: { label: '花鸟类', color: 'green' },
    figure: { label: '人物类', color: 'blue' },
  };

  const workComments = comments.filter(c => c.workId === work.id);

  const isOwner = currentUser && work.authorId === currentUser.id;
  const isAdmin = currentUser && currentUser.role === 'admin';
  const canManage = showManage && (isOwner || isAdmin);

  const handleLike = () => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    if (liked) {
      message.info('您已经点过赞了');
      return;
    }
    dispatch(likeWork(work.id));
    setLiked(true);
    message.success('点赞成功');
  };

  const handleToggleFavorite = () => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    dispatch(toggleFavorite(work.id));
  };

  const handleShare = () => {
    const shareText = `分享剪纸作品《${work.title}》- 传统剪纸技艺数字化展示与交流平台`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      message.success('分享链接已复制到剪贴板');
    } else {
      message.success('分享成功');
    }
  };

  const handleCommentSubmit = (values) => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    dispatch(addComment({
      workId: work.id,
      userId: currentUser.id,
      username: currentUser.nickname,
      avatar: currentUser.avatar,
      content: values.content,
    }));
    commentForm.resetFields();
    message.success('评论发布成功');
  };

  const handleDelete = () => {
    if (!isOwner && !isAdmin) {
      message.error('您没有权限删除此作品');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除作品「${work.title}」吗？此操作不可恢复。`,
      okText: '确定删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        dispatch(deleteWork(work.id));
        setModalVisible(false);
      },
    });
  };

  return (
    <>
      <Card
        className="work-card"
        hoverable
        cover={
          <div className="work-cover" onClick={() => setModalVisible(true)}>
            <img alt={work.title} src={work.image} />
            <div className="work-overlay">
              <span>点击查看详情</span>
            </div>
          </div>
        }
        actions={showActions ? [
          <Tooltip title="点赞">
            <Button 
              type="text" 
              icon={<HeartOutlined style={{ color: liked ? '#ff4d4f' : undefined }} />} 
              onClick={handleLike}
            >
              {work.likes + (liked ? 1 : 0)}
            </Button>
          </Tooltip>,
          <Tooltip title="浏览量">
            <span style={{ padding: '0 8px', color: 'rgba(0,0,0,0.45)' }}>
              <EyeOutlined /> {work.views}
            </span>
          </Tooltip>,
          <Tooltip title="评论">
            <Button type="text" icon={<MessageOutlined />} onClick={() => setModalVisible(true)}>
              {workComments.length}
            </Button>
          </Tooltip>,
          <Tooltip title={isFavorite ? '取消收藏' : '收藏'}>
            <Button 
              type="text" 
              icon={isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />} 
              onClick={handleToggleFavorite}
            >
              {isFavorite ? '已收藏' : '收藏'}
            </Button>
          </Tooltip>,
          <Tooltip title="分享">
            <Button type="text" icon={<ShareAltOutlined />} onClick={handleShare}>
              分享
            </Button>
          </Tooltip>,
          ...(canManage ? [
            <Tooltip title="编辑">
              <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); onEdit && onEdit(work); }}>
                编辑
              </Button>
            </Tooltip>,
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
                删除
              </Button>
            </Tooltip>,
          ] : []),
        ] : undefined}
      >
        <Meta
          title={<span className="work-title">{work.title}</span>}
          description={
            <div className="work-meta">
              <div className="work-category">
                {categoryMap[work.category] && (
                  <Tag color={categoryMap[work.category].color}>
                    {categoryMap[work.category].label}
                  </Tag>
                )}
                {work.tags?.slice(0, 2).map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </div>
              <div className="work-author">
                <Avatar size="small" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${work.author}`} />
                <span>{work.author}</span>
              </div>
            </div>
          }
        />
      </Card>

      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{work.title}</span>
            {canManage && (
              <div>
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => { setModalVisible(false); onEdit && onEdit(work); }}
                >
                  编辑
                </Button>
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={handleDelete}
                >
                  删除
                </Button>
              </div>
            )}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <div className="work-detail">
          <div className="work-detail-image">
            <img src={work.image} alt={work.title} />
          </div>
          <div className="work-detail-info">
            <div className="work-detail-tags">
              {categoryMap[work.category] && (
                <Tag color={categoryMap[work.category].color}>
                  {categoryMap[work.category].label}
                </Tag>
              )}
              {work.tags?.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </div>
            <p className="work-description">{work.description}</p>
            <div className="work-detail-stats">
              <span><HeartOutlined /> {work.likes} 点赞</span>
              <span><EyeOutlined /> {work.views} 浏览</span>
              <span><MessageOutlined /> {workComments.length} 评论</span>
              <span>作者：{work.author}</span>
              <span>发布于：{work.createdAt}</span>
            </div>
            <div className="work-detail-actions">
              <Button 
                type={isFavorite ? 'primary' : 'default'}
                icon={isFavorite ? <StarFilled /> : <StarOutlined />}
                onClick={handleToggleFavorite}
              >
                {isFavorite ? '已收藏' : '收藏作品'}
              </Button>
              <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                分享作品
              </Button>
            </div>
          </div>

          <div className="work-comments">
            <h4>评论互动 ({workComments.length})</h4>
            {currentUser ? (
              <Form form={commentForm} onFinish={handleCommentSubmit} className="comment-form">
                <Form.Item 
                  name="content" 
                  rules={[
                    { required: true, message: '请输入评论内容' },
                    { min: 2, max: 200, message: '评论长度为2-200个字符' },
                    { 
                      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9，。！？、；：""''（）《》【】\s]+$/,
                      message: '评论只能包含中文、英文、数字和常用标点符号'
                    }
                  ]}
                >
                  <TextArea 
                    rows={3} 
                    placeholder="写下你的评论，分享你的见解和感受..." 
                    maxLength={200} 
                    showCount 
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit">
                    发表评论
                  </Button>
                </Form.Item>
              </Form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
                <p>请先登录后发表评论</p>
              </div>
            )}
            {workComments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                暂无评论，快来发表第一条评论吧！
              </div>
            ) : (
              <List
                className="comment-list"
                dataSource={workComments}
                renderItem={item => (
                  <List.Item key={item.id} className="comment-item">
                    <List.Item.Meta
                      avatar={<Avatar src={item.avatar} />}
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 500 }}>{item.username}</span>
                          <span style={{ fontSize: '12px', color: '#999' }}>{item.createdAt}</span>
                        </div>
                      }
                      description={item.content}
                    />
                    <div className="comment-actions">
                      <Button type="text" size="small" icon={<HeartOutlined />}>
                        {item.likes}
                      </Button>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default WorkCard;
