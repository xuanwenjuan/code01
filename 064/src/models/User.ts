import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';
import { UserRole } from '../types';

export class User extends Model {
  public id!: number;
  public username!: string;
  public password!: string;
  public realName!: string;
  public phone!: string;
  public email!: string;
  public role!: UserRole;
  public avatar!: string;
  public status!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
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
      allowNull: false,
      comment: '真实姓名'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '手机号'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱'
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.STUDENT,
      comment: '角色'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像'
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '状态 true:启用 false:禁用'
    }
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    indexes: [
      { fields: ['username'] },
      { fields: ['phone'] },
      { fields: ['role'] }
    ]
  }
);
