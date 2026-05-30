import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { CategoryStatus } from '../types';

class MaterialCategory extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId?: number;
  public level!: number;
  public sort!: number;
  public status!: CategoryStatus;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MaterialCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      type: DataTypes.INTEGER,
      comment: '父级ID'
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '层级'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CategoryStatus)),
      defaultValue: CategoryStatus.ACTIVE,
      comment: '状态'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    }
  },
  {
    sequelize,
    modelName: 'MaterialCategory',
    tableName: 'material_categories',
    comment: '物料类目表'
  }
);

export default MaterialCategory;
