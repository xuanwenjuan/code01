import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../index';
import { UserRole } from '../../types';

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  realName: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  status: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public realName!: string;
  public phone!: string;
  public email?: string;
  public role!: UserRole;
  public avatar?: string;
  public status!: number;
  public lastLoginAt?: Date;
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
      allowNull: false,
      unique: true,
      comment: '手机号'
    },
    email: {
      type: DataTypes.STRING(100),
      comment: '邮箱'
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.OPERATOR,
      comment: '角色'
    },
    avatar: {
      type: DataTypes.STRING(255),
      comment: '头像'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态 1-启用 0-禁用'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      comment: '最后登录时间'
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['username'] },
      { fields: ['phone'] },
      { fields: ['role'] },
      { fields: ['status'] }
    ]
  }
);

export default User;
