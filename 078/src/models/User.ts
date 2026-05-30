import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Department from './Department';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  FINANCE = 'finance',
  MANAGER = 'manager',
  EMPLOYEE = 'employee'
}

class User extends Model {
  public id!: number;
  public username!: string;
  public password!: string;
  public realName!: string;
  public phone!: string;
  public email!: string;
  public role!: UserRole;
  public departmentId!: number | null;
  public avatar!: string | null;
  public status!: number;
  public lastLoginTime!: Date | null;
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
      defaultValue: UserRole.EMPLOYEE,
      comment: '角色：super_admin超级管理员，admin行政管理员，manager部门经理，employee普通员工，finance财务'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '部门ID'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1启用，0禁用'
    },
    lastLoginTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间'
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    comment: '用户表'
  }
);

User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(User, { foreignKey: 'departmentId', as: 'employees' });

export default User;
