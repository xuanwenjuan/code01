import sequelize from '../config/database';
import { User, Category, Influencer } from '../models';
import { UserRole, CategoryStatus, InfluencerStatus } from '../utils/constants';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    await sequelize.sync({ force: true });
    logger.info('数据库表创建完成');

    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      nickname: '管理员',
      role: UserRole.ADMIN,
      status: 'active',
    });
    logger.info('管理员账户创建成功');

    const categories = await Category.bulkCreate([
      { name: '美妆护肤', level: 1, sortOrder: 1, status: CategoryStatus.ACTIVE, description: '美妆、护肤、化妆品相关' },
      { name: '美食探店', level: 1, sortOrder: 2, status: CategoryStatus.ACTIVE, description: '美食、餐厅、探店' },
      { name: '母婴亲子', level: 1, sortOrder: 3, status: CategoryStatus.ACTIVE, description: '母婴、亲子、育儿' },
      { name: '数码测评', level: 1, sortOrder: 4, status: CategoryStatus.ACTIVE, description: '数码、科技、产品测评' },
      { name: '时尚穿搭', level: 1, sortOrder: 5, status: CategoryStatus.ACTIVE, description: '时尚、穿搭、服装' },
    ]);
    logger.info('分类创建完成');

    const merchant = await User.create({
      username: 'merchant1',
      password: '123456',
      email: 'merchant@example.com',
      nickname: '测试商家',
      role: UserRole.MERCHANT,
      status: 'active',
    });
    logger.info('商家账户创建成功');

    const influencerUser = await User.create({
      username: 'influencer1',
      password: '123456',
      email: 'influencer@example.com',
      nickname: '测试达人',
      role: UserRole.INFLUENCER,
      status: 'active',
    });

    await Influencer.create({
      userId: influencerUser.id,
      realName: '张三',
      followerCount: 10000,
      minPrice: 500,
      maxPrice: 5000,
      categoryIds: [categories[0].id, categories[1].id],
      tags: ['美妆', '护肤', '时尚'],
      bio: '专注美妆护肤分享，10万粉丝博主',
      status: InfluencerStatus.APPROVED,
      verifiedAt: new Date(),
    });
    logger.info('达人账户创建成功');

    logger.info('数据库初始化完成！');
    logger.info('管理员账号: admin / admin123');
    logger.info('商家账号: merchant1 / 123456');
    logger.info('达人账号: influencer1 / 123456');

    process.exit(0);
  } catch (error) {
    logger.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();
