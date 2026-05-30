import bcrypt from 'bcryptjs';
import { sequelize } from '../database';
import User from '../models/User';
import { logger } from '../utils/logger';

const initData = async () => {
  try {
    await sequelize.sync({ alter: true });
    logger.info('数据库同步完成');

    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        realName: '系统管理员',
        phone: '13800138000',
        role: 'admin',
        status: 'active'
      });
      logger.info('默认管理员账户创建成功: admin / admin123');
    } else {
      logger.info('管理员账户已存在');
    }

    const trainerExists = await User.findOne({ where: { username: 'trainer' } });
    if (!trainerExists) {
      const hashedPassword = await bcrypt.hash('trainer123', 10);
      await User.create({
        username: 'trainer',
        password: hashedPassword,
        realName: '驯养员',
        phone: '13800138001',
        role: 'trainer',
        status: 'active'
      });
      logger.info('默认驯养员账户创建成功: trainer / trainer123');
    }

    const warehouseExists = await User.findOne({ where: { username: 'warehouse' } });
    if (!warehouseExists) {
      const hashedPassword = await bcrypt.hash('warehouse123', 10);
      await User.create({
        username: 'warehouse',
        password: hashedPassword,
        realName: '仓库管理员',
        phone: '13800138002',
        role: 'warehouse',
        status: 'active'
      });
      logger.info('默认仓管账户创建成功: warehouse / warehouse123');
    }

    const purchaserExists = await User.findOne({ where: { username: 'purchaser' } });
    if (!purchaserExists) {
      const hashedPassword = await bcrypt.hash('purchaser123', 10);
      await User.create({
        username: 'purchaser',
        password: hashedPassword,
        realName: '采购员',
        phone: '13800138003',
        role: 'purchaser',
        status: 'active'
      });
      logger.info('默认采购账户创建成功: purchaser / purchaser123');
    }

    logger.info('数据初始化完成');
    process.exit(0);
  } catch (error) {
    logger.error('数据初始化失败:', error);
    process.exit(1);
  }
};

initData();
