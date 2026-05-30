import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { UserRole } from '../constants';

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  realName: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  status: boolean;
  lastLoginTime?: Date;
  lastLoginIp?: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'email' | 'avatar' | 'status' | 'lastLoginTime' | 'lastLoginIp'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public realName!: string;
  public phone!: string;
  public email?: string;
  public role!: UserRole;
  public avatar?: string;
  public status!: boolean;
  public lastLoginTime?: Date;
  public lastLoginIp?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: '用户ID'
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
      comment: '手机号'
    },
    email: {
      type: DataTypes.STRING(100),
      comment: '邮箱'
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.CUSTOMER,
      comment: '角色'
    },
    avatar: {
      type: DataTypes.STRING(255),
      comment: '头像'
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '状态'
    },
    lastLoginTime: {
      type: DataTypes.DATE,
      comment: '最后登录时间'
    },
    lastLoginIp: {
      type: DataTypes.STRING(50),
      comment: '最后登录IP'
    }
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    comment: '用户表'
  }
);

export default User;
