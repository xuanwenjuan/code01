import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface EquipmentCategoryAttributes {
  id: number;
  name: string;
  parentId?: number;
  level: number;
  sort: number;
  icon?: string;
  description?: string;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EquipmentCategoryCreationAttributes extends Optional<EquipmentCategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'parentId' | 'icon' | 'description' | 'level' | 'sort'> {}

class EquipmentCategory extends Model<EquipmentCategoryAttributes, EquipmentCategoryCreationAttributes> implements EquipmentCategoryAttributes {
  public id!: number;
  public name!: string;
  public parentId?: number;
  public level!: number;
  public sort!: number;
  public icon?: string;
  public description?: string;
  public status!: number;
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
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '父类目ID'
    },
    level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '层级'
    },
    sort: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '排序'
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '图标'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '描述'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态：1-启用，0-禁用'
    }
  },
  {
    sequelize,
    tableName: 'equipment_categories',
    modelName: 'EquipmentCategory',
    timestamps: true
  }
);

export default EquipmentCategory;
