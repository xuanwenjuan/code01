import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Department from './Department';
import Role from './Role';

class User extends Model {
  public id!: number;
  public username!: string;
  public password!: string;
  public realName!: string;
  public email?: string;
  public phone?: string;
  public roleId!: number;
  public departmentId!: number;
  public status!: number;
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
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '手机号'
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '角色ID'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '部门ID'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1-启用，0-停用'
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
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

export default User;