import sequelize from '../config/database';
import User from './user.model';
import Category from './category.model';
import Equipment from './equipment.model';
import Order from './order.model';
import OrderItem from './order-item.model';
import MaintenanceRecord from './maintenance-record.model';
import OperationLog from './operation-log.model';

const db = {
  sequelize,
  User,
  Category,
  Equipment,
  Order,
  OrderItem,
  MaintenanceRecord,
  OperationLog,
};

export default db;