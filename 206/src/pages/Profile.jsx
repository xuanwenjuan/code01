import { useState } from 'react';
import {
  Card,
  Avatar,
  Row,
  Col,
  Descriptions,
  Button,
  Form,
  Input,
  Modal,
  message,
  Tag,
} from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../store/slices/userSlice';
import dayjs from 'dayjs';

const roleMap = {
  admin: { label: '平台管理员', color: 'red' },
  inheritor: { label: '苏绣传承人', color: 'gold' },
  enthusiast: { label: '苏绣爱好者', color: 'blue' },
};

const Profile = () => {
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = () => {
    form.setFieldsValue({
      nickname: userInfo.nickname,
      email: userInfo.email,
      phone: userInfo.phone,
      bio: userInfo.bio || '',
    });
    setEditModalVisible(true);
  };

  const handleSave = async (values) => {
    dispatch(updateUser(values));
    message.success('个人信息更新成功');
    setEditModalVisible(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">个人中心</h1>
      </div>

      <Card className="mb-8">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={8} className="text-center">
            <Avatar src={userInfo.avatar} size={120} icon={<UserOutlined />} />
            <h2 className="mt-4 text-xl font-semibold">{userInfo.nickname}</h2>
            <Tag color={roleMap[userInfo.role]?.color} className="mt-2">
              {roleMap[userInfo.role]?.label}
            </Tag>
          </Col>
          <Col xs={24} sm={16}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="用户名">{userInfo.username}</Descriptions.Item>
              <Descriptions.Item label="昵称">{userInfo.nickname}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{userInfo.email}</Descriptions.Item>
              <Descriptions.Item label="手机号">{userInfo.phone}</Descriptions.Item>
              {userInfo.bio && (
                <Descriptions.Item label="个人简介">{userInfo.bio}</Descriptions.Item>
              )}
              <Descriptions.Item label="注册时间">
                {dayjs(userInfo.createdAt).format('YYYY年MM月DD日')}
              </Descriptions.Item>
            </Descriptions>
            <Button
              type="primary"
              icon={<EditOutlined />}
              className="mt-4 bg-amber-600"
              onClick={handleEdit}
            >
              编辑资料
            </Button>
          </Col>
        </Row>
      </Card>

      <Card title="我的数据统计">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card className="text-center">
              <div className="text-3xl font-bold text-amber-600">
                {userInfo.learningProgress?.length || 0}
              </div>
              <div className="text-sm text-gray-500">学习中的课程</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center">
              <div className="text-3xl font-bold text-amber-600">
                {userInfo.learningProgress?.reduce((acc, curr) => acc + curr.progress, 0) /
                  (userInfo.learningProgress?.length || 1) || 0}
                %
              </div>
              <div className="text-sm text-gray-500">平均学习进度</div>
            </Card>
          </Col>
        </Row>
      </Card>

      <Modal
        title="编辑个人资料"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="mt-4"
        >
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[
              { required: true, message: '请输入昵称' },
              { min: 2, message: '昵称至少2个字符' },
              { max: 20, message: '昵称最多20个字符' },
            ]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              {
                pattern: /^1[3-9]\d{9}$/,
                message: '请输入有效的手机号',
              },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item name="bio" label="个人简介">
            <Input.TextArea rows={4} placeholder="请输入个人简介" />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end gap-2">
              <Button onClick={() => setEditModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" className="bg-amber-600">
                保存
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
