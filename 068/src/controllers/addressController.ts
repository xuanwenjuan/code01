import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op, Transaction } from 'sequelize';
import Address from '../models/Address';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';
import sequelize from '../database';

const addressSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  province: Joi.string().required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  detail: Joi.string().required(),
  isDefault: Joi.number().valid(0, 1).default(0),
});

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { error, value } = addressSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const userId = req.user!.id;

    if (value.isDefault === 1) {
      await Address.update(
        { isDefault: 0 },
        { where: { userId }, transaction }
      );
    }

    const address = await Address.create(
      {
        ...value,
        userId,
      },
      { transaction }
    );

    await transaction.commit();

    return ResponseUtil.success(res, address, '创建地址成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getAddressList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const addresses = await Address.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['id', 'DESC']],
    });

    return ResponseUtil.success(res, addresses, '获取地址列表成功');
  } catch (error) {
    next(error);
  }
};

export const getAddressById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const address = await Address.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new AppError('地址不存在', 404);
    }

    return ResponseUtil.success(res, address, '获取地址成功');
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { error, value } = addressSchema.validate(req.body);

    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const userId = req.user!.id;

    const address = await Address.findOne({
      where: { id, userId },
      transaction,
    });

    if (!address) {
      throw new AppError('地址不存在', 404);
    }

    if (value.isDefault === 1) {
      await Address.update(
        { isDefault: 0 },
        { where: { userId, id: { [Op.ne]: id } }, transaction }
      );
    }

    await address.update(value, { transaction });

    await transaction.commit();

    return ResponseUtil.success(res, address, '更新地址成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const address = await Address.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new AppError('地址不存在', 404);
    }

    await address.destroy();

    return ResponseUtil.success(res, null, '删除地址成功');
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const address = await Address.findOne({
      where: { id, userId },
      transaction,
    });

    if (!address) {
      throw new AppError('地址不存在', 404);
    }

    await Address.update(
      { isDefault: 0 },
      { where: { userId }, transaction }
    );

    await address.update({ isDefault: 1 }, { transaction });

    await transaction.commit();

    return ResponseUtil.success(res, address, '设置默认地址成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
