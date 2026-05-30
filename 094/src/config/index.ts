import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'lacquerware_workshop',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  logLevel: process.env.LOG_LEVEL || 'info',
};

export const ROLES = {
  ARTISAN: 'artisan',
  MATERIAL_ADMIN: 'material_admin',
  OPERATION: 'operation',
  FINANCE: 'finance',
  ADMIN: 'admin',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

export const WORK_ORDER_STATUS = {
  PENDING_DEPOSIT: 'pending_deposit',
  CONFIRMED: 'confirmed',
  DESIGN_FINALIZED: 'design_finalized',
  MATERIAL_COLLECTED: 'material_collected',
  IN_PRODUCTION: 'in_production',
  QUALITY_INSPECTION: 'quality_inspection',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export type WorkOrderStatusType = typeof WORK_ORDER_STATUS[keyof typeof WORK_ORDER_STATUS];

export const MATERIAL_STATUS = {
  SUFFICIENT: 'sufficient',
  LOW: 'low',
  EXHAUSTED: 'exhausted',
} as const;

export type MaterialStatusType = typeof MATERIAL_STATUS[keyof typeof MATERIAL_STATUS];
