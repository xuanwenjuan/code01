import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Requisition from './Requisition';
import Reagent from './Reagent';
import Stock from './Stock';

interface RequisitionItemAttributes {
  id: number;
  requisitionId: number;
  reagentId: number;
  stockId: number;
  quantity: number;
  unitPrice: number;
  returnedQuantity: number;
  remarks: string;
}

interface RequisitionItemCreationAttributes extends Optional<RequisitionItemAttributes, 'id' | 'returnedQuantity' | 'remarks'> {}

class RequisitionItem extends Model<RequisitionItemAttributes, RequisitionItemCreationAttributes> implements RequisitionItemAttributes {
  public id!: number;
  public requisitionId!: number;
  public reagentId!: number;
  public stockId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public returnedQuantity!: number;
  public remarks!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly requisition?: Requisition;
  public readonly reagent?: Reagent;
  public readonly stock?: Stock;
}

RequisitionItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    requisitionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'requisition_id'
    },
    reagentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'reagent_id'
    },
    stockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'stock_id'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '领用数量'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    returnedQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '已归还数量'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'requisition_items',
    modelName: 'RequisitionItem'
  }
);

RequisitionItem.belongsTo(Requisition, { foreignKey: 'requisitionId' });
RequisitionItem.belongsTo(Reagent, { as: 'reagent', foreignKey: 'reagentId' });
RequisitionItem.belongsTo(Stock, { as: 'stock', foreignKey: 'stockId' });
Requisition.hasMany(RequisitionItem, { as: 'items', foreignKey: 'requisitionId' });

export default RequisitionItem;
