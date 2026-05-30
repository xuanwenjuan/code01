import { Request, Response } from 'express';
import * as salaryService from '../services/salary.service';
import { ResponseUtil } from '../utils/response';

export const calculateSalary = async (req: Request, res: Response) => {
  const { year, month } = req.body;
  const operatorId = req.user!.userId;
  const result = await salaryService.calculateSalary(year, month, operatorId);
  return ResponseUtil.success(res, result, '薪资核算成功');
};

export const recalculateSingleSalary = async (req: Request, res: Response) => {
  const salaryId = parseInt(req.params.id);
  const operatorId = req.user!.userId;
  const result = await salaryService.recalculateSingleSalary(salaryId, operatorId);
  return ResponseUtil.success(res, result, '薪资重新核算成功');
};

export const getSalaryList = async (req: Request, res: Response) => {
  const params = {
    year: parseInt(req.query.year as string) || new Date().getFullYear(),
    month: parseInt(req.query.month as string) || new Date().getMonth() + 1,
    departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined,
    employeeId: req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined,
    isPaid: req.query.isPaid !== undefined ? req.query.isPaid === 'true' : undefined,
    page: parseInt(req.query.page as string) || 1,
    pageSize: parseInt(req.query.pageSize as string) || 10,
  };
  const result = await salaryService.getSalaryList(params);
  return ResponseUtil.success(res, result, '获取薪资列表成功');
};

export const getSalaryById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const result = await salaryService.getSalaryById(id);
  return ResponseUtil.success(res, result, '获取薪资详情成功');
};

export const getSalaryHistory = async (req: Request, res: Response) => {
  const employeeId = parseInt(req.params.employeeId);
  const limit = parseInt(req.query.limit as string) || 12;
  const result = await salaryService.getSalaryHistory(employeeId, limit);
  return ResponseUtil.success(res, result, '获取薪资历史成功');
};

export const updateSalary = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const result = await salaryService.updateSalary(id, req.body);
  return ResponseUtil.success(res, result, '更新薪资成功');
};

export const deleteSalary = async (req: Request, res: Response) => {
  const { year, month } = req.body;
  const result = await salaryService.deleteSalary(year, month);
  return ResponseUtil.success(res, result, '删除薪资记录成功');
};

export const markAsPaid = async (req: Request, res: Response) => {
  const { year, month } = req.body;
  const operatorId = req.user!.userId;
  const result = await salaryService.markAsPaid(year, month, operatorId);
  return ResponseUtil.success(res, result, '薪资已标记为已发放');
};

export const markSingleAsPaid = async (req: Request, res: Response) => {
  const salaryId = parseInt(req.params.id);
  const operatorId = req.user!.userId;
  const result = await salaryService.markSingleAsPaid(salaryId, operatorId);
  return ResponseUtil.success(res, result, '薪资已标记为已发放');
};

export const getSalaryStats = async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const result = await salaryService.getSalaryStats(year, month);
  return ResponseUtil.success(res, result, '获取薪资统计成功');
};

export const getDepartmentSalaryStats = async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const result = await salaryService.getDepartmentSalaryStats(year, month);
  return ResponseUtil.success(res, result, '获取部门薪资统计成功');
};

export const exportSalaryToExcel = async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
  
  const buffer = await salaryService.exportSalaryToExcel(year, month, departmentId);
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${year}年${month}月薪资表.xlsx`);
  
  return res.send(buffer);
};

export const getMySalary = async (req: Request, res: Response) => {
  const employeeId = req.user!.employeeId;
  if (!employeeId) {
    return ResponseUtil.badRequest(res, '用户未关联员工');
  }
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const result = await salaryService.getMySalary(employeeId, year, month);
  return ResponseUtil.success(res, result, '获取我的薪资成功');
};

export const getMySalaryHistory = async (req: Request, res: Response) => {
  const employeeId = req.user!.employeeId;
  if (!employeeId) {
    return ResponseUtil.badRequest(res, '用户未关联员工');
  }
  const limit = parseInt(req.query.limit as string) || 12;
  const result = await salaryService.getSalaryHistory(employeeId, limit);
  return ResponseUtil.success(res, result, '获取我的薪资历史成功');
};

export const checkSalaryCalculated = async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const result = await salaryService.checkSalaryCalculated(year, month);
  return ResponseUtil.success(res, result, '获取薪资核算状态成功');
};
