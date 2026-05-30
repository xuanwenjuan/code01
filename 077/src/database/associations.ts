import Category from './models/Category.model';
import Equipment from './models/Equipment.model';
import Customer from './models/Customer.model';
import RentalOrder from './models/RentalOrder.model';
import OrderLog from './models/OrderLog.model';
import PaymentRecord from './models/PaymentRecord.model';
import User from './models/User.model';

export const setupAssociations = () => {
  Category.hasMany(Equipment, { foreignKey: 'categoryId', as: 'equipments' });
  Equipment.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

  Customer.hasMany(RentalOrder, { foreignKey: 'customerId', as: 'orders' });
  RentalOrder.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

  Equipment.hasMany(RentalOrder, { foreignKey: 'equipmentId', as: 'orders' });
  RentalOrder.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });

  RentalOrder.hasMany(OrderLog, { foreignKey: 'orderId', as: 'logs' });
  OrderLog.belongsTo(RentalOrder, { foreignKey: 'orderId', as: 'order' });

  RentalOrder.hasMany(PaymentRecord, { foreignKey: 'orderId', as: 'payments' });
  PaymentRecord.belongsTo(RentalOrder, { foreignKey: 'orderId', as: 'order' });

  Customer.hasMany(PaymentRecord, { foreignKey: 'customerId', as: 'payments' });
  PaymentRecord.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

  User.hasMany(OrderLog, { foreignKey: 'operatorId', as: 'orderLogs' });
  OrderLog.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

  User.hasMany(PaymentRecord, { foreignKey: 'operatorId', as: 'paymentRecords' });
  PaymentRecord.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });
};
