import sequelize from '../config/database';
import User from './user.model';
import EquipmentCategory from './equipmentCategory.model';
import ObservationSite from './observationSite.model';
import InspectionWorkOrder from './inspectionWorkOrder.model';
import ConsumableRecord from './consumableRecord.model';
import ConsumableInventory from './consumableInventory.model';
import OperationLog from './operationLog.model';
import MaintenanceSchedule from './maintenanceSchedule.model';

ObservationSite.hasMany(InspectionWorkOrder, {
  as: 'workOrders',
  foreignKey: 'siteId'
});

InspectionWorkOrder.belongsTo(ObservationSite, {
  as: 'site',
  foreignKey: 'siteId'
});

EquipmentCategory.hasMany(InspectionWorkOrder, {
  as: 'workOrders',
  foreignKey: 'equipmentCategoryId'
});

InspectionWorkOrder.belongsTo(EquipmentCategory, {
  as: 'equipmentCategory',
  foreignKey: 'equipmentCategoryId'
});

User.hasMany(InspectionWorkOrder, {
  as: 'inspectionWorkOrders',
  foreignKey: 'inspectorId'
});

InspectionWorkOrder.belongsTo(User, {
  as: 'inspector',
  foreignKey: 'inspectorId'
});

User.hasMany(InspectionWorkOrder, {
  as: 'maintenanceWorkOrders',
  foreignKey: 'maintenancePersonId'
});

InspectionWorkOrder.belongsTo(User, {
  as: 'maintenancePerson',
  foreignKey: 'maintenancePersonId'
});

ObservationSite.hasMany(ConsumableRecord, {
  as: 'consumableRecords',
  foreignKey: 'siteId'
});

ConsumableRecord.belongsTo(ObservationSite, {
  as: 'site',
  foreignKey: 'siteId'
});

EquipmentCategory.hasMany(ConsumableRecord, {
  as: 'consumableRecords',
  foreignKey: 'equipmentCategoryId'
});

ConsumableRecord.belongsTo(EquipmentCategory, {
  as: 'equipmentCategory',
  foreignKey: 'equipmentCategoryId'
});

InspectionWorkOrder.hasMany(ConsumableRecord, {
  as: 'consumableRecords',
  foreignKey: 'workOrderId'
});

ConsumableRecord.belongsTo(InspectionWorkOrder, {
  as: 'workOrder',
  foreignKey: 'workOrderId'
});

EquipmentCategory.hasMany(ConsumableInventory, {
  as: 'consumableInventories',
  foreignKey: 'equipmentCategoryId'
});

ConsumableInventory.belongsTo(EquipmentCategory, {
  as: 'equipmentCategory',
  foreignKey: 'equipmentCategoryId'
});

User.hasMany(MaintenanceSchedule, {
  as: 'maintenanceSchedules',
  foreignKey: 'userId'
});

MaintenanceSchedule.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
});

MaintenanceSchedule.belongsTo(InspectionWorkOrder, {
  as: 'workOrder',
  foreignKey: 'workOrderId'
});

MaintenanceSchedule.belongsTo(ObservationSite, {
  as: 'site',
  foreignKey: 'siteId'
});

export {
  sequelize,
  User,
  EquipmentCategory,
  ObservationSite,
  InspectionWorkOrder,
  ConsumableRecord,
  ConsumableInventory,
  OperationLog,
  MaintenanceSchedule
};
