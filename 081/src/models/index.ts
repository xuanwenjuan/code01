import sequelize from '../config/database';

export { default as User } from './User';
export { default as Store } from './Store';
export { default as MaterialCategory } from './MaterialCategory';
export { default as Material } from './Material';
export { default as Supplier } from './Supplier';
export { default as SupplierStore } from './SupplierStore';
export { default as PurchaseOrder } from './PurchaseOrder';
export { default as PurchaseOrderItem } from './PurchaseOrderItem';
export { default as Inventory } from './Inventory';
export { default as InventoryLog } from './InventoryLog';
export { default as InventoryCheck } from './InventoryCheck';
export { default as InventoryCheckItem } from './InventoryCheckItem';
export { default as ConsumptionRecord } from './ConsumptionRecord';

export const initModels = async () => {
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  console.log('All models were synchronized successfully.');
};

export default sequelize;
