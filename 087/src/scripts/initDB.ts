import sequelize from '../config/database';
import { User } from '../models';
import { UserRole } from '../types';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    await sequelize.sync({ alter: true });
    logger.info('数据库表同步完成');

    const adminCount = await User.count({ where: { role: UserRole.ADMIN } });
    
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        username: 'admin',
        password: hashedPassword,
        realName: '系统管理员',
        phone: '13800138000',
        email: 'admin@meteor.com',
        role: UserRole.ADMIN,
        isActive: true
      });
      
      logger.info('默认管理员账号创建成功');
      logger.info('账号: admin, 密码: admin123');
    } else {
      logger.info('管理员账号已存在，跳过创建');
    }

    logger.info('数据库初始化完成');
    process.exit(0);
  } catch (error) {
    logger.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();
