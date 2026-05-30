import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Department extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId!: number | null;
  public description!: string;
  public sort!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Department.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '部门名称',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '部门编码',
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '父部门ID',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '部门描述',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否激活',
    },
  },
  {
    sequelize,
    tableName: 'departments',
    modelName: 'Department',
    timestamps: true,
  }
);

export default Department;
