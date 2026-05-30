export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  FINANCE = 'finance',
  MERCHANT = 'merchant',
  INFLUENCER = 'influencer',
  SERVICE_PROVIDER = 'service_provider',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

export enum CategoryStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  INACTIVE = 'inactive',
}

export enum InfluencerStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum OrderStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  MATCHING = 'matching',
  NEGOTIATING = 'negotiating',
  SCRIPT_CONFIRMED = 'script_confirmed',
  SHOOTING = 'shooting',
  VIDEO_PUBLISHED = 'video_published',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SETTLED = 'settled',
  FROZEN = 'frozen',
  FAILED = 'failed',
}

export enum SettlementType {
  INFLUENCER_EARNING = 'influencer_earning',
  PLATFORM_COMMISSION = 'platform_commission',
  SERVICE_PROVIDER_SHARE = 'service_provider_share',
}

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.DRAFT]: [OrderStatus.PUBLISHED, OrderStatus.CANCELLED],
  [OrderStatus.PUBLISHED]: [OrderStatus.MATCHING, OrderStatus.CANCELLED, OrderStatus.EXPIRED],
  [OrderStatus.MATCHING]: [OrderStatus.NEGOTIATING, OrderStatus.CANCELLED],
  [OrderStatus.NEGOTIATING]: [OrderStatus.SCRIPT_CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.SCRIPT_CONFIRMED]: [OrderStatus.SHOOTING, OrderStatus.CANCELLED],
  [OrderStatus.SHOOTING]: [OrderStatus.VIDEO_PUBLISHED, OrderStatus.CANCELLED],
  [OrderStatus.VIDEO_PUBLISHED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.EXPIRED]: [],
};

export const PLATFORM_COMMISSION_RATE = 0.1;
export const SERVICE_PROVIDER_SHARE_RATE = 0.05;
