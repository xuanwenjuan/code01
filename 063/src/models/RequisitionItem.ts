import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Requisition from './Requisition';
import Material from './Material';

class RequisitionItem extends Model {
  public id!: number;
  public requisitionId!: number;
  public materialId!: number;
  public quantity!: number;
  public deliveredQuantity!: number;
  public unitPrice!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RequisitionItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    requisitionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '申领单ID'
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '物资ID'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '申领数量'
    },
    deliveredQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '已发放数量'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价'
    }
  },
  {
    sequelize,
    modelName: 'RequisitionItem',
    tableName: 'requisition_items',
    comment: '申领单明细表'
  }
);

RequisitionItem.belongsTo(Requisition, { foreignKey: 'requisitionId', as: 'requisition' });
RequisitionItem.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });
Requisition.hasMany(RequisitionItem, { foreignKey: 'requisitionId', as: 'items' });

export default RequisitionItem;