import User from '../models/User';
import Role, { RoleType } from '../models/Role';
import { NotFoundError, BusinessError, AuthenticationError } from '../utils/errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

class AuthService {
  async register(data: {
    username: string;
    password: string;
    realName: string;
    phone: string;
    email?: string;
    roleId: number;
  }): Promise<User> {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username: data.username }, { phone: data.phone }]
      }
    });

    if (existingUser) {
      throw new BusinessError('用户名或手机号已存在');
    }

    const role = await Role.findByPk(data.roleId);
    if (!role) {
      throw new NotFoundError('角色不存在');
    }

    const user = await User.create(data);
    return user;
  }

  async login(username: string, password: string): Promise<{ token: string; user: any }> {
    const user = await User.findOne({
      where: { username },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      throw new AuthenticationError('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new BusinessError('账号已被禁用');
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: (user as any).role?.code,
        roleId: user.roleId
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const userData = user.toJSON();
    delete (userData as any).password;

    return { token, user: userData };
  }

  async getUserById(id: number): Promise<User> {
    const user = await User.findByPk(id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    return user;
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BusinessError('原密码错误');
    }

    await user.update({ password: newPassword });
  }

  async initDefaultRoles(): Promise<void> {
    const roles = [
      { name: '超级管理员', code: RoleType.ADMIN, description: '系统最高权限', permissions: ['*'] },
      { name: '经理', code: RoleType.MANAGER, description: '网点管理权限', permissions: ['branch:*', 'vehicle:*', 'order:*', 'settlement:*'] },
      { name: '调度员', code: RoleType.DISPATCHER, description: '订单调度权限', permissions: ['order:*', 'vehicle:view'] },
      { name: '司机', code: RoleType.DRIVER, description: '司机权限', permissions: ['order:view', 'vehicle:view'] },
      { name: '客户', code: RoleType.CUSTOMER, description: '客户权限', permissions: ['order:create', 'order:view'] }
    ];

    for (const role of roles) {
      await Role.findOrCreate({
        where: { code: role.code },
        defaults: role
      });
    }
  }

  async initAdminUser(): Promise<void> {
    const adminRole = await Role.findOne({ where: { code: RoleType.ADMIN } });
    if (!adminRole) {
      throw new BusinessError('管理员角色不存在，请先初始化角色');
    }

    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (!existingAdmin) {
      await User.create({
        username: 'admin',
        password: '123456',
        realName: '系统管理员',
        phone: '13800138000',
        roleId: adminRole.id,
        isActive: true
      });
    }
  }
}

export default new AuthService();
