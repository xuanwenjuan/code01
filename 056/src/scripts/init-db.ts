import sequelize from '../config/database';
import { Department, EquipmentCategory, User } from '../models';
import PasswordUtil from '../utils/password';
import { UserRole } from '../types';

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    await sequelize.sync({ force: true });
    console.log('数据库表创建成功');

    const adminPassword = await PasswordUtil.hash('admin123');

    await User.create({
      username: 'admin',
      password: adminPassword,
      realName: '系统管理员',
      phone: '13800138000',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      isActive: true,
    });
    console.log('管理员账户创建成功: admin / admin123');

    const depts = await Department.bulkCreate([
      { name: '总部', code: 'HQ', parentId: null, sort: 1, isActive: true },
      { name: '技术部', code: 'TECH', parentId: 1, sort: 2, isActive: true },
      { name: '运维部', code: 'OPS', parentId: 1, sort: 3, isActive: true },
      { name: '生产部', code: 'PROD', parentId: 1, sort: 4, isActive: true },
    ]);
    console.log('部门数据创建成功');

    await EquipmentCategory.bulkCreate([
      { name: '生产设备', code: 'PROD-EQ', parentId: null, sort: 1, isActive: true },
      { name: '检测设备', code: 'TEST-EQ', parentId: null, sort: 2, isActive: true },
      { name: '办公设备', code: 'OFFICE-EQ', parentId: null, sort: 3, isActive: true },
      { name: '机床', code: 'MACHINE', parentId: 1, sort: 1, isActive: true },
      { name: '冲压设备', code: 'PRESS', parentId: 1, sort: 2, isActive: true },
    ]);
    console.log('设备分类数据创建成功');

    const inspectorPassword = await PasswordUtil.hash('123456');
    await User.bulkCreate([
      {
        username: 'manager',
        password: inspectorPassword,
        realName: '部门经理',
        phone: '13800138001',
        email: 'manager@example.com',
        role: UserRole.MANAGER,
        departmentId: depts[1].id,
        isActive: true,
      },
      {
        username: 'inspector',
        password: inspectorPassword,
        realName: '巡检员',
        phone: '13800138002',
        email: 'inspector@example.com',
        role: UserRole.INSPECTOR,
        departmentId: depts[2].id,
        isActive: true,
      },
      {
        username: 'maintenance',
        password: inspectorPassword,
        realName: '维修员',
        phone: '13800138003',
        email: 'maintenance@example.com',
        role: UserRole.MAINTENANCE,
        departmentId: depts[2].id,
        isActive: true,
      },
    ]);
    console.log('测试用户创建成功，密码均为: 123456');

    console.log('\n数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();
