import sequelize from '../config/database';
import User from './User';
import Store from './Store';
import Category from './Category';
import Product from './Product';
import Ingredient from './Ingredient';
import Recipe from './Recipe';
import RecipeItem from './RecipeItem';
import Order from './Order';
import OrderStatusLog from './OrderStatusLog';
import Supplier from './Supplier';
import StockLoss from './StockLoss';
import SalesReport from './SalesReport';
import OperationLog from './OperationLog';

const setupAssociations = () => {
  Store.hasMany(User, { foreignKey: 'storeId', as: 'employees' });
  User.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

  Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
  Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });
  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

  Store.hasMany(Product, { foreignKey: 'storeId', as: 'storeProducts' });
  Product.belongsTo(Store, { foreignKey: 'storeId', as: 'productStore' });

  Product.hasMany(Recipe, { foreignKey: 'productId', as: 'recipes' });
  Recipe.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  Recipe.hasMany(RecipeItem, { foreignKey: 'recipeId', as: 'items' });
  RecipeItem.belongsTo(Recipe, { foreignKey: 'recipeId', as: 'recipe' });
  RecipeItem.belongsTo(Ingredient, { foreignKey: 'ingredientId', as: 'ingredient' });

  Store.hasMany(Ingredient, { foreignKey: 'storeId', as: 'storeIngredients' });
  Ingredient.belongsTo(Store, { foreignKey: 'storeId', as: 'ingredientStore' });
  Supplier.hasMany(Ingredient, { foreignKey: 'supplierId', as: 'ingredients' });
  Ingredient.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

  Store.hasMany(Order, { foreignKey: 'storeId', as: 'storeOrders' });
  Order.belongsTo(Store, { foreignKey: 'storeId', as: 'orderStore' });
  User.hasMany(Order, { foreignKey: 'userId', as: 'userOrders' });
  Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Order.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  Order.hasMany(OrderStatusLog, { foreignKey: 'orderId', as: 'statusLogs' });
  OrderStatusLog.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

  Store.hasMany(StockLoss, { foreignKey: 'storeId', as: 'storeLosses' });
  StockLoss.belongsTo(Store, { foreignKey: 'storeId', as: 'lossStore' });
  StockLoss.belongsTo(Ingredient, { foreignKey: 'ingredientId', as: 'ingredient' });

  Store.hasMany(SalesReport, { foreignKey: 'storeId', as: 'storeReports' });
  SalesReport.belongsTo(Store, { foreignKey: 'storeId', as: 'reportStore' });

  Store.hasMany(Supplier, { foreignKey: 'storeId', as: 'storeSuppliers' });
  Supplier.belongsTo(Store, { foreignKey: 'storeId', as: 'supplierStore' });
};

setupAssociations();

export {
  sequelize,
  User,
  Store,
  Category,
  Product,
  Ingredient,
  Recipe,
  RecipeItem,
  Order,
  OrderStatusLog,
  Supplier,
  StockLoss,
  SalesReport,
  OperationLog
};
