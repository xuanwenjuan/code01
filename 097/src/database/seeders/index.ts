import 'dotenv/config';
import User from '../../models/User';
import { hashPassword } from '../../utils/jwt';
import { UserRole } from '../../types/common';
import sequelize from '../config';
import Category from '../../models/Category';

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('数据库同步完成');

    const adminPassword = await hashPassword('admin123');
    await User.create({
      username: 'admin',
      password: adminPassword,
      realName: '管理员',
      role: UserRole.ADMIN,
      phone: '13800138000',
      isActive: true
    });

    const purchaserPassword = await hashPassword('purchaser123');
    await User.create({
      username: 'purchaser',
      password: purchaserPassword,
      realName: '采购员',
      role: UserRole.PURCHASER,
      phone: '13800138001',
      isActive: true
    });

    const keeperPassword = await hashPassword('keeper123');
    await User.create({
      username: 'keeper',
      password: keeperPassword,
      realName: '仓管员',
      role: UserRole.WAREHOUSE_KEEPER,
      phone: '13800138002',
      isActive: true
    });

    const salesmanPassword = await hashPassword('salesman123');
    await User.create({
      username: 'salesman',
      password: salesmanPassword,
      realName: '销售员',
      role: UserRole.SALESMAN,
      phone: '13800138003',
      isActive: true
    });

    console.log('用户数据初始化完成');

    const categories = [
      { name: '鱼竿竿体', description: '各类路亚竿、海竿、手竿等', parentId: 0, sort: 1 },
      { name: '渔轮线组', description: '纺车轮、水滴轮、鱼线等', parentId: 0, sort: 2 },
      { name: '假饵配件', description: '假饵、鱼钩、铅坠等', parentId: 0, sort: 3 },
      { name: '垂钓服饰', description: '钓鱼服、防晒帽、手套等', parentId: 0, sort: 4 },
    ];

    for (const cat of categories) {
      await Category.create(cat);
    }

    console.log('分类数据初始化完成');
    console.log('数据库种子数据执行完成');
    process.exit(0);
  } catch (error) {
    console.error('数据库种子数据执行失败:', error);
    process.exit(1);
  }
};

seedDatabase();
