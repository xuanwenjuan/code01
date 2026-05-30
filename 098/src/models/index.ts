import sequelize from '../config/database';
import User from './User';
import Area from './Area';
import PlantCategory from './PlantCategory';
import Plant from './Plant';
import WorkOrder from './WorkOrder';
import WorkOrderLog from './WorkOrderLog';
import Material from './Material';
import MaterialUsage from './MaterialUsage';
import OperationLog from './OperationLog';

const setupAssociations = () => {
  Area.hasMany(Area, { foreignKey: 'parentId', as: 'children' });
  Area.belongsTo(Area, { foreignKey: 'parentId', as: 'parent' });

  Area.hasMany(User, { foreignKey: 'areaId', as: 'users' });
  User.belongsTo(Area, { foreignKey: 'areaId', as: 'area' });

  PlantCategory.hasMany(PlantCategory, { foreignKey: 'parentId', as: 'children' });
  PlantCategory.belongsTo(PlantCategory, { foreignKey: 'parentId', as: 'parent' });

  PlantCategory.hasMany(Plant, { foreignKey: 'categoryId', as: 'plants' });
  Plant.belongsTo(PlantCategory, { foreignKey: 'categoryId', as: 'category' });

  Area.hasMany(Plant, { foreignKey: 'areaId', as: 'areaPlants' });
  Plant.belongsTo(Area, { foreignKey: 'areaId', as: 'plantArea' });

  Area.hasMany(WorkOrder, { foreignKey: 'areaId', as: 'workOrders' });
  WorkOrder.belongsTo(Area, { foreignKey: 'areaId', as: 'workOrderArea' });

  Plant.hasMany(WorkOrder, { foreignKey: 'plantId', as: 'plantWorkOrders' });
  WorkOrder.belongsTo(Plant, { foreignKey: 'plantId', as: 'workOrderPlant' });

  User.hasMany(WorkOrder, { foreignKey: 'assignedTo', as: 'assignedWorkOrders' });
  WorkOrder.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

  User.hasMany(WorkOrder, { foreignKey: 'createdBy', as: 'createdWorkOrders' });
  WorkOrder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

  User.hasMany(WorkOrder, { foreignKey: 'verifiedBy', as: 'verifiedWorkOrders' });
  WorkOrder.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

  WorkOrder.hasMany(WorkOrderLog, { foreignKey: 'workOrderId', as: 'logs' });
  WorkOrderLog.belongsTo(WorkOrder, { foreignKey: 'workOrderId', as: 'workOrder' });

  WorkOrderLog.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

  Material.hasMany(MaterialUsage, { foreignKey: 'materialId', as: 'usages' });
  MaterialUsage.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });

  WorkOrder.hasMany(MaterialUsage, { foreignKey: 'workOrderId', as: 'materialUsages' });
  MaterialUsage.belongsTo(WorkOrder, { foreignKey: 'workOrderId', as: 'workOrder' });

  Area.hasMany(MaterialUsage, { foreignKey: 'areaId', as: 'areaMaterialUsages' });
  MaterialUsage.belongsTo(Area, { foreignKey: 'areaId', as: 'usageArea' });

  MaterialUsage.belongsTo(User, { foreignKey: 'usedBy', as: 'user' });
};

export {
  sequelize,
  User,
  Area,
  PlantCategory,
  Plant,
  WorkOrder,
  WorkOrderLog,
  Material,
  MaterialUsage,
  OperationLog,
  setupAssociations
};
