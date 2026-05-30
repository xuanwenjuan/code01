import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Input,
  List,
  Tag,
  Button,
  Space,
  Empty,
  Tabs,
  Avatar,
  Card,
  Badge,
  Spin
} from 'antd'
import {
  SearchOutlined,
  MessageOutlined,
  BellOutlined,
  FileTextOutlined,
  RightOutlined
} from '@ant-design/icons'
import { useAppStore } from '@/store'
import { useDebounce } from 'use-debounce'
import styles from './GlobalSearch.module.css'

const { Search } = Input
const { TabPane } = Tabs

const GlobalSearch = () => {
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const { messages, notifications, approvals, setCurrentModule, setSelectedChatSession, setSelectedApproval, chatSessions, setLoading, isLoading } = useAppStore()

  const [debouncedSearchText] = useDebounce(searchText, 300)

  const handleJumpToChat = useCallback((sessionId: string) => {
    setLoading('searchJump', true)
    const session = chatSessions.find(s => s.id === sessionId)
    if (session) {
      setSelectedChatSession(session)
    }
    setCurrentModule('chat')
    setTimeout(() => setLoading('searchJump', false), 300)
  }, [setSelectedChatSession, setCurrentModule, chatSessions, setLoading])

  const handleJumpToApproval = useCallback((approvalId: string) => {
    setLoading('searchJump', true)
    const approval = approvals.find(a => a.id === approvalId)
    if (approval) {
      setSelectedApproval(approval)
    }
    setCurrentModule('approval')
    setTimeout(() => setLoading('searchJump', false), 300)
  }, [approvals, setSelectedApproval, setCurrentModule, setLoading])

  const handleJumpToNotification = useCallback(() => {
    setLoading('searchJump', true)
    setCurrentModule('organization')
    setTimeout(() => setLoading('searchJump', false), 300)
  }, [setCurrentModule, setLoading])

  const highlightText = useCallback((text: string, keyword: string) => {
    if (!keyword) return text
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={index} className={styles.highlight}>{part}</span>
      ) : (
        <span key={index}>{part}</span>
      )
    )
  }, [])

  const searchResults = useMemo(() => {
    const keyword = debouncedSearchText.trim().toLowerCase()
    if (!keyword) return { messages: [], notifications: [], approvals: [] }

    return {
      messages: messages.filter(m =>
        m.content.toLowerCase().includes(keyword) ||
        m.senderName.toLowerCase().includes(keyword)
      ).slice(0, 20),
      notifications: notifications.filter(n =>
        n.title.toLowerCase().includes(keyword) ||
        n.content.toLowerCase().includes(keyword)
      ).slice(0, 20),
      approvals: approvals.filter(a =>
        a.title.toLowerCase().includes(keyword) ||
        a.description.toLowerCase().includes(keyword) ||
        a.applicantName.toLowerCase().includes(keyword)
      ).slice(0, 20)
    }
  }, [debouncedSearchText, messages, notifications, approvals])

  const filteredResults = useMemo(() => {
    if (activeTab === 'all') {
      return [
        ...searchResults.messages.map(m => ({ ...m, _type: 'message' as const })),
        ...searchResults.notifications.map(n => ({ ...n, _type: 'notification' as const })),
        ...searchResults.approvals.map(a => ({ ...a, _type: 'approval' as const }))
      ]
    }
    if (activeTab === 'message') {
      return searchResults.messages.map(m => ({ ...m, _type: 'message' as const }))
    }
    if (activeTab === 'notification') {
      return searchResults.notifications.map(n => ({ ...n, _type: 'notification' as const }))
    }
    if (activeTab === 'approval') {
      return searchResults.approvals.map(a => ({ ...a, _type: 'approval' as const }))
    }
    return []
  }, [searchResults, activeTab])

  const typeConfig = {
    message: { icon: <MessageOutlined />, color: 'blue', label: '消息' },
    notification: { icon: <BellOutlined />, color: 'orange', label: '通知' },
    approval: { icon: <FileTextOutlined />, color: 'green', label: '审批' }
  }

  const totalCount = searchResults.messages.length + searchResults.notifications.length + searchResults.approvals.length

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.searchHeader}>
          <Search
            placeholder="搜索消息、通知、审批..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            loading={isLoading['search']}
          />
          {debouncedSearchText && (
            <div className={styles.searchStats}>
              找到 <span className={styles.highlight}>{totalCount}</span> 条结果
            </div>
          )}
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className={styles.searchTabs}
        >
          <TabPane tab="全部" key="all" />
          <TabPane tab={<span><MessageOutlined /> 消息</span>} key="message" />
          <TabPane tab={<span><BellOutlined /> 通知</span>} key="notification" />
          <TabPane tab={<span><FileTextOutlined /> 审批</span>} key="approval" />
        </Tabs>

        <Spin spinning={isLoading['searchJump']}>
          {!debouncedSearchText ? (
            <Empty
              image={<SearchOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
              description="输入关键词开始搜索"
              style={{ padding: '80px 0' }}
            />
          ) : filteredResults.length === 0 ? (
            <Empty
              description="未找到相关结果"
              style={{ padding: '80px 0' }}
            />
          ) : (
            <List
              dataSource={filteredResults}
              renderItem={(item: any) => (
                <List.Item
                  className={styles.resultItem}
                  onClick={() => {
                    if (item._type === 'message') {
                      const session = chatSessions.find(s =>
                        s.type === 'private'
                          ? s.id.includes(item.senderId) || s.id.includes(item.receiverId)
                          : s.id === item.groupId
                      )
                      if (session) handleJumpToChat(session.id)
                    } else if (item._type === 'approval') {
                      handleJumpToApproval(item.id)
                    } else {
                      handleJumpToNotification()
                    }
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge color={typeConfig[item._type].color}>
                        <Avatar size="large" icon={typeConfig[item._type].icon} />
                      </Badge>
                    }
                    title={
                      <Space className={styles.resultTitle}>
                        {highlightText(item.title || item.senderName || '消息', debouncedSearchText)}
                        <Tag color={typeConfig[item._type].color} size="small">
                          {typeConfig[item._type].label}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div className={styles.resultDesc}>
                        {highlightText(item.content || item.description || '', debouncedSearchText)}
                        <div className={styles.resultMeta}>
                          <span>
                            {new Date(item.timestamp || item.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    }
                  />
                  <Button type="text" icon={<RightOutlined />} />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
    </div>
  )
}

export default GlobalSearch
