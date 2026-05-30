import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { User, Store, MaterialCategory, Material, Supplier } from '../models';
import { UserRole, CooperationStatus } from '../types';

const initData = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    await sequelize.sync({ alter: true });
    console.log('数据库表同步完成');

    const stores = await Store.bulkCreate([
      { storeCode: 'ST001', storeName: '总部旗舰店', address: '北京市朝阳区', contactPhone: '010-12345678', manager: '张店长', isActive: true },
      { storeCode: 'ST002', storeName: '海淀分店', address: '北京市海淀区', contactPhone: '010-87654321', manager: '李店长', isActive: true },
      { storeCode: 'ST003', storeName: '朝阳分店', address: '北京市朝阳区', contactPhone: '010-11112222', manager: '王店长', isActive: true }
    ]);
    console.log('门店数据初始化完成');

    const hashedPassword = await bcrypt.hash('123456', 10);
    await User.bulkCreate([
      { username: 'admin', password: hashedPassword, realName: '系统管理员', role: UserRole.HEADQUARTERS, phone: '13800000001', email: 'admin@example.com', isActive: true },
      { username: 'finance', password: hashedPassword, realName: '财务人员', role: UserRole.FINANCE, phone: '13800000002', email: 'finance@example.com', isActive: true },
      { username: 'store1', password: hashedPassword, realName: '总店店长', role: UserRole.STORE, storeId: stores[0].id, phone: '13800000003', email: 'store1@example.com', isActive: true },
      { username: 'store2', password: hashedPassword, realName: '海淀店长', role: UserRole.STORE, storeId: stores[1].id, phone: '13800000004', email: 'store2@example.com', isActive: true }
    ]);
    console.log('用户数据初始化完成，默认密码：123456');

    const categories = await MaterialCategory.bulkCreate([
      { categoryName: '奶类基底', categoryCode: 'CAT001', parentId: null, sort: 1, unit: '箱', description: '奶茶用奶类原料', isActive: true, storeAvailable: true },
      { categoryName: '果糖糖浆', categoryCode: 'CAT002', parentId: null, sort: 2, unit: '桶', description: '调味用糖浆', isActive: true, storeAvailable: true },
      { categoryName: '茶叶茶底', categoryCode: 'CAT003', parentId: null, sort: 3, unit: '包', description: '各类茶叶', isActive: true, storeAvailable: true },
      { categoryName: '包装耗材', categoryCode: 'CAT004', parentId: null, sort: 4, unit: '包', description: '杯子、吸管等', isActive: true, storeAvailable: true }
    ]);
    console.log('原料分类数据初始化完成');

    await Material.bulkCreate([
      { materialName: '鲜牛奶', materialCode: 'MAT001', categoryId: categories[0].id, unit: '箱', specification: 12, warningStock: 10, shelfLifeDays: 7, description: '全脂鲜牛奶', isActive: true },
      { materialName: '植脂末', materialCode: 'MAT002', categoryId: categories[0].id, unit: '袋', specification: 25, warningStock: 5, shelfLifeDays: 180, description: '奶精', isActive: true },
      { materialName: '原味果糖', materialCode: 'MAT003', categoryId: categories[1].id, unit: '桶', specification: 20, warningStock: 5, shelfLifeDays: 365, description: '调味糖浆', isActive: true },
      { materialName: '焦糖糖浆', materialCode: 'MAT004', categoryId: categories[1].id, unit: '桶', specification: 20, warningStock: 3, shelfLifeDays: 365, description: '焦糖风味', isActive: true },
      { materialName: '红茶', materialCode: 'MAT005', categoryId: categories[2].id, unit: '包', specification: 500, warningStock: 20, shelfLifeDays: 365, description: '红茶叶', isActive: true },
      { materialName: '绿茶', materialCode: 'MAT006', categoryId: categories[2].id, unit: '包', specification: 500, warningStock: 20, shelfLifeDays: 365, description: '绿茶叶', isActive: true },
      { materialName: '500ml杯子', materialCode: 'MAT007', categoryId: categories[3].id, unit: '箱', specification: 1000, warningStock: 50, shelfLifeDays: 730, description: '中杯', isActive: true },
      { materialName: '700ml杯子', materialCode: 'MAT008', categoryId: categories[3].id, unit: '箱', specification: 1000, warningStock: 50, shelfLifeDays: 730, description: '大杯', isActive: true },
      { materialName: '吸管', materialCode: 'MAT009', categoryId: categories[3].id, unit: '包', specification: 500, warningStock: 100, shelfLifeDays: 730, description: '独立包装吸管', isActive: true }
    ]);
    console.log('原料数据初始化完成');

    const suppliers = await Supplier.bulkCreate([
      { supplierName: '蒙牛乳业', supplierCode: 'SUP001', contactPerson: '张经理', contactPhone: '13900000001', address: '内蒙古呼和浩特', businessLicense: 'MNRU12345678', settlementPeriodDays: 30, deliveryTimeDays: 3, cooperationStatus: CooperationStatus.ACTIVE, creditLimit: 50000, supplyCategories: '奶类基底' },
      { supplierName: '雀巢食品', supplierCode: 'SUP002', contactPerson: '李经理', contactPhone: '13900000002', address: '北京市朝阳区', businessLicense: 'QSFP87654321', settlementPeriodDays: 45, deliveryTimeDays: 2, cooperationStatus: CooperationStatus.ACTIVE, creditLimit: 80000, supplyCategories: '奶类基底,果糖糖浆' },
      { supplierName: '福建茶厂', supplierCode: 'SUP003', contactPerson: '王经理', contactPhone: '13900000003', address: '福建省福州市', businessLicense: 'FJCC11223344', settlementPeriodDays: 30, deliveryTimeDays: 5, cooperationStatus: CooperationStatus.ACTIVE, creditLimit: 30000, supplyCategories: '茶叶茶底' },
      { supplierName: '包装制品公司', supplierCode: 'SUP004', contactPerson: '赵经理', contactPhone: '13900000004', address: '广东省深圳市', businessLicense: 'BZPC55667788', settlementPeriodDays: 60, deliveryTimeDays: 7, cooperationStatus: CooperationStatus.ACTIVE, creditLimit: 100000, supplyCategories: '包装耗材' }
    ]);
    console.log('供应商数据初始化完成');

    console.log('\n========== 初始化完成 ==========');
    console.log('管理员账号: admin / 123456');
    console.log('财务账号: finance / 123456');
    console.log('门店店长: store1 / 123456');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  }
};

initData();
