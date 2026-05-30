export type EmployeeStatus = 'active' | 'vacation' | 'resigned'
export type MessageStatus = 'unread' | 'read' | 'revoked'
export type MessageType = 'text' | 'image' | 'file'
export type ChatType = 'private' | 'group'
export type ApprovalType = 'leave' | 'reimbursement' | 'supplies'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type NotificationType = 'info' | 'warning' | 'success' | 'error'
export type NotificationStatus = 'unread' | 'read'
export type ModuleType = 'organization' | 'chat' | 'approval' | 'search'

export interface Department {
  id: string
  name: string
  parentId: string | null
  employeeCount?: number
  children?: Department[]
}

export interface Employee {
  id: string
  name: string
  employeeNo: string
  position: string
  departmentId: string
  departmentName: string
  supervisorId: string | null
  supervisorName: string | null
  status: EmployeeStatus
  avatar: string
  email: string
  phone: string
  joinDate?: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  receiverId: string
  receiverName?: string
  content: string
  type: MessageType
  status: MessageStatus
  createdAt: string
  isGroup: boolean
  groupId?: string
  groupName?: string
  fileUrl?: string
  fileName?: string
}

export interface ChatSession {
  id: string
  name: string
  avatar: string
  type: ChatType
  lastMessage: string
  lastMessageTime: string
  lastMessageSender?: string
  unreadCount: number
  members?: string[]
  memberCount?: number
  isOnline?: boolean
}

export interface Approval {
  id: string
  title: string
  type: ApprovalType
  applicantId: string
  applicantName: string
  applicantAvatar: string
  departmentId: string
  departmentName: string
  status: ApprovalStatus
  currentApproverId: string
  currentApproverName: string
  createdAt: string
  updatedAt: string
  details: LeaveDetails | ReimbursementDetails | SuppliesDetails
  approvalFlow: ApprovalFlow[]
  priority?: 'low' | 'medium' | 'high'
}

export interface LeaveDetails {
  leaveType: string
  startDate: string
  endDate: string
  days: number
  reason: string
}

export interface ReimbursementDetails {
  totalAmount: number
  items: ReimbursementItem[]
  reason: string
}

export interface ReimbursementItem {
  name: string
  amount: number
  description: string
}

export interface SuppliesDetails {
  items: SupplyItem[]
  reason: string
}

export interface SupplyItem {
  name: string
  quantity: number
  unit: string
  price?: number
}

export interface ApprovalFlow {
  approverId: string
  approverName: string
  approverAvatar?: string
  status: ApprovalStatus
  approvedAt?: string
  comment?: string
  order: number
}

export interface SystemNotification {
  id: string
  title: string
  content: string
  type: NotificationType
  status: NotificationStatus
  createdAt: string
  relatedId?: string
  relatedType?: string
  senderId?: string
  senderName?: string
}

export interface SearchResult {
  type: 'message' | 'notification' | 'approval'
  item: Message | SystemNotification | Approval
  highlight: string
}

export interface TableColumn<T = any> {
  title: string
  dataIndex?: keyof T
  key: string
  width?: number
  render?: (value: any, record: T, index: number) => React.ReactNode
}
