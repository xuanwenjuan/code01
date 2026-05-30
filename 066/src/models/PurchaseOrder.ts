import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { PurchaseOrderStatus } from '../types';
import Supplier from './Supplier';
import User from './User';

class PurchaseOrder extends Model {
  public id!: number;
  public orderNo!: string;
  public supplierId!: number;
  public totalAmount!: number;
  public status!: PurchaseOrderStatus;
  public expectDate?: Date;
  public actualDate?: Date;
  public operatorId!: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PurchaseOrder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '采购单号'
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '供货商ID'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总金额'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PurchaseOrderStatus)),
      allowNull: false,
      defaultValue: PurchaseOrderStatus.PENDING,
      comment: '单据状态'
    },
    expectDate: {
      type: DataTypes.DATE,
      comment: '预计到货日期'
    },
    actualDate: {
      type: DataTypes.DATE,
      comment: '实际到货日期'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '操作员ID'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'PurchaseOrder',
    tableName: 'purchase_orders'
  }
);

PurchaseOrder.belongsTo(Supplier, { as: 'supplier', foreignKey: 'supplierId' });
PurchaseOrder.belongsTo(User, { as: 'operator', foreignKey: 'operatorId' });

export default PurchaseOrder;