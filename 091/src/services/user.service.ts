import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { BadRequestException, NotFoundException } from '../exceptions/base.exception';
import User, { IUserAttributes } from '../models/user.model';
import { UserRole } from '../constants/role.constants';

export interface CreateUserDto {
  username: string;
  password: string;
  realName: string;
  phone: string;
  role: UserRole;
  avatar?: string;
}

export interface UpdateUserDto {
  realName?: string;
  phone?: string;
  role?: UserRole;
  avatar?: string;
  isActive?: boolean;
  password?: string;
}

export interface UserQueryDto {
  page?: number;
  pageSize?: number;
  role?: UserRole;
  isActive?: boolean;
  keyword?: string;
}

class UserService {
  async create(createDto: CreateUserDto): Promise<User> {
    const existingUser = await User.findOne({ where: { username: createDto.username } });
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    return await User.create({
      ...createDto,
      password: hashedPassword,
    });
  }

  async findAll(query: UserQueryDto): Promise<{ list: User[]; total: number; page: number; pageSize: number }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const where: any = {};
    if (query.role) where.role = query.role;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${query.keyword}%` } },
        { realName: { [Op.like]: `%${query.keyword}%` } },
        { phone: { [Op.like]: `%${query.keyword}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async update(id: number, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }

    await user.update(updateDto);
    return user;
  }

  async remove(id: number, operatorRole?: UserRole): Promise<void> {
    const user = await this.findOne(id);
    
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('不能删除超级管理员账号');
    }
    
    if (user.role === UserRole.ADMIN && operatorRole !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('只有超级管理员才能删除管理员账号');
    }
    
    if (user.role === UserRole.ADMIN) {
      const adminCount = await User.count({ where: { role: UserRole.ADMIN, isActive: true } });
      if (adminCount <= 1) {
        throw new BadRequestException('不能删除最后一个管理员账号');
      }
    }
    
    await user.destroy();
  }

  async toggleActive(id: number, operatorRole: UserRole): Promise<User> {
    const user = await this.findOne(id);
    
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('不能禁用超级管理员账号');
    }
    
    if (user.role === UserRole.ADMIN && operatorRole !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('只有超级管理员才能禁用管理员账号');
    }
    
    await user.update({ isActive: !user.isActive });
    return user;
  }
}

export default new UserService();
