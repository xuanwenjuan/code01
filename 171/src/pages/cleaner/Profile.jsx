import { Card, Form, Input, Button, Avatar, Space, Rate, Tag, message } from 'antd'
import { UserOutlined, SaveOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'

const { TextArea } = Input

function CleanerProfile() {
  const { currentUser } = useSelector((state) => state.user)
  const [form] = Form.useForm()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      message.success('个人信息已保存')
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>个人信息</h2>
      <Card>
        <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
          <Avatar src={currentUser?.avatar} size={100} icon={<UserOutlined />} />
          <div>
            <h3 style={{ margin: '0 0 8px 0' }}>{currentUser?.name}</h3>
            <Space style={{ marginBottom: 8 }}>
              <Rate disabled defaultValue={currentUser?.rating} />
              <span style={{ color: '#faad14', fontWeight: 600 }}>{currentUser?.rating}</span>
            </Space>
            <div style={{ color: '#999' }}>
              手机号：{currentUser?.phone}
              <br />
              注册时间：{new Date(currentUser?.registerTime).toLocaleDateString()}
              <br />
              已服务：{currentUser?.orderCount} 单
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: currentUser?.name,
            phone: currentUser?.phone,
            description: currentUser?.description,
          }}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" disabled />
          </Form.Item>
          <Form.Item label="擅长技能">
            <div>
              {currentUser?.skills?.map((skill, index) => (
                <Tag key={index} color="green" style={{ marginRight: 8 }}>
                  {skill}
                </Tag>
              ))}
            </div>
          </Form.Item>
          <Form.Item
            name="description"
            label="个人简介"
            rules={[{ max: 500, message: '最多500字' }]}
          >
            <TextArea rows={4} placeholder="请输入个人简介" maxLength={500} showCount />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default CleanerProfile
