import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Material from './Material';
import WorkOrder from './WorkOrder';
import User from './User';

interface MaterialConsumptionAttributes {
  id: number;
  workOrderId: number;
  materialId: number;
  plannedQuantity: number;
  actualQuantity: number;
  wasteQuantity: number;
  unitPrice: number;
  totalCost: number;
  remark?: string;
  operatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MaterialConsumptionCreationAttributes extends Optional<MaterialConsumptionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'actualQuantity' | 'wasteQuantity' | 'totalCost'> {}

class MaterialConsumption extends Model<MaterialConsumptionAttributes, MaterialConsumptionCreationAttributes> implements MaterialConsumptionAttributes {
  public id!: number;
  public workOrderId!: number;
  public materialId!: number;
  public plannedQuantity!: number;
  public actualQuantity!: number;
  public wasteQuantity!: number;
  public unitPrice!: number;
  public totalCost!: number;
  public remark?: string;
  public operatedBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly workOrder?: WorkOrder;
  public readonly material?: Material;
  public readonly operator?: User;
}

MaterialConsumption.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    workOrderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '工单ID',
      references: {
        model: 'work_orders',
        key: 'id',
      },
    },
    materialId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '物料ID',
      references: {
        model: 'materials',
        key: 'id',
      },
    },
    plannedQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '计划用量',
    },
    actualQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '实际用量',
    },
    wasteQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '损耗量',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '单价',
    },
    totalCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总成本',
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注',
    },
    operatedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '操作人ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'material_consumptions',
    modelName: 'MaterialConsumption',
    timestamps: true,
    indexes: [
      { fields: ['workOrderId'] },
      { fields: ['materialId'] },
      { fields: ['createdAt'] },
    ],
  }
);

MaterialConsumption.belongsTo(WorkOrder, {
  as: 'workOrder',
  foreignKey: 'workOrderId',
});

WorkOrder.hasMany(MaterialConsumption, {
  as: 'materialConsumptions',
  foreignKey: 'workOrderId',
});

MaterialConsumption.belongsTo(Material, {
  as: 'material',
  foreignKey: 'materialId',
});

Material.hasMany(MaterialConsumption, {
  as: 'consumptions',
  foreignKey: 'materialId',
});

MaterialConsumption.belongsTo(User, {
  as: 'operator',
  foreignKey: 'operatedBy',
});

export default MaterialConsumption;
