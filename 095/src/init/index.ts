import bcrypt from 'bcryptjs';
import User from '../models/User';
import Category from '../models/Category';
import Product from '../models/Product';
import Material from '../models/Material';
import { UserRole, CategoryStatus, MaterialStatus } from '../types';
import logger from '../config/logger';

export const initData = async () => {
  try {
    const adminCount = await User.count({ where: { role: UserRole.ADMIN } });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        realName: '系统管理员',
        phone: '13800138000',
        email: 'admin@polar.com',
        role: UserRole.ADMIN,
        isActive: true,
      });
      logger.info('默认管理员账号已创建: admin / admin123');
    }

    const serviceCount = await User.count({ where: { role: UserRole.CUSTOMER_SERVICE } });
    if (serviceCount === 0) {
      const hashedPassword = await bcrypt.hash('service123', 10);
      await User.create({
        username: 'service',
        password: hashedPassword,
        realName: '客服人员',
        phone: '13800138001',
        email: 'service@polar.com',
        role: UserRole.CUSTOMER_SERVICE,
        isActive: true,
      });
      logger.info('默认客服账号已创建: service / service123');
    }

    const warehouseCount = await User.count({ where: { role: UserRole.WAREHOUSE } });
    if (warehouseCount === 0) {
      const hashedPassword = await bcrypt.hash('warehouse123', 10);
      await User.create({
        username: 'warehouse',
        password: hashedPassword,
        realName: '仓储人员',
        phone: '13800138002',
        email: 'warehouse@polar.com',
        role: UserRole.WAREHOUSE,
        isActive: true,
      });
      logger.info('默认仓储账号已创建: warehouse / warehouse123');
    }

    const financeCount = await User.count({ where: { role: UserRole.FINANCE } });
    if (financeCount === 0) {
      const hashedPassword = await bcrypt.hash('finance123', 10);
      await User.create({
        username: 'finance',
        password: hashedPassword,
        realName: '财务人员',
        phone: '13800138003',
        email: 'finance@polar.com',
        role: UserRole.FINANCE,
        isActive: true,
      });
      logger.info('默认财务账号已创建: finance / finance123');
    }

    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      const jacketCategory = await Category.create({
        name: '冲锋衣裤',
        parentId: null,
        level: 1,
        sortOrder: 1,
        description: '极地防寒冲锋衣裤系列',
        status: CategoryStatus.ACTIVE,
      });

      await Category.create({
        name: '男款冲锋衣',
        parentId: jacketCategory.id,
        level: 2,
        sortOrder: 1,
        description: '男士专业极地防寒冲锋衣',
        status: CategoryStatus.ACTIVE,
      });

      await Category.create({
        name: '女款冲锋衣',
        parentId: jacketCategory.id,
        level: 2,
        sortOrder: 2,
        description: '女士专业极地防寒冲锋衣',
        status: CategoryStatus.ACTIVE,
      });

      const downCategory = await Category.create({
        name: '羽绒内胆',
        parentId: null,
        level: 1,
        sortOrder: 2,
        description: '高保暖羽绒内胆系列',
        status: CategoryStatus.ACTIVE,
      });

      await Category.create({
        name: '羽绒外套',
        parentId: downCategory.id,
        level: 2,
        sortOrder: 1,
        description: '高保暖羽绒外套',
        status: CategoryStatus.ACTIVE,
      });

      await Category.create({
        name: '羽绒背心',
        parentId: downCategory.id,
        level: 2,
        sortOrder: 2,
        description: '轻便羽绒保暖背心',
        status: CategoryStatus.ACTIVE,
      });

      await Category.create({
        name: '极地睡袋',
        parentId: null,
        level: 1,
        sortOrder: 3,
        description: '专业极地防寒睡袋系列',
        status: CategoryStatus.ACTIVE,
      });

      await Category.create({
        name: '防寒护具',
        parentId: null,
        level: 1,
        sortOrder: 4,
        description: '手套、帽子、围巾等防寒护具',
        status: CategoryStatus.ACTIVE,
      });

      logger.info('默认产品分类已创建');
    }

    const productCount = await Product.count();
    if (productCount === 0) {
      const categories = await Category.findAll({ where: { level: 2 } });

      if (categories.length > 0) {
        await Product.create({
          categoryId: categories[0].id,
          name: '极地专业防寒冲锋衣',
          code: 'POLAR-JKT-001',
          description: '采用GORE-TEX PRO面料，防风防水，-40℃专业级保暖',
          basePrice: 2999,
          customFee: 300,
          isActive: true,
          sortOrder: 1,
        });

        await Product.create({
          categoryId: categories[0].id,
          name: '探险级防寒冲锋裤',
          code: 'POLAR-PNT-001',
          description: '防风防水透气，膝盖处立体剪裁，活动自如',
          basePrice: 1599,
          customFee: 200,
          isActive: true,
          sortOrder: 2,
        });

        await Product.create({
          categoryId: categories[2].id,
          name: '800蓬松度羽绒服',
          code: 'POLAR-DWN-001',
          description: '800蓬松度白鹅绒填充，超轻超保暖',
          basePrice: 3599,
          customFee: 400,
          isActive: true,
          sortOrder: 1,
        });

        logger.info('默认产品已创建');
      }
    }

    const materialCount = await Material.count();
    if (materialCount === 0) {
      await Material.create({
        batchNo: 'FAB-2024-001',
        name: 'GORE-TEX PRO面料',
        type: 'fabric',
        specification: '50D',
        unit: '米',
        stockQuantity: 500,
        warningThreshold: 50,
        unitPrice: 280,
        supplier: '戈尔供应商',
        status: MaterialStatus.IN_STOCK,
        remarks: '顶级防风防水面料',
      });

      await Material.create({
        batchNo: 'FIL-2024-001',
        name: '800蓬松度白鹅绒',
        type: 'filling',
        specification: '95%绒子含量',
        unit: '千克',
        stockQuantity: 200,
        warningThreshold: 20,
        unitPrice: 800,
        supplier: '羽绒供应商',
        status: MaterialStatus.IN_STOCK,
        remarks: '高保暖填充材料',
      });

      await Material.create({
        batchNo: 'HRD-2024-001',
        name: 'YKK防水拉链',
        type: 'hardware',
        specification: '8号',
        unit: '条',
        stockQuantity: 1000,
        warningThreshold: 100,
        unitPrice: 25,
        supplier: 'YKK授权经销商',
        status: MaterialStatus.IN_STOCK,
        remarks: '高品质防水拉链',
      });

      await Material.create({
        batchNo: 'SZ-2024-001',
        name: '尺码标套装',
        type: 'size',
        specification: 'S/M/L/XL/XXL',
        unit: '套',
        stockQuantity: 2000,
        warningThreshold: 200,
        unitPrice: 5,
        supplier: '商标供应商',
        status: MaterialStatus.IN_STOCK,
      });

      logger.info('默认面料辅料已创建');
    }
  } catch (error) {
    logger.error('初始化数据失败:', error);
  }
};