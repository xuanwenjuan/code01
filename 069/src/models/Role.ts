import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum RoleType {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DISPATCHER = 'dispatcher',
  DRIVER = 'driver',
  CUSTOMER = 'customer'
}

export interface RoleAttributes {
  id: number;
  name: string;
  code: RoleType;
  description?: string;
  permissions: string[];
  isActive: boolean;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'isActive'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
  public code!: RoleType;
  public description?: string;
  public permissions!: string[];
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '角色名称'
    },
    code: {
      type: DataTypes.ENUM(...Object.values(RoleType)),
      allowNull: false,
      unique: true,
      comment: '角色编码'
    },
    description: {
      type: DataTypes.STRING(200),
      comment: '角色描述'
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: '权限列表'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用'
    }
  },
  {
    sequelize,
    tableName: 'roles',
    modelName: 'Role'
  }
);

export default Role;
