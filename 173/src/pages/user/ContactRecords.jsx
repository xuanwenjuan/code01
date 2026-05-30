import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Tag, Space, Avatar } from 'antd'
import { PhoneOutlined, MessageOutlined } from '@ant-design/icons'
import { fetchContactRecords } from '../../store/actions/orderActions'
import PageContainer from '../../components/common/PageContainer'
import { mockMasters } from '../../mock'

const ContactRecords = () => {
  const dispatch = useDispatch()
  const { contactRecords, loading } = useSelector(state => state.orders)

  useEffect(() => {
    dispatch(fetchContactRecords())
  }, [dispatch])

  const getMasterAvatar = (masterId) => {
    const master = mockMasters.find(m => m.id === masterId)
    return master?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  }

  const columns = [
    {
      title: '师傅信息',
      key: 'master',
      render: (_, record) => (
        <Space>
          <Avatar src={getMasterAvatar(record.masterId)} />
          <div>
            <p style={{ margin: 0, fontWeight: 500 }}>{record.masterName}</p>
            <p style={{ margin: 0, color: '#999', fontSize: 12 }}>{record.phone}</p>
          </div>
        </Space>
      )
    },
    {
      title: '联系类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag icon={type === 'phone' ? <PhoneOutlined /> : <MessageOutlined />} color={type === 'phone' ? 'blue' : 'green'}>
          {type === 'phone' ? '电话' : '消息'}
        </Tag>
      )
    },
    {
      title: '联系内容',
      dataIndex: 'content',
      key: 'content'
    },
    {
      title: '联系时间',
      dataIndex: 'contactTime',
      key: 'contactTime',
      width: 180
    }
  ]

  return (
    <PageContainer loading={loading} empty={!loading && contactRecords.length === 0}>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>联系记录</h2>
      <Table
        columns={columns}
        dataSource={contactRecords}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />
    </PageContainer>
  )
}

export default ContactRecords
