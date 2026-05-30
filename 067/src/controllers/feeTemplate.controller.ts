import { Request, Response } from 'express';
import feeTemplateService from '../services/feeTemplate.service';
import { ResponseUtil } from '../utils/response';

export const create = async (req: Request, res: Response) => {
  try {
    const template = await feeTemplateService.create(req.body);
    res.json(ResponseUtil.success(template, '创建成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const template = await feeTemplateService.getById(Number(req.params.id));
    res.json(ResponseUtil.success(template));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getList = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, keyword, isActive } = req.query;
    const result = await feeTemplateService.getList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      keyword: keyword as string,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
    res.json(ResponseUtil.success(result));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getAllActive = async (_req: Request, res: Response) => {
  try {
    const templates = await feeTemplateService.getAllActive();
    res.json(ResponseUtil.success(templates));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const template = await feeTemplateService.update(Number(req.params.id), req.body);
    res.json(ResponseUtil.success(template, '更新成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await feeTemplateService.delete(Number(req.params.id));
    res.json(ResponseUtil.success(null, '删除成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};
