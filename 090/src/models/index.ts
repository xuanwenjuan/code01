import sequelize from '../config/database';
import Admin from './Admin';
import Store from './Store';
import EquipmentCategory from './EquipmentCategory';
import Equipment from './Equipment';
import RentalOrder from './RentalOrder';
import MaintenanceRecord from './MaintenanceRecord';

Store.belongsTo(Admin, { foreignKey: 'managerId', as: 'manager' });
Admin.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

EquipmentCategory.belongsTo(EquipmentCategory, { foreignKey: 'parentId', as: 'parent' });
EquipmentCategory.hasMany(EquipmentCategory, { foreignKey: 'parentId', as: 'children' });

Equipment.belongsTo(EquipmentCategory, { foreignKey: 'categoryId', as: 'category' });
Equipment.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
Equipment.hasMany(RentalOrder, { foreignKey: 'equipmentId', as: 'rentalOrders' });
Equipment.hasMany(MaintenanceRecord, { foreignKey: 'equipmentId', as: 'maintenanceRecords' });

RentalOrder.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
RentalOrder.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
RentalOrder.belongsTo(Admin, { foreignKey: 'createdBy', as: 'creator' });
RentalOrder.belongsTo(Admin, { foreignKey: 'outboundBy', as: 'outboundOperator' });
RentalOrder.belongsTo(Admin, { foreignKey: 'returnBy', as: 'returnOperator' });

MaintenanceRecord.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
MaintenanceRecord.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
MaintenanceRecord.belongsTo(Admin, { foreignKey: 'createdBy', as: 'creator' });
MaintenanceRecord.belongsTo(Admin, { foreignKey: 'handledBy', as: 'handler' });

export {
  sequelize,
  Admin,
  Store,
  EquipmentCategory,
  Equipment,
  RentalOrder,
  MaintenanceRecord
};
