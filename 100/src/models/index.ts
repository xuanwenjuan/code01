import sequelize from '../config/database';
import User from './User';
import MaterialCategory from './MaterialCategory';
import MaterialStock from './MaterialStock';
import MaterialLock from './MaterialLock';
import MaterialWaste from './MaterialWaste';
import WorkOrder from './WorkOrder';
import WorkOrderTrace from './WorkOrderTrace';
import WorkOrderMaterial from './WorkOrderMaterial';
import CostLedger from './CostLedger';
import OperationLog from './OperationLog';

MaterialCategory.hasMany(MaterialCategory, { foreignKey: 'parentId', as: 'children' });
MaterialCategory.belongsTo(MaterialCategory, { foreignKey: 'parentId', as: 'parent' });

MaterialCategory.hasMany(MaterialStock, { foreignKey: 'categoryId' });
MaterialStock.belongsTo(MaterialCategory, { foreignKey: 'categoryId' });

MaterialStock.hasMany(MaterialLock, { foreignKey: 'materialStockId' });
MaterialLock.belongsTo(MaterialStock, { foreignKey: 'materialStockId' });

MaterialStock.hasMany(MaterialWaste, { foreignKey: 'materialStockId' });
MaterialWaste.belongsTo(MaterialStock, { foreignKey: 'materialStockId' });

WorkOrder.hasMany(MaterialLock, { foreignKey: 'workOrderId' });
MaterialLock.belongsTo(WorkOrder, { foreignKey: 'workOrderId' });

WorkOrder.hasMany(MaterialWaste, { foreignKey: 'workOrderId' });
MaterialWaste.belongsTo(WorkOrder, { foreignKey: 'workOrderId' });

WorkOrder.hasMany(WorkOrderTrace, { foreignKey: 'workOrderId' });
WorkOrderTrace.belongsTo(WorkOrder, { foreignKey: 'workOrderId' });

WorkOrder.hasMany(WorkOrderMaterial, { foreignKey: 'workOrderId' });
WorkOrderMaterial.belongsTo(WorkOrder, { foreignKey: 'workOrderId' });
WorkOrderMaterial.belongsTo(MaterialStock, { foreignKey: 'materialStockId' });

WorkOrder.belongsTo(User, { foreignKey: 'typesetterId', as: 'typesetter' });
WorkOrder.belongsTo(User, { foreignKey: 'engraverId', as: 'engraver' });
WorkOrder.belongsTo(User, { foreignKey: 'printerId', as: 'printer' });
WorkOrder.belongsTo(User, { foreignKey: 'binderId', as: 'binder' });
WorkOrder.belongsTo(User, { foreignKey: 'currentHandlerId', as: 'currentHandler' });
WorkOrder.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

MaterialStock.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });
WorkOrderTrace.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });
WorkOrderMaterial.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });
CostLedger.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });
MaterialLock.belongsTo(User, { foreignKey: 'lockedById', as: 'lockedBy' });
MaterialWaste.belongsTo(User, { foreignKey: 'reportedById', as: 'reportedBy' });
MaterialWaste.belongsTo(User, { foreignKey: 'verifiedById', as: 'verifiedBy' });

export {
  sequelize,
  User,
  MaterialCategory,
  MaterialStock,
  MaterialLock,
  MaterialWaste,
  WorkOrder,
  WorkOrderTrace,
  WorkOrderMaterial,
  CostLedger,
  OperationLog
};
