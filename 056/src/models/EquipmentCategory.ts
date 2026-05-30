import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class EquipmentCategory extends Model {
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

EquipmentCategory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '分类名称',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '分类编码',
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '父分类ID',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '分类描述',
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
    tableName: 'equipment_categories',
    modelName: 'EquipmentCategory',
    timestamps: true,
  }
);

export default EquipmentCategory;
