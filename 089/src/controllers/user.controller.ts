import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { ResponseUtil } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/error';
import { UserRole } from '../types';
import bcrypt from 'bcryptjs';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, realName, phone, email, role } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new BadRequestError('用户名已存在');
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestError('无效的用户角色');
    }

    const user = await User.create({
      username,
      password,
      realName,
      phone,
      email,
      role,
      isActive: true
    });

    const { password: _, ...userData } = user.toJSON();
    res.json(ResponseUtil.success(userData, '用户创建成功'));
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, role, keyword } = req.query;
    
    const where: any = {};
    if (role) where.role = role;
    if (keyword) {
      where.realName = { $like: `%${keyword}%` };
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    res.json(ResponseUtil.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    }));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    res.json(ResponseUtil.success(user));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { realName, phone, email, role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    if (role && !Object.values(UserRole).includes(role)) {
      throw new BadRequestError('无效的用户角色');
    }

    await user.update({ realName, phone, email, role, isActive });

    const { password: _, ...userData } = user.toJSON();
    res.json(ResponseUtil.success(userData, '用户更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    if (user.role === UserRole.ADMIN) {
      const adminCount = await User.count({ where: { role: UserRole.ADMIN } });
      if (adminCount <= 1) {
        throw new BadRequestError('至少需要保留一个管理员');
      }
    }

    await user.destroy();
    res.json(ResponseUtil.success(null, '用户删除成功'));
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestError('原密码错误');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.update({ password: hashedPassword });

    res.json(ResponseUtil.success(null, '密码修改成功'));
  } catch (error) {
    next(error);
  }
};