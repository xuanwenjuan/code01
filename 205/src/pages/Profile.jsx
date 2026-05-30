import { Card, Avatar, Descriptions, Tag, Button } from 'antd';
import { UserOutlined, CrownOutlined, TeamOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import './Profile.css';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const { favorites, history } = useSelector(state => state.user);

  const roleMap = {
    admin: { color: 'gold', text: '平台管理员', icon: <CrownOutlined /> },
    user: { color: 'blue', text: '技艺研究者/收藏者', icon: <TeamOutlined /> },
  };

  const roleInfo = roleMap[user.role] || roleMap.user;

  return (
    <div className="profile-page">
      <Card className="profile-card">
        <div className="profile-header">
          <Avatar size={100} src={user.avatar} icon={<UserOutlined />} />
          <div className="profile-info">
            <h2 className="profile-name">{user.name}</h2>
            <Tag color={roleInfo.color} icon={roleInfo.icon}>
              {roleInfo.text}
            </Tag>
          </div>
        </div>

        <Descriptions column={2} bordered size="middle" className="profile-desc">
          <Descriptions.Item label="用户名">
            {user.username}
          </Descriptions.Item>
          <Descriptions.Item label="账号类型">
            <Tag color={roleInfo.color}>{roleInfo.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="收藏作品">
            <span className="stat-number">{favorites.length}</span> 件
          </Descriptions.Item>
          <Descriptions.Item label="浏览记录">
            <span className="stat-number">{history.length}</span> 条
          </Descriptions.Item>
        </Descriptions>

        <div className="profile-actions">
          <Button type="primary">编辑资料</Button>
          <Button>修改密码</Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
