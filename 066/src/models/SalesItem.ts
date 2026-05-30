import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import SalesOrder from './SalesOrder';
import Product from './Product';

class SalesItem extends Model {
  public id!: number;
  public salesOrderId!: number;
  public productId!: number;
  public quantity!: number;
  public price!: number;
  public shippedQuantity!: number;
  public returnedQuantity!: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SalesItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    salesOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '销售单ID'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '销售数量'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '销售单价'
    },
    shippedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '已发货数量'
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
    modelName: 'SalesItem',
    tableName: 'sales_items'
  }
);

SalesItem.belongsTo(SalesOrder, { as: 'order', foreignKey: 'salesOrderId' });
SalesItem.belongsTo(Product, { as: 'product', foreignKey: 'productId' });
SalesOrder.hasMany(SalesItem, { as: 'items', foreignKey: 'salesOrderId' });

export default SalesItem;