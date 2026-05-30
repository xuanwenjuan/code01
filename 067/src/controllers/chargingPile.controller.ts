import { Request, Response } from 'express';
import chargingPileService from '../services/chargingPile.service';
import { ResponseUtil } from '../utils/response';
import { ChargingPileStatus, PowerType } from '../types';

export const create = async (req: Request, res: Response) => {
  try {
    const pile = await chargingPileService.create(req.body);
    res.json(ResponseUtil.success(pile, '创建成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const pile = await chargingPileService.getById(Number(req.params.id));
    res.json(ResponseUtil.success(pile));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getList = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, siteId, status, powerType, keyword } = req.query;
    const result = await chargingPileService.getList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      siteId: siteId ? Number(siteId) : undefined,
      status: status as ChargingPileStatus,
      powerType: powerType as PowerType,
      keyword: keyword as string,
    });
    res.json(ResponseUtil.success(result));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const pile = await chargingPileService.update(Number(req.params.id), req.body);
    res.json(ResponseUtil.success(pile, '更新成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const batchUpdateStatus = async (req: Request, res: Response) => {
  try {
    const { ids, status } = req.body;
    const result = await chargingPileService.batchUpdateStatus(ids, status);
    res.json(ResponseUtil.success(result, '批量更新成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await chargingPileService.delete(Number(req.params.id));
    res.json(ResponseUtil.success(null, '删除成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const { siteId, startDate, endDate } = req.query;
    const stats = await chargingPileService.getStatistics({
      siteId: siteId ? Number(siteId) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(ResponseUtil.success(stats));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const reportFault = async (req: Request, res: Response) => {
  try {
    const { faultDescription } = req.body;
    const pile = await chargingPileService.reportFault(
      Number(req.params.id),
      faultDescription,
      req.user?.id
    );
    res.json(ResponseUtil.success(pile, '故障上报成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const startMaintenance = async (req: Request, res: Response) => {
  try {
    const pile = await chargingPileService.startMaintenance(Number(req.params.id), req.user?.id);
    res.json(ResponseUtil.success(pile, '开始维护成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const completeMaintenance = async (req: Request, res: Response) => {
  try {
    const pile = await chargingPileService.completeMaintenance(Number(req.params.id), {
      ...req.body,
      operatorId: req.user?.id,
    });
    res.json(ResponseUtil.success(pile, '维护完成成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const batchDelete = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    const result = await chargingPileService.batchDelete(ids, req.user?.id);
    res.json(ResponseUtil.success(result, '批量删除成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};
