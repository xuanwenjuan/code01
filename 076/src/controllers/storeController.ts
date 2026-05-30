import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Store, User } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import { UserRole } from '../types';

export const createStore = async (req: Request, res: Response) => {
  const { name, address, phone, businessHours, managerId } = req.body;

  if (!name || !address || !phone) {
    throw new BadRequestException('缺少必填参数');
  }

  if (managerId) {
    const manager = await User.findByPk(managerId);
    if (!manager || (manager.role !== UserRole.STORE_MANAGER && manager.role !== UserRole.SUPER_ADMIN)) {
      throw new BadRequestException('店长不存在或角色不正确');
    }
  }

  const store = await Store.create({
    name,
    address,
    phone,
    businessHours,
    managerId,
    status: 'active'
  });

  res.status(201).json(ResponseUtil.created(store, '门店创建成功'));
};

export const updateStore = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, address, phone, businessHours, managerId, status } = req.body;

  const store = await Store.findByPk(id);
  if (!store) {
    throw new NotFoundException('门店不存在');
  }

  if (req.user?.role !== UserRole.SUPER_ADMIN && req.user?.storeId !== Number(id)) {
    throw new ForbiddenException('无权操作此门店');
  }

  if (managerId) {
    const manager = await User.findByPk(managerId);
    if (!manager || (manager.role !== UserRole.STORE_MANAGER && manager.role !== UserRole.SUPER_ADMIN)) {
      throw new BadRequestException('店长不存在或角色不正确');
    }
  }

  await store.update({
    name: name || store.name,
    address: address || store.address,
    phone: phone || store.phone,
    businessHours: businessHours !== undefined ? businessHours : store.businessHours,
    managerId: managerId !== undefined ? managerId : store.managerId,
    status: status || store.status
  });

  res.json(ResponseUtil.success(store, '门店更新成功'));
};

export const deleteStore = async (req: Request, res: Response) => {
  const { id } = req.params;

  const store = await Store.findByPk(id);
  if (!store) {
    throw new NotFoundException('门店不存在');
  }

  await store.update({ status: 'closed' });

  res.json(ResponseUtil.success(null, '门店已关闭'));
};

export const getStore = async (req: Request, res: Response) => {
  const { id } = req.params;

  const store = await Store.findByPk(id, {
    include: [{ model: User, as: 'employees' }]
  });

  if (!store) {
    throw new NotFoundException('门店不存在');
  }

  res.json(ResponseUtil.success(store));
};

export const getStoreList = async (req: Request, res: Response) => {
  const { status, keyword, page = 1, pageSize = 10 } = req.query;

  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (keyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${keyword}%` } },
      { address: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const { count, rows } = await Store.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(ResponseUtil.pagination(rows, count, Number(page), Number(pageSize)));
};

export const getAllStores = async (req: Request, res: Response) => {
  const stores = await Store.findAll({
    where: { status: 'active' },
    order: [['name', 'ASC']]
  });

  res.json(ResponseUtil.success(stores));
};
