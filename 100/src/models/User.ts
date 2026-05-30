import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { UserRole } from '../types';

class User extends Model {
  public id!: number;
  public username!: string;
  public password!: string;
  public realName!: string;
  public role!: UserRole;
  public phone?: string;
  public email?: string;
  public status!: boolean;
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
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      comment: '角色'
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: '手机号'
    },
    email: {
      type: DataTypes.STRING(100),
      comment: '邮箱'
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '状态'
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    comment: '用户表'
  }
);

export default User;
