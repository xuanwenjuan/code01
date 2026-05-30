import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Card, List, Avatar, Button, Modal, Form, Input,
  DatePicker, Radio, message, Popconfirm
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { addBaby, updateBaby, deleteBaby } from '@/store/slices/babySlice'
import EmptyState from '@/components/Common/EmptyState'
import { calculateAge } from '@/utils'

const Babies = () => {
  const dispatch = useDispatch()
  const { babies } = useSelector(state => state.baby)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingBaby, setEditingBaby] = useState(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingBaby(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (baby) => {
    setEditingBaby(baby)
    form.setFieldsValue({
      ...baby,
      birthday: baby.birthday ? dayjs(baby.birthday) : null
    })
    setModalVisible(true)
  }

  const handleDelete = (babyId) => {
    dispatch(deleteBaby(babyId))
    message.success('删除成功')
  }

  const handleSubmit = (values) => {
    const babyData = {
      ...values,
      birthday: values.birthday?.format('YYYY-MM-DD'),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${values.name || Date.now()}`
    }

    if (editingBaby) {
      dispatch(updateBaby({ id: editingBaby.id, ...babyData }))
      message.success('更新成功')
    } else {
      dispatch(addBaby(babyData))
      message.success('添加成功')
    }

    setModalVisible(false)
    form.resetFields()
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>宝宝信息</h1>
          <p>管理您的宝宝信息</p>
        </div>
      </div>

      <div className="container page-content">
        <Card
          className="card-shadow"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加宝宝
            </Button>
          }
        >
          {babies.length > 0 ? (
            <List
              dataSource={babies}
              renderItem={(baby) => (
                <List.Item
                  actions={[
                    <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => handleEdit(baby)}>
                      编辑
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="确认删除"
                      description="确定要删除这个宝宝信息吗？"
                      onConfirm={() => handleDelete(baby.id)}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar size={64} src={baby.avatar} />}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 18, fontWeight: 600 }}>{baby.name}</span>
                        <span style={{ color: baby.gender === 'boy' ? '#1890ff' : '#ff6b9d' }}>
                          {baby.gender === 'boy' ? '♂ 男宝' : '♀ 女宝'}
                        </span>
                      </div>
                    }
                    description={
                      <div style={{ color: '#666', lineHeight: 1.8 }}>
                        <div>生日：{baby.birthday}（{calculateAge(baby.birthday)}岁）</div>
                        {baby.weight && <div>体重：{baby.weight} kg</div>}
                        {baby.height && <div>身高：{baby.height} cm</div>}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <EmptyState
              description="还没有添加宝宝信息"
              actionText="添加宝宝"
              onAction={handleAdd}
            />
          )}
        </Card>
      </div>

      <Modal
        title={editingBaby ? '编辑宝宝信息' : '添加宝宝'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            label="宝宝姓名"
            name="name"
            rules={[{ required: true, message: '请输入宝宝姓名' }]}
          >
            <Input placeholder="请输入宝宝姓名" />
          </Form.Item>

          <Form.Item
            label="性别"
            name="gender"
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Radio.Group>
              <Radio value="boy">男宝</Radio>
              <Radio value="girl">女宝</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="出生日期"
            name="birthday"
            rules={[{ required: true, message: '请选择出生日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择出生日期" />
          </Form.Item>

          <Form.Item label="体重 (kg)" name="weight">
            <Input type="number" placeholder="请输入体重" />
          </Form.Item>

          <Form.Item label="身高 (cm)" name="height">
            <Input type="number" placeholder="请输入身高" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              {editingBaby ? '保存修改' : '添加'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Babies
