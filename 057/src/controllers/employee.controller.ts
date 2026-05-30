import { Request, Response } from 'express';
import * as employeeService from '../services/employee.service';
import { ResponseUtil } from '../utils/response';
import { EmployeeStatus } from '../models/Employee';

export const getEmployeeList = async (req: Request, res: Response) => {
  const params = {
    page: parseInt(req.query.page as string) || 1,
    pageSize: parseInt(req.query.pageSize as string) || 10,
    departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined,
    status: req.query.status as EmployeeStatus | undefined,
    keyword: req.query.keyword as string | undefined,
  };
  
  const result = await employeeService.getEmployeeList(params);
  return ResponseUtil.success(res, result, '获取员工列表成功');
};

export const getEmployeeById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const result = await employeeService.getEmployeeById(id);
  return ResponseUtil.success(res, result, '获取员工详情成功');
};

export const getEmployeeHistory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const params = {
    page: parseInt(req.query.page as string) || 1,
    pageSize: parseInt(req.query.pageSize as string) || 20,
  };
  const result = await employeeService.getEmployeeHistory(id, params);
  return ResponseUtil.success(res, result, '获取员工变更历史成功');
};

export const getMyProfile = async (req: Request, res: Response) => {
  const employeeId = req.user!.employeeId;
  if (!employeeId) {
    return ResponseUtil.badRequest(res, '用户未关联员工信息');
  }
  const result = await employeeService.getEmployeeById(employeeId);
  return ResponseUtil.success(res, result, '获取个人信息成功');
};

export const createEmployee = async (req: Request, res: Response) => {
  const operatorId = req.user!.userId;
  const result = await employeeService.createEmployee(req.body, operatorId);
  return ResponseUtil.created(res, result, '创建员工成功');
};

export const updateEmployee = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const operatorId = req.user!.userId;
  const result = await employeeService.updateEmployee(id, req.body, operatorId);
  return ResponseUtil.success(res, result, '更新员工信息成功');
};

export const deleteEmployee = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const operatorId = req.user!.userId;
  await employeeService.deleteEmployee(id, operatorId);
  return ResponseUtil.success(res, null, '删除员工成功');
};

export const confirmEmployee = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const operatorId = req.user!.userId;
  const { confirmationDate } = req.body;
  const result = await employeeService.confirmEmployee(
    id, 
    operatorId, 
    confirmationDate ? new Date(confirmationDate) : undefined
  );
  return ResponseUtil.success(res, result, '员工转正成功');
};

export const resignEmployee = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { resignationDate, reason } = req.body;
  const operatorId = req.user!.userId;
  const result = await employeeService.resignEmployee(
    id, 
    new Date(resignationDate), 
    operatorId, 
    reason
  );
  return ResponseUtil.success(res, result, '员工离职成功');
};

export const terminateEmployee = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { terminationDate, reason } = req.body;
  const operatorId = req.user!.userId;
  const result = await employeeService.terminateEmployee(
    id, 
    new Date(terminationDate), 
    operatorId, 
    reason
  );
  return ResponseUtil.success(res, result, '员工解雇成功');
};

export const getEmployeeStats = async (req: Request, res: Response) => {
  const result = await employeeService.getEmployeeStats();
  return ResponseUtil.success(res, result, '获取员工统计成功');
};
