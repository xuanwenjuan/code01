import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { produce } from 'immer'
import type {
  Department,
  Employee,
  Message,
  ChatSession,
  Approval,
  SystemNotification,
  ModuleType
} from '@/types'

interface AppState {
  currentUser: Employee | null
  departments: Department[]
  employees: Employee[]
  messages: Message[]
  chatSessions: ChatSession[]
  approvals: Approval[]
  notifications: SystemNotification[]
  currentModule: ModuleType
  selectedChatSession: ChatSession | null
  selectedApproval: Approval | null
  searchKeyword: string
  isLoading: Record<string, boolean>

  setCurrentUser: (user: Employee) => void
  setDepartments: (departments: Department[]) => void
  setEmployees: (employees: Employee[]) => void
  setMessages: (messages: Message[]) => void
  setChatSessions: (sessions: ChatSession[]) => void
  setApprovals: (approvals: Approval[]) => void
  setNotifications: (notifications: SystemNotification[]) => void
  setCurrentModule: (module: ModuleType) => void
  setSelectedChatSession: (session: ChatSession | null) => void
  setSelectedApproval: (approval: Approval | null) => void
  setSearchKeyword: (keyword: string) => void
  setLoading: (key: string, value: boolean) => void

  addMessage: (message: Message) => void
  addMessages: (messages: Message[]) => void
  updateMessageStatus: (messageId: string, status: Message['status']) => void
  updateBatchMessageStatus: (sessionId: string, status: Message['status']) => void

  updateApprovalStatus: (approvalId: string, status: Approval['status'], comment?: string) => void
  updateApprovalAndNotify: (approvalId: string, status: Approval['status'], comment?: string) => void

  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  addNotification: (notification: SystemNotification) => void

  incrementUnreadCount: (sessionId: string) => void
  resetUnreadCount: (sessionId: string) => void
  updateSessionLastMessage: (sessionId: string, message: string, time: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      departments: [],
      employees: [],
      messages: [],
      chatSessions: [],
      approvals: [],
      notifications: [],
      currentModule: 'organization',
      selectedChatSession: null,
      selectedApproval: null,
      searchKeyword: '',
      isLoading: {},

      setCurrentUser: (user) => set({ currentUser: user }),
      setDepartments: (departments) => set({ departments }),
      setEmployees: (employees) => set({ employees }),
      setMessages: (messages) => set({ messages }),
      setChatSessions: (chatSessions) => set({ chatSessions }),
      setApprovals: (approvals) => set({ approvals }),
      setNotifications: (notifications) => set({ notifications }),
      setCurrentModule: (currentModule) => set({ currentModule }),
      setSelectedChatSession: (selectedChatSession) => set({ selectedChatSession }),
      setSelectedApproval: (selectedApproval) => set({ selectedApproval }),
      setSearchKeyword: (searchKeyword) => set({ searchKeyword }),
      setLoading: (key, value) => set(produce((state) => {
        state.isLoading[key] = value
      })),

      addMessage: (message) => set(produce((state) => {
        state.messages.push(message)
      })),

      addMessages: (newMessages) => set(produce((state) => {
        state.messages.push(...newMessages)
      })),

      updateMessageStatus: (messageId, status) => set(produce((state) => {
        const message = state.messages.find((m: Message) => m.id === messageId)
        if (message) {
          message.status = status
        }
      })),

      updateBatchMessageStatus: (sessionId, status) => set(produce((state) => {
        const session = state.chatSessions.find((s: ChatSession) => s.id === sessionId)
        if (!session) return

        const isPrivate = session.type === 'private'
        const targetId = isPrivate ? sessionId.replace('s-p-', '') : sessionId

        state.messages.forEach((m: Message) => {
          if (isPrivate) {
            if (m.receiverId === targetId || m.senderId === targetId) {
              m.status = status
            }
          } else {
            if (m.groupId === sessionId) {
              m.status = status
            }
          }
        })
      })),

      updateApprovalStatus: (approvalId, status, comment) => set(produce((state) => {
        const approval = state.approvals.find((a: Approval) => a.id === approvalId)
        if (approval) {
          approval.status = status
          approval.updatedAt = new Date().toISOString()
          const flowStep = approval.approvalFlow.find(
            (f: any) => f.approverId === approval.currentApproverId
          )
          if (flowStep) {
            flowStep.status = status
            flowStep.comment = comment
            flowStep.approvedAt = new Date().toISOString()
          }
        }
      })),

      updateApprovalAndNotify: (approvalId, status, comment) => {
        const { updateApprovalStatus, addNotification, currentUser } = get()
        updateApprovalStatus(approvalId, status, comment)

        const approval = get().approvals.find(a => a.id === approvalId)
        if (approval) {
          addNotification({
            id: `n-${Date.now()}`,
            title: `审批${status === 'approved' ? '已通过' : '已驳回'}`,
            content: `您的「${approval.title}」${status === 'approved' ? '已通过审批' : '已被驳回'}`,
            type: status === 'approved' ? 'success' : 'error',
            status: 'unread',
            createdAt: new Date().toISOString(),
            relatedId: approvalId,
            relatedType: 'approval',
            senderId: currentUser?.id,
            senderName: currentUser?.name
          })
        }
      },

      markNotificationAsRead: (notificationId) => set(produce((state) => {
        const notification = state.notifications.find((n: SystemNotification) => n.id === notificationId)
        if (notification) {
          notification.status = 'read'
        }
      })),

      markAllNotificationsAsRead: () => set(produce((state) => {
        state.notifications.forEach((n: SystemNotification) => {
          n.status = 'read'
        })
      })),

      addNotification: (notification) => set(produce((state) => {
        state.notifications.unshift(notification)
      })),

      incrementUnreadCount: (sessionId) => set(produce((state) => {
        const session = state.chatSessions.find((s: ChatSession) => s.id === sessionId)
        if (session) {
          session.unreadCount += 1
        }
      })),

      resetUnreadCount: (sessionId) => set(produce((state) => {
        const session = state.chatSessions.find((s: ChatSession) => s.id === sessionId)
        if (session) {
          session.unreadCount = 0
        }
      })),

      updateSessionLastMessage: (sessionId, message, time) => set(produce((state) => {
        const session = state.chatSessions.find((s: ChatSession) => s.id === sessionId)
        if (session) {
          session.lastMessage = message
          session.lastMessageTime = time
        }
      }))
    }),
    {
      name: 'enterprise-collaboration-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        departments: state.departments,
        employees: state.employees,
        messages: state.messages.slice(-500),
        chatSessions: state.chatSessions,
        approvals: state.approvals,
        notifications: state.notifications.slice(-100)
      })
    }
  )
)

export const useSessionMessages = (sessionId: string | null, limit = 100) => {
  return useAppStore((state) => {
    if (!sessionId) return []
    const session = state.chatSessions.find(s => s.id === sessionId)
    if (!session) return []

    const isPrivate = session.type === 'private'
    const targetId = isPrivate ? sessionId.replace('s-p-', '') : sessionId

    const filtered = state.messages.filter((m: Message) => {
      if (isPrivate) {
        return (
          (m.senderId === state.currentUser?.id && m.receiverId === targetId) ||
          (m.receiverId === state.currentUser?.id && m.senderId === targetId)
        )
      }
      return m.isGroup && m.groupId === sessionId
    })

    return filtered.slice(-limit)
  })
}
