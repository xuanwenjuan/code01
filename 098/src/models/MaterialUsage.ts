import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MaterialUsageAttributes {
  id: number;
  materialId: number;
  workOrderId?: number;
  areaId: number;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  usedBy: number;
  usageDate: Date;
  remarks?: string;
}

interface MaterialUsageCreationAttributes extends Optional<MaterialUsageAttributes, 'id' | 'usageDate'> {}

class MaterialUsage extends Model<MaterialUsageAttributes, MaterialUsageCreationAttributes> implements MaterialUsageAttributes {
  public id!: number;
  public materialId!: number;
  public workOrderId?: number;
  public areaId!: number;
  public quantity!: number;
  public unitPrice?: number;
  public totalPrice?: number;
  public usedBy!: number;
  public usageDate!: Date;
  public remarks?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MaterialUsage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'material_id'
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'work_order_id'
    },
    areaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'area_id'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'unit_price'
    },
    totalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'total_price'
    },
    usedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'used_by'
    },
    usageDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'usage_date'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'MaterialUsage',
    tableName: 'material_usages',
    timestamps: true
  }
);

export default MaterialUsage;
