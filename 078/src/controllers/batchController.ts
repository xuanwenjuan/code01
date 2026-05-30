import { Response } from 'express';
import { Op } from 'sequelize';
import BenefitBatch, { BatchStatus } from '../models/BenefitBatch';
import BenefitClaim from '../models/BenefitClaim';
import { AuthRequest } from '../middleware/auth';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const getBatchList = async (req: AuthRequest, res: Response) => {
  const { name, festival, status, page = 1, pageSize = 10 } = req.query;

  const where: any = {};
  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }
  if (festival) {
    where.festival = { [Op.like]: `%${festival}%` };
  }
  if (status) {
    where.status = status;
  }

  const { count, rows } = await BenefitBatch.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(ResponseUtil.success({
    list: rows,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  }));
};

export const getBatchById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const batch = await BenefitBatch.findByPk(id);

  if (!batch) {
    throw new AppError('批次不存在', 404);
  }

  res.json(ResponseUtil.success(batch));
};

export const createBatch = async (req: AuthRequest, res: Response) => {
  const { code } = req.body;

  const existingBatch = await BenefitBatch.findOne({ where: { code } });
  if (existingBatch) {
    throw new AppError('批次编码已存在', 400);
  }

  const batch = await BenefitBatch.create({
    ...req.body,
    createdBy: req.user!.id
  });

  res.json(ResponseUtil.success(batch, '创建成功'));
};

export const updateBatch = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { code } = req.body;

  const batch = await BenefitBatch.findByPk(id);
  if (!batch) {
    throw new AppError('批次不存在', 404);
  }

  if (batch.status !== BatchStatus.DRAFT) {
    throw new AppError('只能编辑草稿状态的批次', 400);
  }

  if (code) {
    const existingBatch = await BenefitBatch.findOne({
      where: { code, id: { [Op.ne]: id } }
    });
    if (existingBatch) {
      throw new AppError('批次编码已存在', 400);
    }
  }

  await batch.update(req.body);

  res.json(ResponseUtil.success(batch, '更新成功'));
};

export const deleteBatch = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const batch = await BenefitBatch.findByPk(id);
  if (!batch) {
    throw new AppError('批次不存在', 404);
  }

  if (batch.status !== BatchStatus.DRAFT) {
    throw new AppError('只能删除草稿状态的批次', 400);
  }

  await batch.destroy();

  res.json(ResponseUtil.success(null, '删除成功'));
};

export const publishBatch = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const batch = await BenefitBatch.findByPk(id);
  if (!batch) {
    throw new AppError('批次不存在', 404);
  }

  if (batch.status !== BatchStatus.DRAFT) {
    throw new AppError('只能发布草稿状态的批次', 400);
  }

  await batch.update({ status: BatchStatus.PUBLISHED });

  res.json(ResponseUtil.success(null, '发布成功'));
};

export const getActiveBatches = async (req: AuthRequest, res: Response) => {
  const today = new Date();

  const batches = await BenefitBatch.findAll({
    where: {
      status: { [Op.in]: [BatchStatus.PUBLISHED, BatchStatus.IN_PROGRESS] },
      startDate: { [Op.lte]: today },
      endDate: { [Op.gte]: today }
    },
    order: [['startDate', 'ASC']]
  });

  res.json(ResponseUtil.success(batches));
};
