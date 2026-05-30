import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { UserRole } from '../constants/role.constants';

export interface IUserAttributes {
  id?: number;
  username: string;
  password: string;
  realName: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class User extends Model<IUserAttributes> implements IUserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public realName!: string;
  public phone!: string;
  public role!: UserRole;
  public avatar?: string;
  public isActive!: boolean;
  public lastLoginAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名',
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码',
    },
    realName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '真实姓名',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '手机号',
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.PROCESSOR,
      comment: '角色',
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否激活',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['username'] },
      { fields: ['phone'] },
      { fields: ['role'] },
    ],
  }
);

export default User;
