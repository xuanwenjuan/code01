import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { BusinessError } from '../middlewares/errorHandler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { RoleCode } from '../constants/role';

export class AuthService {
  async register(data: {
    username: string;
    password: string;
    realName: string;
    phone?: string;
    roleCode: RoleCode;
  }) {
    const existingUser = await User.findOne({ where: { username: data.username } });
    if (existingUser) {
      throw new BusinessError('用户名已存在');
    }

    const role = await Role.findOne({ where: { code: data.roleCode } });
    if (!role) {
      throw new BusinessError('角色不存在');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      username: data.username,
      password: hashedPassword,
      realName: data.realName,
      phone: data.phone,
      roleId: role.id,
    });

    return this.sanitizeUser(user);
  }

  async login(username: string, password: string) {
    const user = await User.findOne({
      where: { username },
      include: [Role],
    });
    if (!user) {
      throw new BusinessError('用户名或密码错误');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new BusinessError('用户名或密码错误');
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        roleCode: user.role?.code,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
      }
    );

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async getUserById(id: number) {
    const user = await User.findByPk(id, {
      include: [Role],
    });
    if (!user) {
      throw new BusinessError('用户不存在');
    }
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: User & { role?: Role }) {
    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      roleCode: user.role?.code,
      roleName: user.role?.name,
    };
  }

  async initRoles() {
    const roles = [
      { code: RoleCode.ADMIN, name: '系统管理员', description: '系统超级管理员' },
      { code: RoleCode.MANAGER, name: '门店经理', description: '门店经理' },
      { code: RoleCode.PURCHASER, name: '采购员', description: '负责采购配件' },
      { code: RoleCode.WAREHOUSE_KEEPER, name: '仓管员', description: '负责仓库管理' },
      { code: RoleCode.TECHNICIAN, name: '技师', description: '负责维修和配件领用' },
    ];

    for (const role of roles) {
      await Role.findOrCreate({
        where: { code: role.code },
        defaults: role,
      });
    }

    const adminRole = await Role.findOne({ where: { code: RoleCode.ADMIN } });
    if (adminRole) {
      const adminExists = await User.findOne({ where: { username: 'admin' } });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
          username: 'admin',
          password: hashedPassword,
          realName: '系统管理员',
          roleId: adminRole.id,
        });
      }
    }
  }
}

export const authService = new AuthService();
