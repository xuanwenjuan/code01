import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Form, Input, Button, Avatar, Upload, message, Row, Col, Divider } from 'antd'
import { UserOutlined, CameraOutlined } from '@ant-design/icons'
import { updateUserInfo } from '@/store/slices/userSlice'
import { validatePhone, validateName, validateEmail } from '@/utils/validation'

const UserSettings = () => {
  const dispatch = useDispatch()
  const { userInfo } = useSelector(state => state.user)
  const [form] = Form.useForm()
  const [avatarUrl, setAvatarUrl] = useState(userInfo?.avatar)

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      dispatch(updateUserInfo(values))
      message.success('保存成功')
    } catch (error) {
      console.log('Submit Failed:', error)
    }
  }

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      setAvatarUrl(URL.createObjectURL(info.file.originFileObj))
      message.success('头像上传成功')
    }
  }

  const uploadProps = {
    showUploadList: false,
    beforeUpload: () => false,
    onChange: handleAvatarChange
  }

  return (
    <div>
      <Card bordered={false} title="账户设置">
        <Row gutter={48}>
          <Col xs={24} md={12}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar size={120} src={avatarUrl} icon={<UserOutlined />} />
                <Upload {...uploadProps}>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 32,
                      height: 32,
                      background: '#1677ff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: '2px solid #fff'
                    }}
                  >
                    <CameraOutlined style={{ color: '#fff', fontSize: 14 }} />
                  </div>
                </Upload>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              initialValues={userInfo}
              onValuesChange={(changedValues) => {
                if (changedValues.avatar) {
                  setAvatarUrl(changedValues.avatar)
                }
              }}
            >
              <Form.Item
                name="nickname"
                label="昵称"
                rules={[{ validator: validateName }]}
              >
                <Input placeholder="请输入昵称" size="large" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="手机号"
                rules={[{ validator: validatePhone }]}
              >
                <Input placeholder="请输入手机号" size="large" />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ validator: validateEmail }]}
              >
                <Input placeholder="请输入邮箱" size="large" />
              </Form.Item>

              <Button type="primary" size="large" block onClick={handleSubmit}>
                保存修改
              </Button>
            </Form>
          </Col>

          <Col xs={24} md={12}>
            <Card title="账号信息" bordered={false} style={{ background: '#fafafa' }}>
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: '#999', marginBottom: 4 }}>用户名</p>
                <p style={{ fontSize: 16 }}>{userInfo?.username || '-'}</p>
              </div>
              <Divider />
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: '#999', marginBottom: 4 }}>用户ID</p>
                <p style={{ fontSize: 16 }}>{userInfo?.id || '-'}</p>
              </div>
              <Divider />
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: '#999', marginBottom: 4 }}>注册时间</p>
                <p style={{ fontSize: 16 }}>2024-01-01</p>
              </div>
              <Divider />
              <div>
                <p style={{ color: '#999', marginBottom: 4 }}>用户角色</p>
                <p style={{ fontSize: 16 }}>
                  {userInfo?.role === 'worker' ? '入驻师傅' : '普通用户'}
                </p>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default UserSettings
