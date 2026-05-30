import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import PurchaseOrder from './PurchaseOrder';
import Product from './Product';

class PurchaseItem extends Model {
  public id!: number;
  public purchaseOrderId!: number;
  public productId!: number;
  public quantity!: number;
  public price!: number;
  public receivedQuantity!: number;
  public acceptedQuantity!: number;
  public returnedQuantity!: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PurchaseItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '采购单ID'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '采购数量'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '采购单价'
    },
    receivedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '已到货数量'
    },
    acceptedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '验收合格数量'
    },
    returnedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '退货数量'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'PurchaseItem',
    tableName: 'purchase_items'
  }
);

PurchaseItem.belongsTo(PurchaseOrder, { as: 'order', foreignKey: 'purchaseOrderId' });
PurchaseItem.belongsTo(Product, { as: 'product', foreignKey: 'productId' });
PurchaseOrder.hasMany(PurchaseItem, { as: 'items', foreignKey: 'purchaseOrderId' });

export default PurchaseItem;