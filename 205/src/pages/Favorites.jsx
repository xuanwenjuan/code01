import { useEffect, useState } from 'react';
import { Row, Col, Typography, Button, Modal, Input, Tag, Select, Popconfirm, message } from 'antd';
import { PlusOutlined, TagOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites } from '@/store/userSlice';
import { addFavoriteTag, deleteFavoriteTag, setItemTag, logOperation } from '@/store/platformSlice';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import WorkCard from '@/components/WorkCard';
import './Favorites.css';

const { Title } = Typography;
const { Option } = Select;

const colorOptions = [
  '#d4af37', '#1890ff', '#52c41a', '#eb2f96', '#722ed1',
  '#fa8c16', '#f5222d', '#13c2c2', '#2f54eb', '#a0d911',
];

const Favorites = () => {
  const dispatch = useDispatch();
  const { favorites, loading } = useSelector(state => state.user);
  const { favoriteTags, taggedFavorites } = useSelector(state => state.platform);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#d4af37');
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [editTagModalVisible, setEditTagModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      message.warning('请输入标签名称');
      return;
    }
    dispatch(addFavoriteTag({ name: newTagName.trim(), color: newTagColor }));
    dispatch(logOperation({
      action: 'add_tag',
      detail: `添加收藏标签: ${newTagName.trim()}`,
    }));
    message.success('标签添加成功');
    setNewTagName('');
    setTagModalVisible(false);
  };

  const handleDeleteTag = tagId => {
    dispatch(deleteFavoriteTag(tagId));
    dispatch(logOperation({
      action: 'delete_tag',
      detail: `删除收藏标签`,
    }));
    message.success('标签已删除');
  };

  const handleSetWorkTag = (workId, tagId) => {
    dispatch(setItemTag({ itemKey: `work_${workId}`, tagId }));
    dispatch(logOperation({
      action: 'set_item_tag',
      itemId: workId,
      itemType: 'work',
      detail: `为作品设置标签`,
    }));
    setEditTagModalVisible(false);
    setEditingWorkId(null);
  };

  const getFilteredFavorites = () => {
    if (selectedTagFilter === 'all') return favorites;
    if (selectedTagFilter === 'untagged') {
      return favorites.filter(f => !taggedFavorites[`work_${f.id}`]);
    }
    return favorites.filter(f => taggedFavorites[`work_${f.id}`] === selectedTagFilter);
  };

  const getWorkTag = workId => {
    const tagId = taggedFavorites[`work_${workId}`];
    return favoriteTags.find(t => t.id === tagId);
  };

  const filteredFavorites = getFilteredFavorites();

  if (loading) {
    return <Loading text="加载中..." />;
  }

  return (
    <div className="favorites-page">
      <div className="page-header">
        <Title level={3} className="page-title">
          我的收藏
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setTagModalVisible(true)}
        >
          新建标签
        </Button>
      </div>

      <div className="tag-filter-bar">
        <Tag
          className={selectedTagFilter === 'all' ? 'filter-tag active' : 'filter-tag'}
          onClick={() => setSelectedTagFilter('all')}
        >
          全部 ({favorites.length})
        </Tag>
        <Tag
          className={selectedTagFilter === 'untagged' ? 'filter-tag active' : 'filter-tag'}
          onClick={() => setSelectedTagFilter('untagged')}
        >
          未分类 ({favorites.filter(f => !taggedFavorites[`work_${f.id}`]).length})
        </Tag>
        {favoriteTags.map(tag => (
          <Tag
            key={tag.id}
            color={tag.color}
            className={selectedTagFilter === tag.id ? 'filter-tag active' : 'filter-tag'}
            onClick={() => setSelectedTagFilter(tag.id)}
            closable
            onClose={e => {
              e.stopPropagation();
              handleDeleteTag(tag.id);
            }}
          >
            {tag.name} ({favorites.filter(f => taggedFavorites[`work_${f.id}`] === tag.id).length})
          </Tag>
        ))}
      </div>

      {filteredFavorites.length > 0 ? (
        <Row gutter={[24, 24]}>
          {filteredFavorites.map(work => {
            const workTag = getWorkTag(work.id);
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
                <div className="favorite-item">
                  <WorkCard work={work} />
                  <div className="favorite-item-actions">
                    {workTag ? (
                      <Tag color={workTag.color}>{workTag.name}</Tag>
                    ) : (
                      <Tag className="untagged-tag">未分类</Tag>
                    )}
                    <Button
                      type="link"
                      size="small"
                      icon={<TagOutlined />}
                      onClick={() => {
                        setEditingWorkId(work.id);
                        setEditTagModalVisible(true);
                      }}
                    >
                      设置标签
                    </Button>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      ) : (
        <EmptyState description={selectedTagFilter === 'all' ? '您还没有收藏任何作品' : '该分类下暂无作品'} />
      )}

      <Modal
        title="新建收藏标签"
        open={tagModalVisible}
        onOk={handleAddTag}
        onCancel={() => setTagModalVisible(false)}
        okText="创建"
        cancelText="取消"
      >
        <div className="tag-form">
          <div className="form-item">
            <label>标签名称</label>
            <Input
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              placeholder="请输入标签名称"
              maxLength={10}
            />
          </div>
          <div className="form-item">
            <label>标签颜色</label>
            <div className="color-picker">
              {colorOptions.map(color => (
                <div
                  key={color}
                  className={`color-option ${newTagColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewTagColor(color)}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title="设置标签"
        open={editTagModalVisible}
        onCancel={() => {
          setEditTagModalVisible(false);
          setEditingWorkId(null);
        }}
        footer={null}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="选择标签"
          value={editingWorkId ? taggedFavorites[`work_${editingWorkId}`] : undefined}
          onChange={value => handleSetWorkTag(editingWorkId, value)}
          allowClear
        >
          {favoriteTags.map(tag => (
            <Option key={tag.id} value={tag.id}>
              <Tag color={tag.color}>{tag.name}</Tag>
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default Favorites;
