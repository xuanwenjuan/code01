import bcrypt from 'bcryptjs';
import sequelize from './config/database';
import Department from './models/Department';
import Role from './models/Role';
import User from './models/User';
import Warehouse from './models/Warehouse';
import Category from './models/Category';

async function initData() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized.');

    await Department.bulkCreate([
      { name: '总经办', code: 'ZJB', parentId: null, sort: 1, status: 1 },
      { name: '行政部', code: 'XZB', parentId: null, sort: 2, status: 1 },
      { name: '财务部', code: 'CWB', parentId: null, sort: 3, status: 1 },
      { name: '技术部', code: 'JSB', parentId: null, sort: 4, status: 1 }
    ]);
    console.log('Departments created.');

    await Role.bulkCreate([
      { name: '超级管理员', code: 'SUPER_ADMIN', description: '系统超级管理员', status: 1 },
      { name: '部门主管', code: 'DEPT_MANAGER', description: '部门主管', status: 1 },
      { name: '仓库管理员', code: 'WAREHOUSE_MANAGER', description: '仓库管理员', status: 1 },
      { name: '普通员工', code: 'EMPLOYEE', description: '普通员工', status: 1 }
    ]);
    console.log('Roles created.');

    const hashedPassword = await bcrypt.hash('123456', 10);
    await User.bulkCreate([
      { username: 'admin', password: hashedPassword, realName: '管理员', email: 'admin@example.com', phone: '13800138000', roleId: 1, departmentId: 1, status: 1 },
      { username: 'manager', password: hashedPassword, realName: '部门主管', email: 'manager@example.com', phone: '13800138001', roleId: 2, departmentId: 2, status: 1 },
      { username: 'warehouse', password: hashedPassword, realName: '仓管', email: 'warehouse@example.com', phone: '13800138002', roleId: 3, departmentId: 2, status: 1 },
      { username: 'employee', password: hashedPassword, realName: '员工', email: 'employee@example.com', phone: '13800138003', roleId: 4, departmentId: 4, status: 1 }
    ]);
    console.log('Users created.');

    await Warehouse.bulkCreate([
      { name: '主仓库', code: 'MAIN', address: '办公楼1楼', managerId: 3, sort: 1, status: 1 },
      { name: '副仓库', code: 'SUB', address: '办公楼2楼', managerId: 3, sort: 2, status: 1 }
    ]);
    console.log('Warehouses created.');

    await Category.bulkCreate([
      { name: '办公耗材', code: 'OFFICE', parentId: null, level: 1, sort: 1, status: 1 },
      { name: '劳保用品', code: 'LABOR', parentId: null, level: 1, sort: 2, status: 1 },
      { name: '电子配件', code: 'ELECTRONIC', parentId: null, level: 1, sort: 3, status: 1 },
      { name: '清洁物资', code: 'CLEANING', parentId: null, level: 1, sort: 4, status: 1 },
      { name: '打印耗材', code: 'PRINT', parentId: 1, level: 2, sort: 1, status: 1 },
      { name: '书写工具', code: 'WRITE', parentId: 1, level: 2, sort: 2, status: 1 }
    ]);
    console.log('Categories created.');

    console.log('Data initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Data initialization failed:', error);
    process.exit(1);
  }
}

initData();