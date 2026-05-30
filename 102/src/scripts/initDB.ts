import bcrypt from 'bcryptjs';
import sequelize from '../database';
import User from '../models/User';
import MaterialCategory from '../models/MaterialCategory';
import Material from '../models/Material';
import { UserRole, MaterialCategoryType } from '../constants';
import logger from '../utils/logger';

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    await sequelize.sync({ alter: true });
    logger.info('数据库模型同步完成');

    const adminCount = await User.count({ where: { role: UserRole.SUPER_ADMIN } });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        realName: '系统管理员',
        phone: '13800138000',
        email: 'admin@winery.com',
        role: UserRole.SUPER_ADMIN,
        status: true,
      });
      logger.info('默认管理员账号创建成功: admin / admin123');
    }

    const winemakerCount = await User.count({ where: { role: UserRole.WINEMAKER } });
    if (winemakerCount === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        username: 'winemaker',
        password: hashedPassword,
        realName: '酿酒师',
        phone: '13800138001',
        email: 'winemaker@winery.com',
        role: UserRole.WINEMAKER,
        status: true,
      });
      logger.info('测试酿酒师账号创建成功: winemaker / 123456');
    }

    const cellarManagerCount = await User.count({ where: { role: UserRole.CELLAR_MANAGER } });
    if (cellarManagerCount === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        username: 'cellarManager',
        password: hashedPassword,
        realName: '窖藏管理员',
        phone: '13800138002',
        email: 'cellar@winery.com',
        role: UserRole.CELLAR_MANAGER,
        status: true,
      });
      logger.info('测试窖管账号创建成功: cellarManager / 123456');
    }

    const salesCount = await User.count({ where: { role: UserRole.SALES } });
    if (salesCount === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        username: 'sales',
        password: hashedPassword,
        realName: '销售员',
        phone: '13800138003',
        email: 'sales@winery.com',
        role: UserRole.SALES,
        status: true,
      });
      logger.info('测试销售账号创建成功: sales / 123456');
    }

    const categoryCount = await MaterialCategory.count();
    if (categoryCount === 0) {
      const categories = [
        { name: '葡萄品种', code: 'GRAPE', type: MaterialCategoryType.GRAPE, level: 1, sort: 1, status: true },
        { name: '发酵酵母', code: 'YEAST', type: MaterialCategoryType.YEAST, level: 1, sort: 2, status: true },
        { name: '调味辅料', code: 'ADDITIVE', type: MaterialCategoryType.ADDITIVE, level: 1, sort: 3, status: true },
        { name: '橡木桶', code: 'BARREL', type: MaterialCategoryType.BARREL, level: 1, sort: 4, status: true },
      ];

      const createdCategories = await MaterialCategory.bulkCreate(categories);
      logger.info(`创建了 ${createdCategories.length} 个原料分类`);

      const materials = [
        { categoryId: createdCategories[0].id, name: '赤霞珠', code: 'CS001', unit: 'kg', unitPrice: 80, stock: 5000, lockedStock: 0, availableStock: 5000, minStock: 100, status: true },
        { categoryId: createdCategories[0].id, name: '梅洛', code: 'ML001', unit: 'kg', unitPrice: 70, stock: 3000, lockedStock: 0, availableStock: 3000, minStock: 100, status: true },
        { categoryId: createdCategories[0].id, name: '黑皮诺', code: 'HPN001', unit: 'kg', unitPrice: 120, stock: 2000, lockedStock: 0, availableStock: 2000, minStock: 100, status: true },
        { categoryId: createdCategories[1].id, name: '酵母RC212', code: 'YEAST_RC212', unit: 'g', unitPrice: 5, stock: 10000, lockedStock: 0, availableStock: 10000, minStock: 500, status: true },
        { categoryId: createdCategories[1].id, name: '酵母D254', code: 'YEAST_D254', unit: 'g', unitPrice: 6, stock: 8000, lockedStock: 0, availableStock: 8000, minStock: 500, status: true },
        { categoryId: createdCategories[2].id, name: '单宁', code: 'TANNIN001', unit: 'g', unitPrice: 2, stock: 5000, lockedStock: 0, availableStock: 5000, minStock: 200, status: true },
        { categoryId: createdCategories[3].id, name: '法国橡木桶', code: 'BARREL_FR', unit: '个', unitPrice: 8000, stock: 200, lockedStock: 0, availableStock: 200, minStock: 10, status: true },
        { categoryId: createdCategories[3].id, name: '美国橡木桶', code: 'BARREL_US', unit: '个', unitPrice: 5000, stock: 150, lockedStock: 0, availableStock: 150, minStock: 10, status: true },
      ];

      await Material.bulkCreate(materials);
      logger.info(`创建了 ${materials.length} 个原料`);
    }

    logger.info('数据库初始化完成');
    process.exit(0);
  } catch (error) {
    logger.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();
