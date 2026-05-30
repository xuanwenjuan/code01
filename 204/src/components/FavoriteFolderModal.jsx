import React, { useState } from 'react'
import { Modal, Form, Input, Button, List, Popconfirm, message, Empty } from 'antd'
import { FolderOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'

const FavoriteFolderModal = ({ visible, onClose, folders, onCreateFolder, onUpdateFolder, onDeleteFolder, onAddToFolder, tutorialId, tutorials }) => {
  const [form] = Form.useForm()
  const [editingFolder, setEditingFolder] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleSubmit = (values) => {
    if (editingFolder) {
      onUpdateFolder(editingFolder.id, values)
      message.success('收藏夹更新成功')
    } else {
      onCreateFolder(values)
      message.success('收藏夹创建成功')
    }
    setShowCreateForm(false)
    setEditingFolder(null)
    form.resetFields()
  }

  const handleEdit = (folder) => {
    setEditingFolder(folder)
    form.setFieldsValue(folder)
    setShowCreateForm(true)
  }

  const handleDelete = (folderId) => {
    onDeleteFolder(folderId)
    message.success('收藏夹删除成功')
  }

  const handleAddToFolder = (folderId) => {
    onAddToFolder(folderId, tutorialId)
    message.success('已添加到收藏夹')
    onClose()
  }

  const getFolderTutorials = (folder) => {
    if (!tutorials || !folder.tutorials) return []
    return tutorials.filter(t => folder.tutorials.includes(t.id))
  }

  return (
    <Modal
      title={tutorialId ? '选择收藏夹' : '管理收藏夹'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {!showCreateForm && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>共 {folders.length} 个收藏夹</span>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="small"
            onClick={() => {
              setEditingFolder(null)
              form.resetFields()
              setShowCreateForm(true)
            }}
          >
            新建收藏夹
          </Button>
        </div>
      )}

      {showCreateForm ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="收藏夹名称"
            rules={[{ required: true, message: '请输入收藏夹名称' }]}
          >
            <Input placeholder="请输入收藏夹名称" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="description"
            label="收藏夹描述"
          >
            <Input.TextArea rows={3} placeholder="请输入收藏夹描述（选填）" maxLength={100} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button 
              onClick={() => {
                setShowCreateForm(false)
                setEditingFolder(null)
                form.resetFields()
              }} 
              style={{ marginRight: 8 }}
            >
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              {editingFolder ? '保存修改' : '创建收藏夹'}
            </Button>
          </Form.Item>
        </Form>
      ) : (
        folders.length > 0 ? (
          <List
            dataSource={folders}
            renderItem={folder => (
              <List.Item
                key={folder.id}
                actions={tutorialId ? [
                  <Button 
                    type="primary" 
                    size="small"
                    disabled={folder.tutorials?.includes(tutorialId)}
                    onClick={() => handleAddToFolder(folder.id)}
                  >
                    {folder.tutorials?.includes(tutorialId) ? '已收藏' : '收藏'}
                  </Button>
                ] : [
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(folder)}
                  />,
                  !folder.isDefault && (
                    <Popconfirm
                      title="确定删除这个收藏夹吗？"
                      onConfirm={() => handleDelete(folder.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button 
                        type="text" 
                        size="small" 
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  )
                ]}
              >
                <List.Item.Meta
                  avatar={<FolderOutlined style={{ fontSize: 24, color: '#2d5a27' }} />}
                  title={
                    <span>
                      {folder.name}
                      {folder.isDefault && (
                        <span style={{ marginLeft: 8, fontSize: 12, color: '#faad14' }}>（默认）</span>
                      )}
                    </span>
                  }
                  description={
                    <div>
                      <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>
                        {folder.description || '暂无描述'}
                      </div>
                      <div style={{ color: '#999', fontSize: 12 }}>
                        {folder.tutorials?.length || 0} 个教程 · 创建于 {folder.createTime}
                      </div>
                    </div>
                  }
                />
                {!tutorialId && getFolderTutorials(folder).length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {getFolderTutorials(folder).slice(0, 3).map(t => (
                      <div 
                        key={t.id}
                        style={{
                          width: 60,
                          height: 40,
                          background: `url(${t.cover}) center/cover`,
                          borderRadius: 4
                        }}
                      />
                    ))}
                    {getFolderTutorials(folder).length > 3 && (
                      <div style={{ 
                        width: 60, 
                        height: 40, 
                        background: '#f5f5f5',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        color: '#999'
                      }}>
                        +{getFolderTutorials(folder).length - 3}
                      </div>
                    )}
                  </div>
                )}
              </List.Item>
            )}
          />
        ) : (
          <Empty description="还没有收藏夹" style={{ padding: '40px 0' }} />
        )
      )}
    </Modal>
  )
}

export default FavoriteFolderModal
