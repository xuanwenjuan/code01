import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Role from '../models/Role';
import Department from '../models/Department';
import ActivityCategory from '../models/ActivityCategory';
import { AppError } from '../middleware/errorHandler';
import sequelize from '../config/database';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError('用户名和密码不能为空', 400);
    }

    const user = await User.findOne({
      where: { username },
      include: [Department, Role]
    });

    if (!user) {
      throw new AppError('用户名或密码错误', 401);
    }

    if (user.status !== 1) {
      throw new AppError('账号已被禁用', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('用户名或密码错误', 401);
    }

    const payload = {
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
      departmentId: user.departmentId
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.success({
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        email: user.email,
        phone: user.phone,
        roleId: user.roleId,
        departmentId: user.departmentId,
        role: (user as any).Role,
        department: (user as any).Department
      }
    }, '登录成功');
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('用户未认证', 401);
    }

    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] },
      include: [Department, Role]
    });

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    res.success(user);
  } catch (error) {
    next(error);
  }
};

export const initData = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const roleCount = await Role.count();
    if (roleCount > 0) {
      await t.rollback();
      throw new AppError('系统已初始化数据，无需重复操作', 400);
    }

    const roles = await Role.bulkCreate([
      { name: '超级管理员', code: 'SUPER_ADMIN', description: '系统最高权限' },
      { name: '管理员', code: 'ADMIN', description: '后台管理权限' },
      { name: '部门经理', code: 'DEPARTMENT_MANAGER', description: '部门管理权限' },
      { name: '普通员工', code: 'EMPLOYEE', description: '普通员工权限' }
    ], { transaction: t });

    const dept1 = await Department.create({
      name: '总公司',
      parentId: null,
      sortOrder: 1
    }, { transaction: t });

    const dept2 = await Department.create({
      name: '技术部',
      parentId: dept1.id,
      sortOrder: 1
    }, { transaction: t });

    const dept3 = await Department.create({
      name: '人力资源部',
      parentId: dept1.id,
      sortOrder: 2
    }, { transaction: t });

    const dept4 = await Department.create({
      name: '市场部',
      parentId: dept1.id,
      sortOrder: 3
    }, { transaction: t });

    const hashedPassword = await bcrypt.hash('123456', 10);

    await User.bulkCreate([
      {
        username: 'admin',
        password: hashedPassword,
        realName: '超级管理员',
        email: 'admin@company.com',
        phone: '13800138000',
        roleId: roles[0].id,
        departmentId: dept1.id,
        status: 1
      },
      {
        username: 'manager',
        password: hashedPassword,
        realName: '部门经理',
        email: 'manager@company.com',
        phone: '13800138001',
        roleId: roles[2].id,
        departmentId: dept2.id,
        status: 1
      },
      {
        username: 'employee',
        password: hashedPassword,
        realName: '普通员工',
        email: 'employee@company.com',
        phone: '13800138002',
        roleId: roles[3].id,
        departmentId: dept2.id,
        status: 1
      }
    ], { transaction: t });

    await ActivityCategory.bulkCreate([
      { name: '户外拓展', parentId: null, description: '户外团建活动', sortOrder: 1, status: 1 },
      { name: '文旅研学', parentId: null, description: '文化旅游研学活动', sortOrder: 2, status: 1 },
      { name: '聚餐年会', parentId: null, description: '聚餐和年会活动', sortOrder: 3, status: 1 },
      { name: '趣味赛事', parentId: null, description: '趣味运动赛事', sortOrder: 4, status: 1 },
      { name: '登山徒步', parentId: null, description: '登山和徒步活动', sortOrder: 5, status: 1 },
      { name: '露营野炊', parentId: null, description: '露营和野炊活动', sortOrder: 6, status: 1 },
      { name: '名胜古迹', parentId: null, description: '参观名胜古迹', sortOrder: 7, status: 1 },
      { name: '红色教育', parentId: null, description: '红色教育基地学习', sortOrder: 8, status: 1 }
    ], { transaction: t });

    await t.commit();
    
    res.success({
      message: '数据初始化成功',
      defaultAccount: 'admin / 123456'
    }, '系统初始化完成');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
