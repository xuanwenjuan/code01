import { sequelize } from '../database';
import User from './User';
import ForageCategory from './ForageCategory';
import Horse from './Horse';
import Stable from './Stable';
import ForageApplication from './ForageApplication';
import ApplicationItem from './ApplicationItem';
import ForageInventory from './ForageInventory';
import CostRecord from './CostRecord';
import OperationLog from './OperationLog';

Horse.belongsTo(Stable, { foreignKey: 'stableId', as: 'stable' });
Stable.hasMany(Horse, { foreignKey: 'stableId', as: 'horses' });

Horse.belongsTo(User, { foreignKey: 'trainerId', as: 'trainer' });
User.hasMany(Horse, { foreignKey: 'trainerId', as: 'trainedHorses' });

Stable.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
User.hasMany(Stable, { foreignKey: 'managerId', as: 'managedStables' });

ForageApplication.belongsTo(Stable, { foreignKey: 'stableId', as: 'stable' });
Stable.hasMany(ForageApplication, { foreignKey: 'stableId', as: 'applications' });

ForageApplication.belongsTo(User, { foreignKey: 'trainerId', as: 'trainer' });
User.hasMany(ForageApplication, { foreignKey: 'trainerId', as: 'trainerApplications' });

ForageApplication.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
User.hasMany(ForageApplication, { foreignKey: 'approvedBy', as: 'approvedApplications' });

ForageApplication.belongsTo(User, { foreignKey: 'deliveredBy', as: 'deliverer' });
User.hasMany(ForageApplication, { foreignKey: 'deliveredBy', as: 'deliveredApplications' });

ApplicationItem.belongsTo(ForageApplication, { foreignKey: 'applicationId', as: 'application' });
ForageApplication.hasMany(ApplicationItem, { foreignKey: 'applicationId', as: 'items' });

ApplicationItem.belongsTo(ForageCategory, { foreignKey: 'categoryId', as: 'category' });
ForageCategory.hasMany(ApplicationItem, { foreignKey: 'categoryId', as: 'applicationItems' });

ForageInventory.belongsTo(ForageCategory, { foreignKey: 'categoryId', as: 'category' });
ForageCategory.hasOne(ForageInventory, { foreignKey: 'categoryId', as: 'inventory' });

CostRecord.belongsTo(ForageCategory, { foreignKey: 'categoryId', as: 'category' });
ForageCategory.hasMany(CostRecord, { foreignKey: 'categoryId', as: 'costRecords' });

CostRecord.belongsTo(Stable, { foreignKey: 'stableId', as: 'stable' });
Stable.hasMany(CostRecord, { foreignKey: 'stableId', as: 'costRecords' });

export {
  sequelize,
  User,
  ForageCategory,
  Horse,
  Stable,
  ForageApplication,
  ApplicationItem,
  ForageInventory,
  CostRecord,
  OperationLog
};
