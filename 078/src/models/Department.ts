import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Department extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId!: number | null;
  public managerId!: number | null;
  public employeeCount!: number;
  public sort!: number;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Department.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '部门名称'
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '部门编码'
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '上级部门ID'
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '部门负责人ID'
    },
    employeeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '员工人数'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1启用，0禁用'
    }
  },
  {
    sequelize,
    modelName: 'Department',
    tableName: 'departments',
    comment: '部门表'
  }
);

export default Department;
