import Role from './Role';
import Department from './Department';
import User from './User';
import ActivityCategory from './ActivityCategory';
import Merchant from './Merchant';
import MerchantSchedule from './MerchantSchedule';
import PricePackage from './PricePackage';
import Activity from './Activity';
import Registration from './Registration';
import OperationLog from './OperationLog';

Department.hasMany(Department, { foreignKey: 'parentId', as: 'children' });
Department.belongsTo(Department, { foreignKey: 'parentId', as: 'parent' });
Department.hasMany(User, { foreignKey: 'departmentId' });
User.belongsTo(Department, { foreignKey: 'departmentId' });

Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

ActivityCategory.hasMany(ActivityCategory, { foreignKey: 'parentId', as: 'children' });
ActivityCategory.belongsTo(ActivityCategory, { foreignKey: 'parentId', as: 'parent' });
ActivityCategory.hasMany(Activity, { foreignKey: 'categoryId' });
Activity.belongsTo(ActivityCategory, { foreignKey: 'categoryId' });

Merchant.hasMany(PricePackage, { foreignKey: 'merchantId' });
PricePackage.belongsTo(Merchant, { foreignKey: 'merchantId' });

Merchant.hasMany(MerchantSchedule, { foreignKey: 'merchantId' });
MerchantSchedule.belongsTo(Merchant, { foreignKey: 'merchantId' });
MerchantSchedule.belongsTo(Activity, { foreignKey: 'eventId' });
MerchantSchedule.belongsTo(PricePackage, { foreignKey: 'pricePackageId' });

Merchant.hasMany(Activity, { foreignKey: 'merchantId' });
Activity.belongsTo(Merchant, { foreignKey: 'merchantId' });
Activity.belongsTo(PricePackage, { foreignKey: 'pricePackageId' });
Activity.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
Activity.hasMany(Registration, { foreignKey: 'activityId' });

User.hasMany(Registration, { foreignKey: 'userId' });
Registration.belongsTo(User, { foreignKey: 'userId' });
Registration.belongsTo(Activity, { foreignKey: 'activityId' });
Registration.belongsTo(User, { foreignKey: 'approverId', as: 'approver' });

export {
  Role,
  Department,
  User,
  ActivityCategory,
  Merchant,
  MerchantSchedule,
  PricePackage,
  Activity,
  Registration,
  OperationLog
};
