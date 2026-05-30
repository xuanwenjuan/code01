import { Request, Response } from 'express';
import * as performanceService from '../services/performance.service';
import { ResponseUtil } from '../utils/response';

export const getPerformanceList = async (req: Request, res: Response) => {
  const params = {
    year: parseInt(req.query.year as string),
    month: parseInt(req.query.month as string),
    departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined,
    employeeId: req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined,
    page: parseInt(req.query.page as string) || 1,
    pageSize: parseInt(req.query.pageSize as string) || 10,
  };
  const result = await performanceService.getPerformanceList(params);
  return ResponseUtil.success(res, result, '获取绩效列表成功');
};

export const getPerformanceById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const result = await performanceService.getPerformanceById(id);
  return ResponseUtil.success(res, result, '获取绩效详情成功');
};

export const getEmployeePerformance = async (req: Request, res: Response) => {
  const employeeId = parseInt(req.params.employeeId);
  const year = parseInt(req.query.year as string);
  const month = parseInt(req.query.month as string);
  const result = await performanceService.getEmployeePerformance(employeeId, year, month);
  return ResponseUtil.success(res, result, '获取员工绩效成功');
};

export const createPerformance = async (req: Request, res: Response) => {
  const operatorId = req.user!.userId;
  const result = await performanceService.createPerformance(req.body, operatorId);
  return ResponseUtil.created(res, result, '创建绩效成功');
};

export const updatePerformance = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const operatorId = req.user!.userId;
  const result = await performanceService.updatePerformance(id, req.body, operatorId);
  return ResponseUtil.success(res, result, '更新绩效成功');
};

export const deletePerformance = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await performanceService.deletePerformance(id);
  return ResponseUtil.success(res, null, '删除绩效成功');
};

export const getPerformanceStats = async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string);
  const month = parseInt(req.query.month as string);
  const result = await performanceService.getPerformanceStats(year, month);
  return ResponseUtil.success(res, result, '获取绩效统计成功');
};

export const bulkCreatePerformances = async (req: Request, res: Response) => {
  const { year, month, performances } = req.body;
  const operatorId = req.user!.userId;
  const result = await performanceService.bulkCreatePerformances(year, month, performances, operatorId);
  return ResponseUtil.created(res, result, '批量创建绩效成功');
};
