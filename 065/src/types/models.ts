export interface IUser {
  id: number;
  username: string;
  password: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: string;
  realName?: string;
  idCard?: string;
  isVerified: boolean;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceCategory {
  id: number;
  name: string;
  parentId?: number;
  level: number;
  icon?: string;
  description?: string;
  basePrice: number;
  priceUnit: string;
  sort: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  children?: IServiceCategory[];
}

export interface IAuntProfile {
  id: number;
  userId: number;
  realName: string;
  idCard: string;
  idCardFront?: string;
  idCardBack?: string;
  avatar?: string;
  phone: string;
  age?: number;
  gender?: string;
  serviceYears: number;
  skills: string | string[];
  serviceScope: string;
  description?: string;
  avgRating: number;
  orderCount: number;
  status: string;
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder {
  id: number;
  orderNo: string;
  userId: number;
  auntId?: number;
  categoryId: number;
  serviceAddress: string;
  servicePhone: string;
  serviceTime: Date;
  serviceDuration: number;
  contactName: string;
  totalAmount: number;
  actualAmount?: number;
  platformCommission?: number;
  auntIncome?: number;
  status: string;
  requirement?: string;
  remark?: string;
  cancelReason?: string;
  expireTime?: Date;
  acceptTime?: Date;
  startTime?: Date;
  completeTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderStatusLog {
  id: number;
  orderId: number;
  oldStatus?: string;
  newStatus: string;
  operatorId?: number;
  operatorRole?: string;
  remark?: string;
  createdAt: Date;
}

export interface IOrderReview {
  id: number;
  orderId: number;
  userId: number;
  auntId: number;
  rating: number;
  content?: string;
  images?: string | string[];
  serviceScore: number;
  attitudeScore: number;
  punctualityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISettlement {
  id: number;
  settlementNo: string;
  auntId: number;
  orderId: number;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  auntAmount: number;
  status: string;
  settledAt?: Date;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOperationLog {
  id: number;
  module: string;
  operationType: string;
  operatorId?: number;
  operatorRole?: string;
  operatorName?: string;
  targetId?: number;
  targetType?: string;
  detail?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
