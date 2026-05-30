export interface IResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export interface IPaginationParams {
  page: number;
  pageSize: number;
}

export interface IPaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  FINANCE = 'finance',
  OPERATOR = 'operator',
  DISTRIBUTOR = 'distributor',
  VIEWER = 'viewer',
}

export interface IUserPayload {
  id: number;
  username: string;
  role: UserRole;
  distributorId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}
