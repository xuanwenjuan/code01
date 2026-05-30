import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { ResponseUtil } from '../utils/response.util';
import { NotFoundException, BadRequestException } from '../common/http-exception';
import { UserRole } from '../common/enums';
import { Op } from 'sequelize';

export const getUserList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, username, realName, role, status } = req.query;

    const where: any = {};
    if (username) {
      where.username = { [Op.like]: `%${username}%` };
    }
    if (realName) {
      where.realName = { [Op.like]: `%${realName}%` };
    }
    if (role) {
      where.role = role;
    }
    if (status !== undefined) {
      where.status = status === 'true';
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
    });

    res.json(ResponseUtil.page(rows, count, Number(page), Number(pageSize)));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return next(new NotFoundException('用户不存在'));
    }

    res.json(ResponseUtil.success(user));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, realName, phone, email, role, avatar } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return next(new BadRequestException('用户名已存在'));
    }

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return next(new BadRequestException('手机号已存在'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      realName,
      phone,
      email,
      role: role || UserRole.BUSINESS,
      avatar,
      status: true,
    });

    const userResponse = user.toJSON();
    delete (userResponse as any).password;

    res.json(ResponseUtil.success(userResponse, '创建成功'));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { realName, phone, email, role, avatar, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return next(new NotFoundException('用户不存在'));
    }

    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return next(new BadRequestException('手机号已存在'));
      }
    }

    await user.update({
      realName,
      phone,
      email,
      role,
      avatar,
      status,
    });

    const userResponse = user.toJSON();
    delete (userResponse as any).password;

    res.json(ResponseUtil.success(userResponse, '更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return next(new NotFoundException('用户不存在'));
    }

    if (user.role === UserRole.ADMIN) {
      return next(new BadRequestException('不能删除管理员账户'));
    }

    await user.destroy();
    res.json(ResponseUtil.success(null, '删除成功'));
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
      return next(new NotFoundException('用户不存在'));
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return next(new BadRequestException('原密码不正确'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json(ResponseUtil.success(null, '密码修改成功'));
  } catch (error) {
    next(error);
  }
};