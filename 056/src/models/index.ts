import sequelize from '../config/database';
import User from './User';
import Department from './Department';
import EquipmentCategory from './EquipmentCategory';
import Equipment from './Equipment';
import InspectionPlan from './InspectionPlan';
import InspectionTask from './InspectionTask';
import WorkOrder from './WorkOrder';

Department.hasMany(User, { foreignKey: 'departmentId', as: 'users' });
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

Department.hasMany(Equipment, { foreignKey: 'departmentId', as: 'equipment' });
Equipment.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

EquipmentCategory.hasMany(Equipment, { foreignKey: 'categoryId', as: 'equipment' });
Equipment.belongsTo(EquipmentCategory, { foreignKey: 'categoryId', as: 'category' });

Equipment.hasMany(InspectionPlan, { foreignKey: 'equipmentId', as: 'inspectionPlans' });
InspectionPlan.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
InspectionPlan.belongsTo(User, { foreignKey: 'inspectorId', as: 'inspector' });
InspectionPlan.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Equipment.hasMany(InspectionTask, { foreignKey: 'equipmentId', as: 'inspectionTasks' });
InspectionTask.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
InspectionTask.belongsTo(InspectionPlan, { foreignKey: 'planId', as: 'plan' });
InspectionTask.belongsTo(User, { foreignKey: 'inspectorId', as: 'inspector' });
InspectionTask.belongsTo(User, { foreignKey: 'completedBy', as: 'completer' });

Equipment.hasMany(WorkOrder, { foreignKey: 'equipmentId', as: 'workOrders' });
WorkOrder.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
WorkOrder.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });
WorkOrder.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
WorkOrder.belongsTo(User, { foreignKey: 'acceptedBy', as: 'accepter' });
WorkOrder.belongsTo(User, { foreignKey: 'closedBy', as: 'closer' });

export {
  sequelize,
  User,
  Department,
  EquipmentCategory,
  Equipment,
  InspectionPlan,
  InspectionTask,
  WorkOrder,
};
