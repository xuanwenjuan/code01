import sequelize from '../config/database';
import User from '../models/User';
import Category from '../models/Category';
import { UserRole } from '../types';
import bcrypt from 'bcryptjs';

const initDatabase = async () => {
  try {
    console.log('开始同步数据库...');

    await sequelize.sync({ force: true });

    console.log('数据库同步完成，开始创建初始数据...');

    const hashedPassword = await bcrypt.hash('123456', 10);

    await User.bulkCreate([
      {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@drone.com',
        realName: '系统管理员',
        role: UserRole.ADMIN,
        isActive: true,
      },
      {
        username: 'design',
        password: hashedPassword,
        email: 'design@drone.com',
        realName: '设计师',
        role: UserRole.DESIGN,
        isActive: true,
      },
      {
        username: 'production',
        password: hashedPassword,
        email: 'production@drone.com',
        realName: '生产员',
        role: UserRole.PRODUCTION,
        isActive: true,
      },
      {
        username: 'warehouse',
        password: hashedPassword,
        email: 'warehouse@drone.com',
        realName: '仓管员',
        role: UserRole.WAREHOUSE,
        isActive: true,
      },
    ]);

    console.log('用户创建完成');

    const rootCategories = await Category.bulkCreate([
      { name: '机架机身', code: 'FRAME', level: 1, sortOrder: 1 },
      { name: '动力电机', code: 'MOTOR', level: 1, sortOrder: 2 },
      { name: '飞控电调', code: 'FC_ESC', level: 1, sortOrder: 3 },
      { name: '螺旋桨叶', code: 'PROPELLER', level: 1, sortOrder: 4 },
    ]);

    console.log('根类目创建完成');

    const frame = rootCategories[0];
    const motor = rootCategories[1];
    const fcEsc = rootCategories[2];
    const propeller = rootCategories[3];

    await Category.bulkCreate([
      { name: '四轴机架', code: 'FRAME_QUAD', parentId: frame.id, level: 2, sortOrder: 1 },
      { name: '六轴机架', code: 'FRAME_HEXA', parentId: frame.id, level: 2, sortOrder: 2 },
      { name: '八轴机架', code: 'FRAME_OCTO', parentId: frame.id, level: 2, sortOrder: 3 },
    ]);

    await Category.bulkCreate([
      { name: '2204电机', code: 'MOTOR_2204', parentId: motor.id, level: 2, sortOrder: 1 },
      { name: '2207电机', code: 'MOTOR_2207', parentId: motor.id, level: 2, sortOrder: 2 },
      { name: '2306电机', code: 'MOTOR_2306', parentId: motor.id, level: 2, sortOrder: 3 },
    ]);

    await Category.bulkCreate([
      { name: 'F4飞控', code: 'FC_F4', parentId: fcEsc.id, level: 2, sortOrder: 1 },
      { name: 'F7飞控', code: 'FC_F7', parentId: fcEsc.id, level: 2, sortOrder: 2 },
      { name: '30A电调', code: 'ESC_30A', parentId: fcEsc.id, level: 2, sortOrder: 3 },
      { name: '45A电调', code: 'ESC_45A', parentId: fcEsc.id, level: 2, sortOrder: 4 },
    ]);

    await Category.bulkCreate([
      { name: '5寸桨', code: 'PROP_5IN', parentId: propeller.id, level: 2, sortOrder: 1 },
      { name: '6寸桨', code: 'PROP_6IN', parentId: propeller.id, level: 2, sortOrder: 2 },
      { name: '7寸桨', code: 'PROP_7IN', parentId: propeller.id, level: 2, sortOrder: 3 },
    ]);

    console.log('子类目创建完成');
    console.log('数据库初始化完成！');
    console.log('默认账号密码: admin / 123456');

    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();
