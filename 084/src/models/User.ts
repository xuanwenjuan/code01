import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  DISPATCHER = 'dispatcher',
  AREA_MANAGER = 'area_manager',
  FINANCE = 'finance',
  WORKER = 'worker'
}

export const RolePermissionMap: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'area:create', 'area:read', 'area:update', 'area:delete',
    'cleaner:create', 'cleaner:read', 'cleaner:update', 'cleaner:delete',
    'order:create', 'order:read', 'order:assign', 'order:accept', 'order:update', 'order:delete', 'order:review', 'order:cancel',
    'performance:calculate', 'performance:read', 'performance:update', 'performance:export',
    'log:read', 'log:export'
  ],
  [UserRole.DISPATCHER]: [
    'area:read',
    'cleaner:read',
    'order:create', 'order:read', 'order:assign', 'order:update', 'order:cancel',
    'performance:read'
  ],
  [UserRole.AREA_MANAGER]: [
    'area:read',
    'cleaner:read', 'cleaner:update',
    'order:create', 'order:read', 'order:assign', 'order:accept', 'order:update', 'order:review',
    'performance:calculate', 'performance:read', 'performance:update'
  ],
  [UserRole.FINANCE]: [
    'performance:read', 'performance:export',
    'cleaner:read',
    'order:read'
  ],
  [UserRole.WORKER]: [
    'order:read', 'order:accept', 'order:start', 'order:complete', 'order:report',
    'cleaner:read-own'
  ]
};

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  realName: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'disabled';
  lastLogin?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public realName!: string;
  public phone!: string;
  public role!: UserRole;
  public status!: 'active' | 'disabled';
  public lastLogin?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    realName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.WORKER
    },
    status: {
      type: DataTypes.ENUM('active', 'disabled'),
      allowNull: false,
      defaultValue: 'active'
    },
    lastLogin: {
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true
  }
);

export default User;