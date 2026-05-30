import sequelize from '../config/database';
import User from './User.model';
import Category from './Category.model';
import Leader from './Leader.model';
import Product from './Product.model';
import GroupBuy from './GroupBuy.model';
import Order from './Order.model';
import Commission from './Commission.model';
import OperationLog from './OperationLog.model';

User.hasOne(Leader, { foreignKey: 'userId', as: 'leader' });
Leader.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Leader.hasMany(GroupBuy, { foreignKey: 'leaderId', as: 'groupBuys' });
GroupBuy.belongsTo(Leader, { foreignKey: 'leaderId', as: 'leader' });

Product.hasMany(GroupBuy, { foreignKey: 'productId', as: 'groupBuys' });
GroupBuy.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Leader.hasMany(Order, { foreignKey: 'leaderId', as: 'orders' });
Order.belongsTo(Leader, { foreignKey: 'leaderId', as: 'leader' });

GroupBuy.hasMany(Order, { foreignKey: 'groupBuyId', as: 'orders' });
Order.belongsTo(GroupBuy, { foreignKey: 'groupBuyId', as: 'groupBuy' });

Product.hasMany(Order, { foreignKey: 'productId', as: 'orders' });
Order.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Order.hasOne(Commission, { foreignKey: 'orderId', as: 'commission' });
Commission.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Leader.hasMany(Commission, { foreignKey: 'leaderId', as: 'commissions' });
Commission.belongsTo(Leader, { foreignKey: 'leaderId', as: 'leader' });

export {
  sequelize,
  User,
  Category,
  Leader,
  Product,
  GroupBuy,
  Order,
  Commission,
  OperationLog
};
