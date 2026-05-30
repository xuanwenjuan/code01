import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Card, List, Button, Modal, Form, Input, Select, Radio, DatePicker, InputNumber, message, Space, Image,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { addPet, updatePet, deletePet } from '@/store/slices/petSlice'
import { validateRequired } from '@/utils/validate'
import PageState from '@/components/common/PageState'
import { getPetTypeText } from '@/utils'

const { Option } = Select
const { TextArea } = Input

const MyPets = () => {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.user)
  const { pets } = useSelector((state) => state.pet)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [form] = Form.useForm()

  const userPets = useMemo(() => {
    return pets.filter((p) => p.userId === currentUser?.id)
  }, [pets, currentUser])

  const handleAdd = () => {
    setEditingPet(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (pet) => {
    setEditingPet(pet)
    form.setFieldsValue({
      ...pet,
      birthday: pet.birthday ? dayjs(pet.birthday) : null,
    })
    setModalVisible(true)
  }

  const handleDelete = (petId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这只宠物的信息吗？',
      onOk: () => {
        dispatch(deletePet(petId))
        message.success('删除成功')
      },
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const petData = {
        ...values,
        userId: currentUser.id,
        birthday: values.birthday ? values.birthday.toISOString() : null,
      }

      if (editingPet) {
        dispatch(updatePet({ id: editingPet.id, ...petData }))
        message.success('修改成功')
      } else {
        dispatch(addPet(petData))
        message.success('添加成功')
      }

      setModalVisible(false)
    } catch (error) {
      console.log('Submit failed:', error)
    }
  }

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <Card
        title="我的宠物"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加宠物
          </Button>
        }
      >
        <PageState data={userPets} emptyText="暂无宠物信息，快去添加吧">
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={userPets}
            renderItem={(pet) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 160, overflow: 'hidden' }}>
                      <Image
                        src={pet.avatar || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop'}
                        alt={pet.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  }
                  actions={[
                    <EditOutlined key="edit" onClick={() => handleEdit(pet)} />,
                    <DeleteOutlined key="delete" onClick={() => handleDelete(pet.id)} />,
                  ]}
                >
                  <Card.Meta
                    title={
                      <Space>
                        <span style={{ fontSize: 16, fontWeight: 600 }}>{pet.name}</span>
                        <span style={{ fontSize: 12, color: '#999' }}>{getPetTypeText(pet.type)}</span>
                      </Space>
                    }
                    description={
                      <div style={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>
                        <div>品种：{pet.breed}</div>
                        <div>年龄：{pet.age}岁</div>
                        <div>体重：{pet.weight}kg</div>
                        {pet.description && (
                          <div className="text-ellipsis-2" style={{ marginTop: 4 }}>
                            {pet.description}
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        </PageState>
      </Card>

      <Modal
        title={editingPet ? '编辑宠物' : '添加宠物'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText={editingPet ? '保存修改' : '添加宠物'}
        width={600}
      >
        <Form form={form} layout="vertical">
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Image
              width={80}
              height={80}
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop"
              style={{ borderRadius: '50%' }}
            />
          </div>

          <Form.Item
            name="name"
            label="宠物名字"
            rules={[{ validator: validateRequired('请输入宠物名字') }]}
          >
            <Input placeholder="请输入宠物名字" />
          </Form.Item>

          <Form.Item
            name="type"
            label="宠物类型"
            rules={[{ validator: validateRequired('请选择宠物类型') }]}
          >
            <Select placeholder="请选择宠物类型">
              <Option value="dog">狗狗</Option>
              <Option value="cat">猫咪</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="breed"
            label="品种"
            rules={[{ validator: validateRequired('请输入品种') }]}
          >
            <Input placeholder="例如：泰迪、英短" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="gender"
              label="性别"
              style={{ flex: 1 }}
              rules={[{ validator: validateRequired('请选择性别') }]}
            >
              <Radio.Group>
                <Radio.Button value="male">公</Radio.Button>
                <Radio.Button value="female">母</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="age"
              label="年龄（岁）"
              style={{ flex: 1 }}
              rules={[{ validator: validateRequired('请输入年龄') }]}
            >
              <InputNumber min={0} max={30} style={{ width: '100%' }} placeholder="年龄" />
            </Form.Item>

            <Form.Item
              name="weight"
              label="体重（kg）"
              style={{ flex: 1 }}
              rules={[{ validator: validateRequired('请输入体重') }]}
            >
              <InputNumber min={0} max={200} step={0.1} style={{ width: '100%' }} placeholder="体重" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="vaccineStatus"
              label="疫苗状态"
              style={{ flex: 1 }}
              rules={[{ validator: validateRequired('请选择疫苗状态') }]}
            >
              <Select placeholder="请选择">
                <Option value="complete">已完成</Option>
                <Option value="partial">部分完成</Option>
                <Option value="none">未接种</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="sterilizationStatus"
              label="绝育状态"
              style={{ flex: 1 }}
              rules={[{ validator: validateRequired('请选择绝育状态') }]}
            >
              <Select placeholder="请选择">
                <Option value="yes">已绝育</Option>
                <Option value="no">未绝育</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="description" label="备注">
            <TextArea rows={3} placeholder="性格特点、生活习惯等" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MyPets
