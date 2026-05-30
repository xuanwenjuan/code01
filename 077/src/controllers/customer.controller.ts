import { Request, Response } from 'express';
import { Op, Transaction } from 'sequelize';
import { ApiResponse } from '../utils/response';
import Customer from '../database/models/Customer.model';
import RentalOrder from '../database/models/RentalOrder.model';
import { BadRequestException, NotFoundException } from '../exceptions/http.exception';
import { generateCustomerNo } from '../utils/orderNo';
import { sequelize } from '../database';
import { OrderStatus } from '../types';

export const createCustomer = async (req: Request, res: Response) => {
  const { companyName, contactPerson, contactPhone, contactEmail, address, businessLicense, creditLevel, remark } = req.body;

  if (!companyName || !companyName.trim()) {
    throw new BadRequestException('公司名称不能为空');
  }
  if (companyName.length > 200) {
    throw new BadRequestException('公司名称不能超过200个字符');
  }
  if (!contactPerson || !contactPerson.trim()) {
    throw new BadRequestException('联系人不能为空');
  }
  if (contactPerson.length > 50) {
    throw new BadRequestException('联系人姓名不能超过50个字符');
  }
  if (!contactPhone || !contactPhone.trim()) {
    throw new BadRequestException('联系电话不能为空');
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(contactPhone.trim())) {
    throw new BadRequestException('联系电话格式不正确');
  }

  if (contactEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail.trim())) {
      throw new BadRequestException('邮箱格式不正确');
    }
  }

  const existingCustomer = await Customer.findOne({
    where: { contactPhone: contactPhone.trim() }
  });
  if (existingCustomer) {
    throw new BadRequestException('该联系电话已被使用');
  }

  const customerNo = generateCustomerNo();

  const customer = await Customer.create({
    customerNo,
    companyName: companyName.trim(),
    contactPerson: contactPerson.trim(),
    contactPhone: contactPhone.trim(),
    contactEmail: contactEmail?.trim(),
    address,
    businessLicense,
    creditLevel: creditLevel || 1,
    status: 1,
    remark
  });

  res.json(ApiResponse.success(customer, '客户创建成功'));
};

export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const customerId = parseInt(id);
  if (isNaN(customerId)) {
    throw new BadRequestException('无效的客户ID');
  }

  const customer = await Customer.findByPk(customerId);
  if (!customer) {
    throw new NotFoundException('客户不存在');
  }

  if (updateData.companyName !== undefined) {
    if (!updateData.companyName || !updateData.companyName.trim()) {
      throw new BadRequestException('公司名称不能为空');
    }
    if (updateData.companyName.length > 200) {
      throw new BadRequestException('公司名称不能超过200个字符');
    }
  }

  if (updateData.contactPerson !== undefined) {
    if (!updateData.contactPerson || !updateData.contactPerson.trim()) {
      throw new BadRequestException('联系人不能为空');
    }
    if (updateData.contactPerson.length > 50) {
      throw new BadRequestException('联系人姓名不能超过50个字符');
    }
  }

  if (updateData.contactPhone !== undefined) {
    if (!updateData.contactPhone || !updateData.contactPhone.trim()) {
      throw new BadRequestException('联系电话不能为空');
    }
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(updateData.contactPhone.trim())) {
      throw new BadRequestException('联系电话格式不正确');
    }

    const existingCustomer = await Customer.findOne({
      where: {
        contactPhone: updateData.contactPhone.trim(),
        id: { [Op.ne]: customerId }
      }
    });
    if (existingCustomer) {
      throw new BadRequestException('该联系电话已被使用');
    }
  }

  if (updateData.contactEmail !== undefined && updateData.contactEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.contactEmail.trim())) {
      throw new BadRequestException('邮箱格式不正确');
    }
  }

  await customer.update(updateData);

  res.json(ApiResponse.success(customer, '客户更新成功'));
};

export const deleteCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;

  const customerId = parseInt(id);
  if (isNaN(customerId)) {
    throw new BadRequestException('无效的客户ID');
  }

  const customer = await Customer.findByPk(customerId);
  if (!customer) {
    throw new NotFoundException('客户不存在');
  }

  const orderCount = await RentalOrder.count({
    where: {
      customerId,
      status: {
        [Op.in]: [
          OrderStatus.PENDING_PAYMENT,
          OrderStatus.PAID,
          OrderStatus.DELIVERED,
          OrderStatus.IN_USE,
          OrderStatus.OVERDUE,
          OrderStatus.RETURNED
        ]
      }
    }
  });

  if (orderCount > 0) {
    throw new BadRequestException(`该客户存在 ${orderCount} 个进行中的订单，无法删除`);
  }

  await customer.destroy();

  res.json(ApiResponse.success(null, '客户删除成功'));
};

export const getCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;

  const customerId = parseInt(id);
  if (isNaN(customerId)) {
    throw new BadRequestException('无效的客户ID');
  }

  const customer = await Customer.findByPk(customerId);
  if (!customer) {
    throw new NotFoundException('客户不存在');
  }

  const orderStats = await RentalOrder.findOne({
    where: { customerId },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN status IN (\'IN_USE\', \'OVERDUE\') THEN 1 ELSE 0 END')), 'activeOrders']
    ],
    raw: true
  });

  res.json(ApiResponse.success({
    ...customer.toJSON(),
    orderStats
  }));
};

export const getCustomerList = async (req: Request, res: Response) => {
  const { companyName, contactPerson, contactPhone, status, page = 1, pageSize = 10 } = req.query;

  const pageNum = parseInt(page as string);
  const size = parseInt(pageSize as string);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new BadRequestException('无效的页码');
  }
  if (isNaN(size) || size < 1 || size > 100) {
    throw new BadRequestException('无效的每页数量');
  }

  const where: any = {};
  if (companyName) {
    where.companyName = { [Op.like]: `%${companyName}%` };
  }
  if (contactPerson) {
    where.contactPerson = { [Op.like]: `%${contactPerson}%` };
  }
  if (contactPhone) {
    where.contactPhone = { [Op.like]: `%${contactPhone}%` };
  }
  if (status !== undefined && status !== '') {
    const statusVal = parseInt(status as string);
    if (statusVal === 0 || statusVal === 1) {
      where.status = statusVal;
    }
  }

  const { count, rows } = await Customer.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset: (pageNum - 1) * size,
    limit: size
  });

  res.json(ApiResponse.successPage(rows, count, pageNum, size));
};

export const batchUpdateStatus = async (req: Request, res: Response) => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestException('请选择要操作的客户');
  }

  if (status !== 0 && status !== 1) {
    throw new BadRequestException('无效的状态值');
  }

  await Customer.update(
    { status },
    { where: { id: { [Op.in]: ids } } }
  );

  res.json(ApiResponse.success(null, '批量更新客户状态成功'));
};
