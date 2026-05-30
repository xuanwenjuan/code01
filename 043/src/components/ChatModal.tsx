import { useState, useRef, useEffect } from 'react'
import { Modal, Input, Button, List, Avatar, Tag, Space, message } from 'antd'
import { SendOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store'
import type { ChatSession, Message } from '@/types'
import styles from './ChatModal.module.css'

const { TextArea } = Input

const getStatusIcon = (status: Message['status']) => {
  switch (status) {
    case 'unread':
      return null
    case 'read':
      return <CheckOutlined style={{ color: '#52c41a', fontSize: 12 }} />
    case 'revoked':
      return <CloseOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
  }
}

const ChatModal = () => {
  const {
    selectedChatSession,
    setSelectedChatSession,
    messages,
    currentUser,
    addMessage,
    resetUnreadCount
  } = useAppStore()

  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const open = !!selectedChatSession

  useEffect(() => {
    if (open && selectedChatSession) {
      resetUnreadCount(selectedChatSession.id)
    }
  }, [open, selectedChatSession, resetUnreadCount])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sessionMessages = messages.filter((m) => {
    if (!selectedChatSession || !currentUser) return false
    if (selectedChatSession.type === 'private') {
      return (
        (m.senderId === currentUser.id && m.receiverId === selectedChatSession.id.replace('s-p-', 'e')) ||
        (m.receiverId === currentUser.id && m.senderId === selectedChatSession.id.replace('s-p-', 'e'))
      )
    }
    return m.isGroup && m.groupId === selectedChatSession.id
  })

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatSession || !currentUser) return

    const message: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      receiverId: selectedChatSession.id,
      content: newMessage,
      type: 'text',
      status: 'unread',
      createdAt: new Date().toISOString(),
      isGroup: selectedChatSession.type === 'group',
      groupId: selectedChatSession.type === 'group' ? selectedChatSession.id : undefined,
      groupName: selectedChatSession.type === 'group' ? selectedChatSession.name : undefined
    }

    addMessage(message)
    setNewMessage('')
    message.success('消息发送成功')
  }

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <Avatar src={selectedChatSession?.avatar} size={32} />
          <span>{selectedChatSession?.name}</span>
          <Tag color={selectedChatSession?.type === 'group' ? 'blue' : 'green'}>
            {selectedChatSession?.type === 'group' ? '群聊' : '私聊'}
          </Tag>
        </div>
      }
      open={open}
      onCancel={() => setSelectedChatSession(null)}
      footer={null}
      width={600}
      className={styles.chatModal}
    >
      <div className={styles.messagesContainer}>
        <List
          dataSource={sessionMessages}
          renderItem={(msg) => (
            <List.Item
              className={`${styles.messageItem} ${
                msg.senderId === currentUser?.id ? styles.ownMessage : ''
              }`}
            >
              <div className={styles.messageContent}>
                {msg.senderId !== currentUser?.id && (
                  <Avatar src={msg.senderAvatar} size={32} className={styles.messageAvatar} />
                )}
                <div className={styles.messageBubble}>
                  {msg.senderId !== currentUser?.id && (
                    <div className={styles.senderName}>{msg.senderName}</div>
                  )}
                  <div className={styles.messageText}>{msg.content}</div>
                  <div className={styles.messageMeta}>
                    <span>{msg.createdAt}</span>
                    {msg.senderId === currentUser?.id && getStatusIcon(msg.status)}
                  </div>
                </div>
                {msg.senderId === currentUser?.id && (
                  <Avatar src={currentUser?.avatar} size={32} className={styles.messageAvatar} />
                )}
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputContainer}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            发送
          </Button>
        </Space.Compact>
      </div>
    </Modal>
  )
}

export default ChatModal
