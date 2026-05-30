import { Request, Response } from 'express';
import chargingSiteService from '../services/chargingSite.service';
import { ResponseUtil } from '../utils/response';

export const create = async (req: Request, res: Response) => {
  try {
    const site = await chargingSiteService.create(req.body);
    res.json(ResponseUtil.success(site, '创建成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const site = await chargingSiteService.getById(Number(req.params.id));
    res.json(ResponseUtil.success(site));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getList = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, categoryId, province, city, keyword, isOperating } = req.query;
    const result = await chargingSiteService.getList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      province: province as string,
      city: city as string,
      keyword: keyword as string,
      isOperating: isOperating !== undefined ? isOperating === 'true' : undefined,
    });
    res.json(ResponseUtil.success(result));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const site = await chargingSiteService.update(Number(req.params.id), req.body);
    res.json(ResponseUtil.success(site, '更新成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await chargingSiteService.delete(Number(req.params.id));
    res.json(ResponseUtil.success(null, '删除成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};
