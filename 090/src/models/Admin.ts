import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { AdminRole } from '../types';

interface AdminAttributes {
  id: number;
  username: string;
  password: string;
  realName: string;
  phone: string;
  role: AdminRole;
  storeId?: number;
  status: number;
  lastLoginTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AdminCreationAttributes extends Optional<AdminAttributes, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginTime'> {}

class Admin extends Model<AdminAttributes, AdminCreationAttributes> implements AdminAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public realName!: string;
  public phone!: string;
  public role!: AdminRole;
  public storeId?: number;
  public status!: number;
  public readonly lastLoginTime?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Admin.init(
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
      allowNull: false,
      comment: '手机号'
    },
    role: {
      type: DataTypes.ENUM(...Object.values(AdminRole)),
      allowNull: false,
      defaultValue: AdminRole.RENTAL_STAFF,
      comment: '角色'
    },
    storeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '所属门店ID'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态：1-启用，0-禁用'
    },
    lastLoginTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间'
    }
  },
  {
    sequelize,
    tableName: 'admins',
    modelName: 'Admin',
    timestamps: true
  }
);

export default Admin;
