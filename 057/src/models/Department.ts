import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface DepartmentAttributes {
  id?: number;
  name: string;
  code: string;
  parentId?: number;
  level: number;
  sortOrder: number;
  managerId?: number;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Department extends Model<DepartmentAttributes> implements DepartmentAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId?: number;
  public level!: number;
  public sortOrder!: number;
  public managerId?: number;
  public description?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly children?: Department[];
}

Department.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_id',
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'manager_id',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'departments',
    timestamps: true,
  }
);

Department.hasMany(Department, {
  as: 'children',
  foreignKey: 'parentId',
});

Department.belongsTo(Department, {
  as: 'parent',
  foreignKey: 'parentId',
});

export default Department;
