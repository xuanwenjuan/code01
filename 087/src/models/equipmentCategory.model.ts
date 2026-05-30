import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { CategoryStatus } from '../types';

export interface EquipmentCategoryAttributes {
  id?: number;
  name: string;
  code: string;
  parentId?: number;
  level: number;
  sortOrder: number;
  description?: string;
  status: CategoryStatus;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class EquipmentCategory extends Model<EquipmentCategoryAttributes> implements EquipmentCategoryAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId?: number;
  public level!: number;
  public sortOrder!: number;
  public description?: string;
  public status!: CategoryStatus;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EquipmentCategory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '类目名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '类目编码'
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '父级类目ID'
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '层级'
    },
    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '排序'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '描述'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CategoryStatus)),
      allowNull: false,
      defaultValue: CategoryStatus.ACTIVE,
      comment: '状态'
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '创建人'
    }
  },
  {
    sequelize,
    tableName: 'equipment_categories',
    modelName: 'EquipmentCategory'
  }
);

EquipmentCategory.hasMany(EquipmentCategory, {
  as: 'children',
  foreignKey: 'parentId'
});

EquipmentCategory.belongsTo(EquipmentCategory, {
  as: 'parent',
  foreignKey: 'parentId'
});

export default EquipmentCategory;
