import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Wine from './Wine';
import WorkOrder from './WorkOrder';
import CostDetail from './CostDetail';

export interface CostSettlementAttributes {
  id?: number;
  settlementNo: string;
  wineId: number;
  workOrderId?: number;
  materialCost: number;
  laborCost: number;
  storageCost: number;
  otherCost: number;
  totalCost: number;
  unitCost: number;
  quantity: number;
  estimatedProfit?: number;
  profitMargin?: number;
  settlementDate: Date;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class CostSettlement extends Model<CostSettlementAttributes> implements CostSettlementAttributes {
  public id!: number;
  public settlementNo!: string;
  public wineId!: number;
  public workOrderId?: number;
  public materialCost!: number;
  public laborCost!: number;
  public storageCost!: number;
  public otherCost!: number;
  public totalCost!: number;
  public unitCost!: number;
  public quantity!: number;
  public estimatedProfit?: number;
  public profitMargin?: number;
  public settlementDate!: Date;
  public remarks?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly wine?: Wine;
  public readonly workOrder?: WorkOrder;
  public readonly costDetails?: CostDetail[];
}

CostSettlement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    settlementNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '结算单号',
    },
    wineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '酒品ID',
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      comment: '工单ID',
    },
    materialCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '原料成本',
    },
    laborCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '人工成本',
    },
    storageCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '仓储成本',
    },
    otherCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '其他成本',
    },
    totalCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总成本',
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '单位成本',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '数量(升)',
    },
    estimatedProfit: {
      type: DataTypes.DECIMAL(12, 2),
      comment: '预估利润',
    },
    profitMargin: {
      type: DataTypes.DECIMAL(5, 2),
      comment: '利润率(%)',
    },
    settlementDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '结算日期',
    },
    remarks: {
      type: DataTypes.TEXT,
      comment: '备注',
    },
  },
  {
    sequelize,
    modelName: 'CostSettlement',
    tableName: 'cost_settlements',
    indexes: [
      { fields: ['settlementNo'], unique: true },
      { fields: ['wineId'] },
      { fields: ['workOrderId'] },
      { fields: ['settlementDate'] },
    ],
  }
);

CostSettlement.belongsTo(Wine, {
  foreignKey: 'wineId',
  as: 'wine',
});

Wine.hasMany(CostSettlement, {
  foreignKey: 'wineId',
  as: 'costSettlements',
});

CostSettlement.belongsTo(WorkOrder, {
  foreignKey: 'workOrderId',
  as: 'workOrder',
});

WorkOrder.hasMany(CostSettlement, {
  foreignKey: 'workOrderId',
  as: 'costSettlements',
});

export default CostSettlement;
