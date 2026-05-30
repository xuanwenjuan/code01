import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { ServiceCategoryStatus } from '../types';

interface ServiceCategoryAttributes {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  status: ServiceCategoryStatus;
  commissionRate: number;
  basePrice?: number;
  unit?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceCategoryCreationAttributes extends Optional<ServiceCategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder' | 'status' | 'commissionRate'> {}

class ServiceCategory extends Model<ServiceCategoryAttributes, ServiceCategoryCreationAttributes> implements ServiceCategoryAttributes {
  public id!: string;
  public name!: string;
  public parentId?: string;
  public description?: string;
  public icon?: string;
  public sortOrder!: number;
  public status!: ServiceCategoryStatus;
  public commissionRate!: number;
  public basePrice?: number;
  public unit?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly children?: ServiceCategory[];
}

ServiceCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_id',
      references: {
        model: 'service_categories',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ServiceCategoryStatus)),
      defaultValue: ServiceCategoryStatus.ACTIVE,
      allowNull: false
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 10.00,
      field: 'commission_rate'
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'base_price'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'service_categories',
    timestamps: true
  }
);

ServiceCategory.hasMany(ServiceCategory, {
  as: 'children',
  foreignKey: 'parent_id'
});

ServiceCategory.belongsTo(ServiceCategory, {
  as: 'parent',
  foreignKey: 'parent_id'
});

export default ServiceCategory;
