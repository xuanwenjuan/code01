import sequelize from '../config/database';
import User from './User.model';
import Category from './Category.model';
import Pigeon from './Pigeon.model';
import WorkOrder from './WorkOrder.model';
import Expense from './Expense.model';
import OperationLog from './OperationLog.model';
import BreedingRecord from './BreedingRecord.model';

User.hasMany(OperationLog, { foreignKey: 'userId', as: 'operationLogs' });
OperationLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(Pigeon, { foreignKey: 'categoryId', as: 'pigeons' });
Pigeon.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Category.hasMany(Expense, { foreignKey: 'categoryId', as: 'expenses' });
Expense.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Pigeon.hasMany(BreedingRecord, { foreignKey: 'fatherId', as: 'fatherRecords' });
Pigeon.hasMany(BreedingRecord, { foreignKey: 'motherId', as: 'motherRecords' });
BreedingRecord.belongsTo(Pigeon, { foreignKey: 'fatherId', as: 'father' });
BreedingRecord.belongsTo(Pigeon, { foreignKey: 'motherId', as: 'mother' });

WorkOrder.hasMany(Expense, { foreignKey: 'workOrderId', as: 'expenses' });
Expense.belongsTo(WorkOrder, { foreignKey: 'workOrderId', as: 'workOrder' });

User.hasMany(WorkOrder, { foreignKey: 'createdById', as: 'createdWorkOrders' });
WorkOrder.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

User.hasMany(WorkOrder, { foreignKey: 'confirmedById', as: 'confirmedWorkOrders' });
WorkOrder.belongsTo(User, { foreignKey: 'confirmedById', as: 'confirmedBy' });

User.hasMany(Expense, { foreignKey: 'operatorId', as: 'operatedExpenses' });
Expense.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

User.hasMany(Pigeon, { foreignKey: 'createdBy', as: 'createdPigeons' });
Pigeon.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(BreedingRecord, { foreignKey: 'operatorId', as: 'operatedBreedingRecords' });
BreedingRecord.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

export {
  sequelize,
  User,
  Category,
  Pigeon,
  WorkOrder,
  Expense,
  OperationLog,
  BreedingRecord
};
