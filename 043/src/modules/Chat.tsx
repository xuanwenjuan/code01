import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  List,
  Avatar,
  Input,
  Button,
  Space,
  Tag,
  Badge,
  Empty,
  Spin,
  message as antMessage,
  Skeleton
} from 'antd'
import {
  SendOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  CheckOutlined,
  LoadingOutlined,
  DownOutlined
} from '@ant-design/icons'
import { useAppStore, useSessionMessages } from '@/store'
import ChatModal from '@/components/ChatModal'
import VirtualList from '@/components/VirtualList'
import styles from './Chat.module.css'

const { Search } = Input

const Chat = () => {
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'private' | 'group'>('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)

  const {
    currentUser,
    chatSessions,
    selectedChatSession,
    setSelectedChatSession,
    addMessage,
    addMessages,
    updateSessionLastMessage,
    resetUnreadCount,
    updateMessageStatus,
    setLoading,
    isLoading
  } = useAppStore()

  const sessionMessages = useSessionMessages(selectedChatSession?.id || null, 500)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollBottom(false)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [selectedChatSession?.id, scrollToBottom])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollBottom(!isNearBottom && sessionMessages.length > 20)
  }, [sessionMessages.length])

  const handleSelectSession = useCallback((session: any) => {
    setSelectedChatSession(session)
    resetUnreadCount(session.id)
    setIsModalVisible(true)
    setLoading('chat', true)

    setTimeout(() => {
      setLoading('chat', false)
    }, 300)
  }, [setSelectedChatSession, resetUnreadCount, setLoading])

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedChatSession || !currentUser) return

    const now = new Date().toISOString()
    const isPrivate = selectedChatSession.type === 'private'

    const message: any = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: newMessage.trim(),
      timestamp: now,
      status: 'sending',
      isGroup: !isPrivate,
      ...(isPrivate
        ? { receiverId: selectedChatSession.id.replace('s-p-', '') }
        : { groupId: selectedChatSession.id }
      )
    }

    addMessage(message)
    setNewMessage('')
    updateSessionLastMessage(selectedChatSession.id, message.content, now)
    scrollToBottom()

    setTimeout(() => {
      updateMessageStatus(message.id, 'sent')
    }, 200)

    setTimeout(() => {
      updateMessageStatus(message.id, 'read')
    }, 800)
  }, [newMessage, selectedChatSession, currentUser, addMessage, updateSessionLastMessage, updateMessageStatus, scrollToBottom])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  const handleBatchReceive = useCallback(() => {
    if (!selectedChatSession || !currentUser) return

    setLoading('batchReceive', true)

    setTimeout(() => {
      const now = new Date().toISOString()
      const isPrivate = selectedChatSession.type === 'private'
      const otherEmployee = {
        id: isPrivate ? selectedChatSession.id.replace('s-p-', '') : 'other',
        name: selectedChatSession.name,
        avatar: selectedChatSession.avatar
      }

      const newMessages: any[] = Array.from({ length: 10 }, (_, i) => ({
        id: `m-${Date.now()}-${i}`,
        senderId: otherEmployee.id,
        senderName: otherEmployee.name,
        senderAvatar: otherEmployee.avatar,
        content: `批量消息 ${i + 1}: 这是一条模拟的高频推送消息内容`,
        timestamp: now,
        status: 'sent' as const,
        isGroup: !isPrivate,
        ...(isPrivate
          ? { receiverId: currentUser.id }
          : { groupId: selectedChatSession.id }
        )
      }))

      addMessages(newMessages)
      updateSessionLastMessage(
        selectedChatSession.id,
        newMessages[newMessages.length - 1].content,
        now
      )

      setLoading('batchReceive', false)
      antMessage.success(`成功接收 ${newMessages.length} 条消息`)
      scrollToBottom()
    }, 500)
  }, [selectedChatSession, currentUser, addMessages, updateSessionLastMessage, setLoading, scrollToBottom])

  const filteredSessions = useMemo(() => {
    return chatSessions.filter(session => {
      const matchesSearch = session.name.toLowerCase().includes(searchText.toLowerCase())
      const matchesType = filterType === 'all' || session.type === filterType
      return matchesSearch && matchesType
    })
  }, [chatSessions, searchText, filterType])

  const renderMessageStatus = (status: string) => {
    switch (status) {
      case 'sending':
        return <LoadingOutlined spin className={styles.statusIcon} />
      case 'sent':
        return <CheckOutlined className={styles.statusIcon} />
      case 'read':
        return <CheckOutlined className={styles.statusIconRead} />
      default:
        return null
    }
  }

  const renderMessageItem = useCallback((msg: any, index: number) => {
    const isOwn = msg.senderId === currentUser?.id
    return (
      <div
        className={`${styles.messageBubble} ${isOwn ? styles.ownMessage : styles.otherMessage}`}
        style={{ minHeight: 80 }}
      >
        {!isOwn && <Avatar src={msg.senderAvatar} size={32} />}
        <div className={styles.messageContent}>
          {!isOwn && (
            <div className={styles.senderName}>{msg.senderName}</div>
          )}
          <div className={styles.messageText}>{msg.content}</div>
          <div className={styles.messageMeta}>
            <span className={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {isOwn && renderMessageStatus(msg.status)}
          </div>
        </div>
      </div>
    )
  }, [currentUser?.id])

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.searchBox}>
          <Search
            placeholder="搜索会话"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Space className={styles.filterTabs}>
          <Button
            type={filterType === 'all' ? 'primary' : 'text'}
            size="small"
            onClick={() => setFilterType('all')}
          >
            全部
          </Button>
          <Button
            type={filterType === 'private' ? 'primary' : 'text'}
            size="small"
            onClick={() => setFilterType('private')}
            icon={<UserOutlined />}
          >
            私聊
          </Button>
          <Button
            type={filterType === 'group' ? 'primary' : 'text'}
            size="small"
            onClick={() => setFilterType('group')}
            icon={<TeamOutlined />}
          >
            群聊
          </Button>
        </Space>

        <div className={styles.sessionList}>
          <Spin spinning={isLoading['sessionList']}>
            {filteredSessions.length === 0 ? (
              <Empty description="暂无会话" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={filteredSessions}
                renderItem={(session) => (
                  <List.Item
                    onClick={() => handleSelectSession(session)}
                    className={`${styles.sessionItem} ${
                      selectedChatSession?.id === session.id ? styles.active : ''
                    }`}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={session.unreadCount} size="small">
                          <Avatar src={session.avatar} size={44} />
                        </Badge>
                      }
                      title={
                        <Space>
                          <span className={styles.sessionName}>{session.name}</span>
                          <Tag
                            color={session.type === 'group' ? 'blue' : 'green'}
                            bordered={false}
                          >
                            {session.type === 'group' ? '群' : '私'}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div className={styles.sessionPreview}>
                          <span className={styles.lastMessage}>{session.lastMessage}</span>
                          <span className={styles.lastMessageTime}>
                            {new Date(session.lastMessageTime).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Spin>
        </div>
      </div>

      <div className={styles.chatArea}>
        {selectedChatSession ? (
          <>
            <div className={styles.chatHeader}>
              <Space>
                <Avatar src={selectedChatSession.avatar} />
                <span className={styles.chatTitle}>{selectedChatSession.name}</span>
              </Space>
              <Space>
                <Button
                  size="small"
                  onClick={handleBatchReceive}
                  loading={isLoading['batchReceive']}
                >
                  模拟高频消息(10条)
                </Button>
              </Space>
            </div>

            <div
              className={styles.messageContainer}
              ref={messageContainerRef}
              onScroll={handleScroll}
            >
              <Spin spinning={isLoading['chat']}>
                {isLoading['chat'] ? (
                  <div style={{ padding: 20 }}>
                    <Skeleton avatar paragraph={{ rows: 4 }} active />
                    <Skeleton avatar paragraph={{ rows: 4 }} active />
                  </div>
                ) : sessionMessages.length === 0 ? (
                  <div className={styles.emptyMessages}>
                    <Empty description="暂无消息，开始聊天吧" />
                  </div>
                ) : (
                  <>
                    {sessionMessages.length > 100 ? (
                      <VirtualList
                        data={sessionMessages}
                        itemHeight={90}
                        renderItem={renderMessageItem}
                        className={styles.virtualList}
                      />
                    ) : (
                      sessionMessages.map((msg: any, index: number) => (
                        <div key={msg.id}>
                          {renderMessageItem(msg, index)}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </Spin>

              {showScrollBottom && (
                <Button
                  className={styles.scrollBottomBtn}
                  shape="circle"
                  icon={<DownOutlined />}
                  onClick={scrollToBottom}
                />
              )}
            </div>

            <div className={styles.inputArea}>
              <Input.TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息，按 Enter 发送"
                autoSize={{ minRows: 1, maxRows: 4 }}
                className={styles.messageInput}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                发送
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.noSessionSelected}>
            <Empty
              image={<UserOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
              description="选择一个会话开始聊天"
            />
          </div>
        )}
      </div>

      <ChatModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        session={selectedChatSession}
      />
    </div>
  )
}

export default Chat
