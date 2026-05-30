import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Order from './order.model';
import Equipment from './equipment.model';

interface OrderItemAttributes {
  id: number;
  orderId: number;
  equipmentId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  returnedQuantity: number;
  damagedQuantity: number;
  damageAmount: number;
  damageLevel?: string;
  damageDescription?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt' | 'returnedQuantity' | 'damagedQuantity' | 'damageAmount' | 'remarks'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public orderId!: number;
  public equipmentId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public subtotal!: number;
  public returnedQuantity!: number;
  public damagedQuantity!: number;
  public damageAmount!: number;
  public damageLevel?: string;
  public damageDescription?: string;
  public remarks?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly order?: Order;
  public readonly equipment?: Equipment;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '订单ID',
    },
    equipmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '设备ID',
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '租赁数量',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价',
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '小计',
    },
    returnedQuantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '已归还数量',
    },
    damagedQuantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '损坏数量',
    },
    damageAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '损坏赔偿金额',
    },
    damageLevel: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '损坏等级: minor/moderate/severe/total',
    },
    damageDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '损坏描述',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    comment: '订单明细表',
  }
);

OrderItem.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
OrderItem.belongsTo(Equipment, { as: 'equipment', foreignKey: 'equipmentId' });
Equipment.hasMany(OrderItem, { as: 'orderItems', foreignKey: 'equipmentId' });

export default OrderItem;