import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Descriptions,
  Tabs,
  Card,
  Row,
  Col,
  Progress,
  Empty,
  Spin,
  Statistic,
} from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  CrownOutlined,
  GiftOutlined,
  StarOutlined,
  UserOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store'
import { memberData, memberLevelData } from '@/mock'
import { Member, MemberLevel, MemberQueryParams, LevelChangeRecord } from '@/types'
import ModalForm from '@/components/ModalForm'
import QueryForm from '@/components/QueryForm'

const { TabPane } = Tabs

interface MemberFormData {
  levelId: string
  status: 'active' | 'inactive'
}

function Members() {
  const { members, setMembers, memberLevels, setMemberLevels, updateMember } = useAppStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [queryParams, setQueryParams] = useState<MemberQueryParams>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (members.length === 0) {
      setLoading(true)
      setTimeout(() => {
        setMembers(memberData)
        setLoading(false)
      }, 500)
    }
    if (memberLevels.length === 0) {
      setMemberLevels(memberLevelData)
    }
  }, [members.length, memberLevels.length, setMembers, setMemberLevels])

  const getLevelColor = useCallback((level: number) => {
    const colors = ['default', 'blue', 'gold', 'purple']
    return colors[level - 1] || 'default'
  }, [])

  const queryFields = [
    {
      name: 'name',
      label: '用户名',
      type: 'input' as const,
      placeholder: '请输入用户名',
    },
    {
      name: 'phone',
      label: '手机号',
      type: 'input' as const,
      placeholder: '请输入手机号',
    },
    {
      name: 'levelId',
      label: '会员等级',
      type: 'select' as const,
      placeholder: '请选择等级',
      options: memberLevels.map((level: MemberLevel) => ({
        label: level.name,
        value: level.id,
      })),
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      placeholder: '请选择状态',
      options: [
        { label: '正常', value: 'active' },
        { label: '禁用', value: 'inactive' },
      ],
    },
  ]

  const filteredMembers = useMemo(() => {
    return members.filter((item) => {
      if (queryParams.name && !item.name.includes(queryParams.name)) {
        return false
      }
      if (queryParams.phone && !item.phone.includes(queryParams.phone)) {
        return false
      }
      if (queryParams.levelId && item.levelId !== queryParams.levelId) {
        return false
      }
      if (queryParams.status && item.status !== queryParams.status) {
        return false
      }
      return true
    })
  }, [members, queryParams])

  const handleSearch = (values: MemberQueryParams) => {
    setLoading(true)
    setTimeout(() => {
      setQueryParams(values)
      setLoading(false)
      message.success('查询成功')
    }, 300)
  }

  const handleReset = () => {
    setQueryParams({})
    message.info('已重置查询条件')
  }

  const handleEdit = (member: Member) => {
    setSelectedMember(member)
    setModalOpen(true)
  }

  const handleViewDetail = (member: Member) => {
    setSelectedMember(member)
    setDetailModalOpen(true)
  }

  const handleOk = (values: MemberFormData) => {
    if (!selectedMember) return

    const now = new Date().toLocaleString()
    const newLevel = memberLevels.find((l: MemberLevel) => l.id === values.levelId)
    const oldLevel = memberLevels.find((l: MemberLevel) => l.id === selectedMember.levelId)
    const newLevelName = newLevel?.name || ''
    const oldLevelName = oldLevel?.name || ''

    const levelChangeRecords: LevelChangeRecord[] = values.levelId !== selectedMember.levelId
      ? [
          ...selectedMember.levelChangeRecords,
          {
            id: Date.now().toString(),
            fromLevel: oldLevelName,
            toLevel: newLevelName,
            reason: '管理员调整',
            operator: '管理员',
            time: now,
          },
        ]
      : selectedMember.levelChangeRecords

    setLoading(true)
    setTimeout(() => {
      updateMember(selectedMember.id, {
        ...values,
        levelName: newLevelName,
        updatedAt: now,
        levelChangeRecords,
      })
      setLoading(false)
      setModalOpen(false)
      message.success('更新成功')
    }, 500)
  }

  const memberLevelOptions = memberLevels.map((l: MemberLevel) => ({
    label: l.name,
    value: l.id,
  }))

  const modalConfig = {
    title: '调整会员等级',
    width: 600,
    fields: [
      {
        name: 'levelId',
        label: '会员等级',
        type: 'select' as const,
        rules: [{ required: true, message: '请选择会员等级' }],
        options: memberLevelOptions,
      },
      {
        name: 'status',
        label: '账号状态',
        type: 'select' as const,
        rules: [{ required: true, message: '请选择账号状态' }],
        options: [
          { label: '正常', value: 'active' },
          { label: '禁用', value: 'inactive' },
        ],
      },
    ],
  }

  const memberColumns = [
    {
      title: '用户',
      key: 'user',
      width: 180,
      fixed: 'left' as const,
      render: (_: unknown, record: Member) => (
        <div>
          <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined />
            {record.name}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: '会员等级',
      key: 'level',
      width: 120,
      render: (_: unknown, record: Member) => {
        const level = memberLevels.find((l: MemberLevel) => l.id === record.levelId)
        return (
          <Tag color={getLevelColor(level?.level || 1)}>
            {level?.name || record.levelName}
          </Tag>
        )
      },
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 120,
      render: (points: number) => (
        <span style={{ color: '#1890ff', fontWeight: 500 }}>
          {points.toLocaleString()}
        </span>
      ),
    },
    {
      title: '累计消费',
      dataIndex: 'totalConsumption',
      key: 'totalConsumption',
      width: 120,
      render: (amount: number) => (
        <span style={{ color: '#f5222d', fontWeight: 500 }}>
          ¥{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: '升级进度',
      key: 'upgradeProgress',
      width: 180,
      render: (_: unknown, record: Member) => {
        const currentLevel = memberLevels.find((l: MemberLevel) => l.id === record.levelId)
        const nextLevel = memberLevels.find((l: MemberLevel) => l.level === (currentLevel?.level || 0) + 1)
        if (!nextLevel) return <Tag color="green">已最高等级</Tag>
        const progress = Math.min((record.points / nextLevel.minPoints) * 100, 100)
        return (
          <div>
            <Progress percent={Math.round(progress)} size="small" status="active" />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              还需 {nextLevel.minPoints - record.points} 积分升级
            </div>
          </div>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 150,
      render: (_: unknown, record: Member) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            调整
          </Button>
        </Space>
      ),
    },
  ]

  const statisticsCards = [
    {
      title: '总会员数',
      value: members.length,
      prefix: <UserOutlined />,
      valueStyle: { color: '#1890ff' },
    },
    {
      title: '钻石会员',
      value: members.filter((m) => m.levelId === '4').length,
      prefix: <CrownOutlined />,
      valueStyle: { color: '#722ed1' },
    },
    {
      title: '金卡会员',
      value: members.filter((m) => m.levelId === '3').length,
      prefix: <StarOutlined />,
      valueStyle: { color: '#faad14' },
    },
    {
      title: '本月新增',
      value: Math.floor(members.length * 0.1),
      prefix: <ArrowUpOutlined />,
      valueStyle: { color: '#52c41a' },
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>会员等级权益管理</h2>
      </div>

      <Tabs defaultActiveKey="members">
        <TabPane tab="会员列表" key="members">
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {statisticsCards.map((stat, index) => (
              <Col xs={12} sm={12} md={6} key={index}>
                <Card>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    valueStyle={stat.valueStyle}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <QueryForm<MemberQueryParams>
            fields={queryFields}
            onSearch={handleSearch}
            onReset={handleReset}
            col={4}
          />

          <Spin spinning={loading} tip="加载中...">
            <Table
              columns={memberColumns}
              dataSource={filteredMembers}
              rowKey="id"
              scroll={{ x: 1000 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
                size: 'default',
                showLessItems: true,
              }}
              locale={{
                emptyText: <Empty description="暂无会员数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
              }}
              size="small"
            />
          </Spin>
        </TabPane>
        <TabPane tab="等级权益配置" key="levels">
          <Row gutter={[16, 16]}>
            {memberLevels.map((level: MemberLevel) => (
              <Col xs={24} sm={12} lg={6} key={level.id}>
                <Card
                  hoverable
                  style={{
                    borderTop: `4px solid ${level.level === 4 ? '#722ed1' : level.level === 3 ? '#faad14' : level.level === 2 ? '#1890ff' : '#d9d9d9'}`,
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    {level.level === 4 ? (
                      <CrownOutlined style={{ fontSize: 48, color: '#722ed1' }} />
                    ) : level.level === 3 ? (
                      <StarOutlined style={{ fontSize: 48, color: '#faad14' }} />
                    ) : level.level === 2 ? (
                      <GiftOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    ) : (
                      <StarOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                    )}
                    <h3 style={{ marginTop: 12, marginBottom: 4 }}>{level.name}</h3>
                    <Tag color={getLevelColor(level.level)}>Lv.{level.level}</Tag>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                      {members.filter((m) => m.levelId === level.id).length} 名会员
                    </div>
                  </div>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="折扣">
                      <strong style={{ color: '#f5222d', fontSize: 16 }}>{level.discount * 100}%</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="积分倍率">
                      <strong style={{ color: '#1890ff', fontSize: 16 }}>{level.pointsRate}x</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="最低积分">
                      {level.minPoints.toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="生日福利">
                      <div style={{ fontSize: 12 }}>{level.birthdayBenefit}</div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>

      <ModalForm<MemberFormData>
        open={modalOpen}
        title="调整会员等级"
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        initialValues={selectedMember ? {
          levelId: selectedMember.levelId,
          status: selectedMember.status,
        } : undefined}
        config={modalConfig}
      />

      <Modal
        open={detailModalOpen}
        title="会员详情"
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedMember && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }} size="small">
              <Descriptions.Item label="姓名" span={2}>
                {selectedMember.name}
              </Descriptions.Item>
              <Descriptions.Item label="手机号">{selectedMember.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedMember.email}</Descriptions.Item>
              <Descriptions.Item label="会员等级">
                <Tag color={getLevelColor(
                  memberLevels.find((l: MemberLevel) => l.id === selectedMember.levelId)?.level || 1
                )}>
                  {selectedMember.levelName}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedMember.status === 'active' ? 'success' : 'error'}>
                  {selectedMember.status === 'active' ? '正常' : '禁用'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="积分">
                <strong style={{ color: '#1890ff', fontSize: 18 }}>
                  {selectedMember.points.toLocaleString()}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="累计消费">
                <strong style={{ color: '#f5222d', fontSize: 18 }}>
                  ¥{selectedMember.totalConsumption.toLocaleString()}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="生日">{selectedMember.birthday}</Descriptions.Item>
              <Descriptions.Item label="注册时间">{selectedMember.createdAt}</Descriptions.Item>
            </Descriptions>

            {selectedMember.levelChangeRecords.length > 0 && (
              <>
                <h4 style={{ marginBottom: 12 }}>等级变更记录</h4>
                <Descriptions bordered column={1} size="small">
                  {selectedMember.levelChangeRecords.map((record) => (
                    <Descriptions.Item key={record.id} label={`${record.time}`}>
                      <div>
                        {record.fromLevel} → <Tag color="blue">{record.toLevel}</Tag>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                          原因: {record.reason} | 操作人: {record.operator}
                        </div>
                      </div>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Members
