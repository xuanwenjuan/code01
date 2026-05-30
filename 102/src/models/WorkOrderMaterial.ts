import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import WorkOrder from './WorkOrder';
import Material from './Material';

export interface WorkOrderMaterialAttributes {
  id?: number;
  workOrderId: number;
  materialId: number;
  quantity: number;
  actualQuantity?: number;
  lossQuantity?: number;
  unitPrice?: number;
  totalCost?: number;
  isLocked?: boolean;
  lockedAt?: Date;
  lockedBy?: number;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class WorkOrderMaterial extends Model<WorkOrderMaterialAttributes> implements WorkOrderMaterialAttributes {
  public id!: number;
  public workOrderId!: number;
  public materialId!: number;
  public quantity!: number;
  public actualQuantity?: number;
  public lossQuantity?: number;
  public unitPrice?: number;
  public totalCost?: number;
  public isLocked?: boolean;
  public lockedAt?: Date;
  public lockedBy?: number;
  public remarks?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly workOrder?: WorkOrder;
  public readonly material?: Material;
}

WorkOrderMaterial.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '工单ID',
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '原料ID',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '计划用量',
    },
    actualQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '实际用量',
    },
    lossQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '损耗数量',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '单价',
    },
    totalCost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '总成本',
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否锁定库存',
    },
    lockedAt: {
      type: DataTypes.DATE,
      comment: '锁定时间',
    },
    lockedBy: {
      type: DataTypes.INTEGER,
      comment: '锁定人ID',
    },
    remarks: {
      type: DataTypes.TEXT,
      comment: '备注',
    },
  },
  {
    sequelize,
    modelName: 'WorkOrderMaterial',
    tableName: 'work_order_materials',
    indexes: [
      { fields: ['workOrderId'] },
      { fields: ['materialId'] },
      { fields: ['isLocked'] },
    ],
  }
);

WorkOrderMaterial.belongsTo(WorkOrder, {
  foreignKey: 'workOrderId',
  as: 'workOrder',
});

WorkOrder.hasMany(WorkOrderMaterial, {
  foreignKey: 'workOrderId',
  as: 'materials',
});

WorkOrderMaterial.belongsTo(Material, {
  foreignKey: 'materialId',
  as: 'material',
});

Material.hasMany(WorkOrderMaterial, {
  foreignKey: 'materialId',
  as: 'workOrderMaterials',
});

export default WorkOrderMaterial;
