import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { UserRole } from '../types';

export interface UserAttributes {
  id: number;
  username: string;
  password: string;
  realName?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  storeId?: number;
  status: 'active' | 'inactive';
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public realName?: string;
  public phone?: string;
  public email?: string;
  public avatar?: string;
  public role!: UserRole;
  public storeId?: number;
  public status!: 'active' | 'inactive';
  public lastLoginAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码'
    },
    realName: {
      type: DataTypes.STRING(50),
      comment: '真实姓名'
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: '手机号'
    },
    email: {
      type: DataTypes.STRING(100),
      comment: '邮箱'
    },
    avatar: {
      type: DataTypes.STRING(255),
      comment: '头像'
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.CUSTOMER,
      comment: '角色'
    },
    storeId: {
      type: DataTypes.INTEGER,
      comment: '所属门店ID'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
      comment: '状态'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      comment: '最后登录时间'
    }
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true
  }
);

export default User;
