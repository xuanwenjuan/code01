import User from './User';
import Rider from './Rider';
import Order from './Order';
import OrderTrack from './OrderTrack';
import Category from './Category';
import Settlement from './Settlement';
import RiderAuditLog from './RiderAuditLog';
import OperationLog from './OperationLog';
import sequelize from '../config/database';
import logger from '../config/logger';

User.hasOne(Rider, { foreignKey: 'userId', as: 'rider' });
Rider.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Rider.hasMany(Order, { foreignKey: 'riderId', as: 'orders' });
Order.belongsTo(Rider, { foreignKey: 'riderId', as: 'rider' });

Category.hasMany(Order, { foreignKey: 'categoryId', as: 'orders' });
Order.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Order.hasMany(OrderTrack, { foreignKey: 'orderId', as: 'tracks' });
OrderTrack.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Rider.hasMany(Settlement, { foreignKey: 'riderId', as: 'settlements' });
Settlement.belongsTo(Rider, { foreignKey: 'riderId', as: 'rider' });

Rider.hasMany(RiderAuditLog, { foreignKey: 'riderId', as: 'auditLogs' });
RiderAuditLog.belongsTo(Rider, { foreignKey: 'riderId', as: 'rider' });
RiderAuditLog.belongsTo(User, { foreignKey: 'auditorId', as: 'auditor' });

User.hasMany(OperationLog, { foreignKey: 'operatorId', as: 'operationLogs' });
OperationLog.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('数据库同步完成');
    }
  } catch (error) {
    logger.error('数据库连接失败:', error);
    process.exit(1);
  }
};

export { User, Rider, Order, OrderTrack, Category, Settlement, RiderAuditLog, OperationLog, syncDatabase };
