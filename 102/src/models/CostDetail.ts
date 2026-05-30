import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import CostSettlement from './CostSettlement';
import Material from './Material';

export interface CostDetailAttributes {
  id?: number;
  settlementId: number;
  costType: string;
  materialId?: number;
  materialName?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  totalPrice: number;
  description?: string;
  createdAt?: Date;
}

class CostDetail extends Model<CostDetailAttributes> implements CostDetailAttributes {
  public id!: number;
  public settlementId!: number;
  public costType!: string;
  public materialId?: number;
  public materialName?: string;
  public quantity?: number;
  public unit?: string;
  public unitPrice?: number;
  public totalPrice!: number;
  public description?: string;
  public readonly createdAt!: Date;

  public readonly settlement?: CostSettlement;
  public readonly material?: Material;
}

CostDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    settlementId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '结算ID',
    },
    costType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '成本类型',
    },
    materialId: {
      type: DataTypes.INTEGER,
      comment: '原料ID',
    },
    materialName: {
      type: DataTypes.STRING(100),
      comment: '原料名称',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '数量',
    },
    unit: {
      type: DataTypes.STRING(20),
      comment: '单位',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '单价',
    },
    totalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '总价',
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述',
    },
  },
  {
    sequelize,
    modelName: 'CostDetail',
    tableName: 'cost_details',
    updatedAt: false,
    indexes: [
      { fields: ['settlementId'] },
      { fields: ['costType'] },
    ],
  }
);

CostDetail.belongsTo(CostSettlement, {
  foreignKey: 'settlementId',
  as: 'settlement',
});

CostSettlement.hasMany(CostDetail, {
  foreignKey: 'settlementId',
  as: 'costDetails',
});

CostDetail.belongsTo(Material, {
  foreignKey: 'materialId',
  as: 'material',
});

export default CostDetail;
