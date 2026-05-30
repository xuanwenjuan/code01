import sequelize from '../config/database';
import User from './User';
import RoomCategory from './RoomCategory';
import Room from './Room';
import Order from './Order';
import OrderStatusLog from './OrderStatusLog';
import RevenueReport from './RevenueReport';
import OperationLog from './OperationLog';

RoomCategory.hasMany(RoomCategory, { foreignKey: 'parentId', as: 'children' });
RoomCategory.belongsTo(RoomCategory, { foreignKey: 'parentId', as: 'parent' });

RoomCategory.hasMany(Room, { foreignKey: 'categoryId', as: 'rooms' });
Room.belongsTo(RoomCategory, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Room.hasMany(Order, { foreignKey: 'roomId', as: 'orders' });
Order.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

Order.hasMany(OrderStatusLog, { foreignKey: 'orderId', as: 'statusLogs' });
OrderStatusLog.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

export {
  sequelize,
  User,
  RoomCategory,
  Room,
  Order,
  OrderStatusLog,
  RevenueReport,
  OperationLog
};
