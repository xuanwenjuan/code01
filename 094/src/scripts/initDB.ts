import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { User, MaterialCategory } from '../models';
import { ROLES } from '../config';
import logger from '../utils/logger';

const initDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    await sequelize.sync({ force: true });
    logger.info('数据库表创建完成');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.bulkCreate([
      {
        username: 'admin',
        password: hashedPassword,
        realName: '系统管理员',
        phone: '13800138000',
        email: 'admin@example.com',
        role: ROLES.ADMIN,
        status: 1,
      },
      {
        username: 'material_admin',
        password: hashedPassword,
        realName: '物料管理员',
        phone: '13800138001',
        email: 'material@example.com',
        role: ROLES.MATERIAL_ADMIN,
        status: 1,
      },
      {
        username: 'operation',
        password: hashedPassword,
        realName: '运营人员',
        phone: '13800138002',
        email: 'operation@example.com',
        role: ROLES.OPERATION,
        status: 1,
      },
      {
        username: 'finance',
        password: hashedPassword,
        realName: '财务人员',
        phone: '13800138003',
        email: 'finance@example.com',
        role: ROLES.FINANCE,
        status: 1,
      },
      {
        username: 'artisan',
        password: hashedPassword,
        realName: '匠人师傅',
        phone: '13800138004',
        email: 'artisan@example.com',
        role: ROLES.ARTISAN,
        status: 1,
      },
    ]);

    logger.info('默认用户创建完成');

    await MaterialCategory.bulkCreate([
      {
        name: '原木胎料',
        code: 'WOOD_BASE',
        parentId: null,
        level: 1,
        sortOrder: 1,
        isActive: true,
      },
      {
        name: '天然大漆',
        code: 'NATURAL_LACQUER',
        parentId: null,
        level: 1,
        sortOrder: 2,
        isActive: true,
      },
      {
        name: '矿物色粉',
        code: 'MINERAL_PIGMENT',
        parentId: null,
        level: 1,
        sortOrder: 3,
        isActive: true,
      },
      {
        name: '装饰镶嵌辅料',
        code: 'DECORATION',
        parentId: null,
        level: 1,
        sortOrder: 4,
        isActive: true,
      },
    ]);

    logger.info('默认物料类目创建完成');

    logger.info('数据库初始化完成！');
    logger.info('默认账号: admin / admin123');

    process.exit(0);
  } catch (error) {
    logger.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();
