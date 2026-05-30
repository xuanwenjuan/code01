import { UserRole } from '../common/enums';

export interface UserFilterParams {
  username?: string;
  realName?: string;
  phone?: string;
  role?: UserRole;
  status?: boolean;
  page?: number;
  pageSize?: number;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  realName: string;
  phone: string;
  email?: string;
  role?: UserRole;
}

export interface CreateUserDto {
  username: string;
  password: string;
  realName: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  status?: boolean;
}

export interface UpdateUserDto {
  realName?: string;
  phone?: string;
  email?: string;
  role?: UserRole;
  avatar?: string;
  status?: boolean;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: number;
  username: string;
  realName: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  status: boolean;
  lastLoginTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}