import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op, fn, col, literal } from 'sequelize';
import dayjs from 'dayjs';
import Expense from '../models/Expense.model';
import Category from '../models/Category.model';
import { ExpenseType } from '../constants/enum';
import { ResponseUtil } from '../utils/response';
import { NotFoundException } from '../exceptions/base.exception';

export const createExpenseSchema = Joi.object({
  type: Joi.string().valid(...Object.values(ExpenseType)).required(),
  title: Joi.string().required(),
  amount: Joi.number().positive().required(),
  categoryId: Joi.number().integer().optional(),
  loftId: Joi.number().integer().optional(),
  workOrderId: Joi.number().integer().optional(),
  expenseDate: Joi.date().default(() => new Date()),
  description: Joi.string().optional()
});

export const updateExpenseSchema = Joi.object({
  type: Joi.string().valid(...Object.values(ExpenseType)).optional(),
  title: Joi.string().optional(),
  amount: Joi.number().positive().optional(),
  categoryId: Joi.number().integer().optional(),
  loftId: Joi.number().integer().optional(),
  workOrderId: Joi.number().integer().optional(),
  expenseDate: Joi.date().optional(),
  description: Joi.string().optional()
});

const generateExpenseNo = () => {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `EXP${date}${random}`;
};

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expense = await Expense.create({
      expenseNo: generateExpenseNo(),
      operatorId: req.user!.id,
      ...req.body
    });

    res.json(ResponseUtil.success(expense, '创建成功'));
  } catch (error) {
    next(error);
  }
};

export const getExpenseList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      type,
      categoryId,
      startDate,
      endDate,
      keyword
    } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate && endDate) {
      where.expenseDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    if (keyword) {
      where[Op.or] = [
        { expenseNo: { [Op.like]: `%${keyword}%` } },
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Expense.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['expenseDate', 'DESC'], ['createdAt', 'DESC']]
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

export const getExpenseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });

    if (!expense) {
      throw new NotFoundException('开销记录不存在');
    }

    res.json(ResponseUtil.success(expense));
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      throw new NotFoundException('开销记录不存在');
    }

    await expense.update(req.body);

    res.json(ResponseUtil.success(expense, '更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      throw new NotFoundException('开销记录不存在');
    }

    await expense.destroy();

    res.json(ResponseUtil.success(null, '删除成功'));
  } catch (error) {
    next(error);
  }
};

export const getMonthlyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year, month } = req.query;

    const targetYear = year ? Number(year) : dayjs().year();
    const targetMonth = month ? Number(month) : dayjs().month() + 1;

    const startDate = dayjs(`${targetYear}-${targetMonth}-01`).startOf('month').toDate();
    const endDate = dayjs(startDate).endOf('month').toDate();

    const typeStats = await Expense.findAll({
      where: {
        expenseDate: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        'type',
        [fn('SUM', col('amount')), 'totalAmount'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['type']
    });

    const categoryStats = await Expense.findAll({
      where: {
        expenseDate: { [Op.between]: [startDate, endDate] },
        categoryId: { [Op.ne]: null }
      },
      attributes: [
        'categoryId',
        [fn('SUM', col('amount')), 'totalAmount'],
        [fn('COUNT', col('id')), 'count']
      ],
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      group: ['categoryId']
    });

    const totalResult = await Expense.findOne({
      where: {
        expenseDate: { [Op.between]: [startDate, endDate] }
      },
      attributes: [[fn('SUM', col('amount')), 'total']]
    });

    res.json(ResponseUtil.success({
      year: targetYear,
      month: targetMonth,
      totalAmount: (totalResult as any)?.dataValues?.total || 0,
      typeStats,
      categoryStats
    }));
  } catch (error) {
    next(error);
  }
};
