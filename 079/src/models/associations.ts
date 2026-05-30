import User from './User'
import Dealer from './Dealer'
import Category from './Category'
import Supplier from './Supplier'
import Brand from './Brand'
import Product from './Product'
import Order from './Order'
import OrderItem from './OrderItem'
import Settlement from './Settlement'
import OperationLog from './OperationLog'
import StockLock from './StockLock'

export const setupAssociations = (): void => {
  User.hasOne(Dealer, { foreignKey: 'userId', as: 'dealer' })
  Dealer.belongsTo(User, { foreignKey: 'userId', as: 'user' })

  Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' })
  Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' })

  Supplier.hasMany(Brand, { foreignKey: 'supplierId', as: 'brands' })
  Brand.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' })

  Supplier.hasMany(Product, { foreignKey: 'supplierId', as: 'products' })
  Product.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' })

  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' })
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' })

  Brand.hasMany(Product, { foreignKey: 'brandId', as: 'products' })
  Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' })

  Dealer.hasMany(Order, { foreignKey: 'dealerId', as: 'orders' })
  Order.belongsTo(Dealer, { foreignKey: 'dealerId', as: 'dealer' })

  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' })
  OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' })

  Dealer.hasMany(Settlement, { foreignKey: 'dealerId', as: 'settlements' })
  Settlement.belongsTo(Dealer, { foreignKey: 'dealerId', as: 'dealer' })

  Product.hasMany(StockLock, { foreignKey: 'productId', as: 'stockLocks' })
  StockLock.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

  Order.hasMany(StockLock, { foreignKey: 'orderId', as: 'stockLocks' })
  StockLock.belongsTo(Order, { foreignKey: 'orderId', as: 'order' })
}

export {
  User,
  Dealer,
  Category,
  Supplier,
  Brand,
  Product,
  Order,
  OrderItem,
  Settlement,
  OperationLog,
  StockLock
}
