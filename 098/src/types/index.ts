export enum UserRole {
  ADMIN = 'admin',
  AREA_MANAGER = 'area_manager',
  PURCHASER = 'purchaser',
  MAINTENANCE_WORKER = 'maintenance_worker'
}

export enum PlantCategoryType {
  TREE = 'tree',
  SHRUB = 'shrub',
  AQUATIC = 'aquatic',
  TURF = 'turf'
}

export enum PlantHealthStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DISEASED = 'diseased'
}

export enum WorkOrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}

export enum WorkOrderType {
  WATERING = 'watering',
  FERTILIZING = 'fertilizing',
  PRUNING = 'pruning',
  PEST_CONTROL = 'pest_control',
  REPLANTING = 'replanting'
}

export enum MaterialType {
  PESTICIDE = 'pesticide',
  FERTILIZER = 'fertilizer',
  TOOL = 'tool',
  SEEDLING = 'seedling'
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  areaId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
