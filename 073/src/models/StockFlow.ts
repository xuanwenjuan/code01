import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Reagent from './Reagent';
import Stock from './Stock';
import User from './User';

interface StockFlowAttributes {
  id: number;
  stockId: number;
  reagentId: number;
  flowType: string;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  operatorId: number;
  relatedType: string;
  relatedId: number;
  remarks: string;
}

interface StockFlowCreationAttributes extends Optional<StockFlowAttributes, 'id' | 'relatedType' | 'relatedId' | 'remarks'> {}

class StockFlow extends Model<StockFlowAttributes, StockFlowCreationAttributes> implements StockFlowAttributes {
  public id!: number;
  public stockId!: number;
  public reagentId!: number;
  public flowType!: string;
  public quantity!: number;
  public beforeQuantity!: number;
  public afterQuantity!: number;
  public operatorId!: number;
  public relatedType!: string;
  public relatedId!: number;
  public remarks!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly stock?: Stock;
  public readonly reagent?: Reagent;
  public readonly operator?: User;
}

StockFlow.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    stockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'stock_id'
    },
    reagentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'reagent_id'
    },
    flowType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '流水类型: inbound, outbound, return, scrap, adjust'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '变动数量'
    },
    beforeQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '变动前数量'
    },
    afterQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '变动后数量'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'operator_id',
      comment: '操作员ID'
    },
    relatedType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '关联类型'
    },
    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'related_id',
      comment: '关联ID'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'stock_flows',
    modelName: 'StockFlow'
  }
);

StockFlow.belongsTo(Stock, { as: 'stock', foreignKey: 'stockId' });
StockFlow.belongsTo(Reagent, { as: 'reagent', foreignKey: 'reagentId' });
StockFlow.belongsTo(User, { as: 'operator', foreignKey: 'operatorId' });

export default StockFlow;
