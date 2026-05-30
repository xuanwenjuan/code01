import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Warehouse extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public address?: string;
  public managerId?: number;
  public sort!: number;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Warehouse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '仓库名称'
    },
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      comment: '仓库编码'
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '仓库地址'
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '管理员ID'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1-启用，0-停用'
    }
  },
  {
    sequelize,
    modelName: 'Warehouse',
    tableName: 'warehouses',
    comment: '仓库表'
  }
);

export default Warehouse;