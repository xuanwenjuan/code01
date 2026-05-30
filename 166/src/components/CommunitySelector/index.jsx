import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Drawer, List, Avatar, Radio, Button } from 'antd'
import { EnvironmentOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons'
import { closeSelector, setCurrentCommunity } from '@/store/communitySlice'
import './index.scss'

const CommunitySelector = () => {
  const dispatch = useDispatch()
  const { showSelector, communities, currentCommunity } = useSelector(state => state.community)

  const handleSelect = (community) => {
    dispatch(setCurrentCommunity(community))
  }

  return (
    <Drawer
      title="选择自提社区"
      placement="top"
      closable={true}
      onClose={() => dispatch(closeSelector())}
      open={showSelector}
      height={400}
      className="community-drawer"
    >
      <List
        dataSource={communities}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            className={`community-item ${currentCommunity?.id === item.id ? 'active' : ''}`}
            onClick={() => handleSelect(item)}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  size="large"
                  icon={<EnvironmentOutlined />}
                  style={{ backgroundColor: '#52c41a' }}
                />
              }
              title={
                <div className="community-title">
                  <span>{item.name}</span>
                  {currentCommunity?.id === item.id && (
                    <span className="current-tag">当前</span>
                  )}
                </div>
              }
              description={
                <div className="community-desc">
                  <p><EnvironmentOutlined /> {item.address}</p>
                  <p className="leader-info">
                    <UserOutlined /> 团长：{item.leader}
                    <PhoneOutlined style={{ marginLeft: 16 }} /> {item.phone}
                  </p>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Drawer>
  )
}

export default React.memo(CommunitySelector)
