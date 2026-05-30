import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { CategoryStatus } from '../types';

interface ServiceCategoryAttributes {
  id: number;
  name: string;
  parentId?: number;
  level: number;
  icon?: string;
  description?: string;
  basePrice: number;
  priceUnit: string;
  sort: number;
  status: CategoryStatus;
}

interface ServiceCategoryCreationAttributes extends Optional<ServiceCategoryAttributes, 'id' | 'parentId' | 'icon' | 'description' | 'sort' | 'status'> {}

class ServiceCategory extends Model<ServiceCategoryAttributes, ServiceCategoryCreationAttributes> implements ServiceCategoryAttributes {
  public id!: number;
  public name!: string;
  public parentId?: number;
  public level!: number;
  public icon?: string;
  public description?: string;
  public basePrice!: number;
  public priceUnit!: string;
  public sort!: number;
  public status!: CategoryStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly children?: ServiceCategory[];
}

ServiceCategory.init(
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
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_id',
      defaultValue: 0,
    },
    level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'base_price',
    },
    priceUnit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '小时',
      field: 'price_unit',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CategoryStatus)),
      allowNull: false,
      defaultValue: CategoryStatus.ACTIVE,
    },
  },
  {
    sequelize,
    modelName: 'ServiceCategory',
    tableName: 'service_categories',
    timestamps: true,
  }
);

ServiceCategory.hasMany(ServiceCategory, {
  as: 'children',
  foreignKey: 'parentId',
});

ServiceCategory.belongsTo(ServiceCategory, {
  as: 'parent',
  foreignKey: 'parentId',
});

export default ServiceCategory;