import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import Role from '../models/Role';
import Department from '../models/Department';
import User from '../models/User';
import ActivityCategory from '../models/ActivityCategory';
import { UserRole } from '../types';
import logger from '../config/logger';

export const initData = async () => {
  const transaction = await sequelize.transaction();

  try {
    logger.info('开始初始化数据...');

    const roles = await Role.bulkCreate([
      { name: '超级管理员', code: 'SUPER_ADMIN', description: '系统最高权限' },
      { name: '管理员', code: 'ADMIN', description: '后台管理权限' },
      { name: '部门经理', code: 'DEPARTMENT_MANAGER', description: '部门管理权限' },
      { name: '普通员工', code: 'EMPLOYEE', description: '普通员工权限' }
    ], { transaction });

    logger.info(`创建了 ${roles.length} 个角色`);

    const dept1 = await Department.create({
      name: '总公司',
      parentId: null,
      sortOrder: 1
    }, { transaction });

    const dept2 = await Department.create({
      name: '技术部',
      parentId: dept1.id,
      sortOrder: 1
    }, { transaction });

    const dept3 = await Department.create({
      name: '人力资源部',
      parentId: dept1.id,
      sortOrder: 2
    }, { transaction });

    const dept4 = await Department.create({
      name: '市场部',
      parentId: dept1.id,
      sortOrder: 3
    }, { transaction });

    logger.info('创建了 4 个部门');

    const hashedPassword = await bcrypt.hash('123456', 10);

    await User.bulkCreate([
      {
        username: 'admin',
        password: hashedPassword,
        realName: '超级管理员',
        email: 'admin@company.com',
        phone: '13800138000',
        roleId: 1,
        departmentId: dept1.id,
        status: 1
      },
      {
        username: 'manager',
        password: hashedPassword,
        realName: '部门经理',
        email: 'manager@company.com',
        phone: '13800138001',
        roleId: 3,
        departmentId: dept2.id,
        status: 1
      },
      {
        username: 'employee',
        password: hashedPassword,
        realName: '普通员工',
        email: 'employee@company.com',
        phone: '13800138002',
        roleId: 4,
        departmentId: dept2.id,
        status: 1
      }
    ], { transaction });

    logger.info('创建了 3 个测试用户');

    await ActivityCategory.bulkCreate([
      { name: '户外拓展', parentId: null, description: '户外团建活动', sortOrder: 1, status: 1 },
      { name: '文旅研学', parentId: null, description: '文化旅游研学活动', sortOrder: 2, status: 1 },
      { name: '聚餐年会', parentId: null, description: '聚餐和年会活动', sortOrder: 3, status: 1 },
      { name: '趣味赛事', parentId: null, description: '趣味运动赛事', sortOrder: 4, status: 1 },
      { name: '登山徒步', parentId: 1, description: '登山和徒步活动', sortOrder: 1, status: 1 },
      { name: '露营野炊', parentId: 1, description: '露营和野炊活动', sortOrder: 2, status: 1 },
      { name: '名胜古迹', parentId: 2, description: '参观名胜古迹', sortOrder: 1, status: 1 },
      { name: '红色教育', parentId: 2, description: '红色教育基地学习', sortOrder: 2, status: 1 }
    ], { transaction });

    logger.info('创建了 8 个活动类目');

    await transaction.commit();
    logger.info('数据初始化完成!');
    logger.info('默认账号: admin / 123456');

  } catch (error) {
    await transaction.rollback();
    logger.error('数据初始化失败:', error);
    throw error;
  }
};
