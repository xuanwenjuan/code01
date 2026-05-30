export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DISPATCHER = 'dispatcher',
  BRANCH_ADMIN = 'branch_admin',
  FINANCE = 'finance',
  DRIVER = 'driver',
  CUSTOMER = 'customer'
}

export const RolePermissions: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['*'],
  [UserRole.MANAGER]: ['order:*', 'vehicle:*', 'branch:read', 'settlement:read'],
  [UserRole.DISPATCHER]: ['order:create', 'order:update', 'order:read', 'vehicle:read'],
  [UserRole.BRANCH_ADMIN]: ['order:read', 'vehicle:read', 'branch:read'],
  [UserRole.FINANCE]: ['settlement:*', 'order:read', 'financial:*'],
  [UserRole.DRIVER]: ['order:read', 'vehicle:read'],
  [UserRole.CUSTOMER]: ['order:create', 'order:read']
};

export interface UserBase {
  username: string;
  email?: string;
  phone?: string;
  realName?: string;
  role: UserRole;
  branchId?: number;
  avatar?: string;
}

export interface User extends UserBase {
  id: number;
  password: string;
  status: 'active' | 'inactive';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UserUpdateInput extends Partial<Omit<UserCreateInput, 'password'>> {
  password?: string;
}

export interface AuthPayload {
  id: number;
  username: string;
  role: UserRole;
  roleId: number;
  branchId?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User>;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
