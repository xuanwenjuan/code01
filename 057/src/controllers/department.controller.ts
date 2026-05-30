import { Request, Response } from 'express';
import * as departmentService from '../services/department.service';
import { ResponseUtil } from '../utils/response';

export const getDepartmentTree = async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === 'true';
  const result = await departmentService.getDepartmentTree(includeInactive);
  return ResponseUtil.success(res, result, '获取部门树形结构成功');
};

export const getDepartmentById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const result = await departmentService.getDepartmentById(id);
  return ResponseUtil.success(res, result, '获取部门详情成功');
};

export const createDepartment = async (req: Request, res: Response) => {
  const result = await departmentService.createDepartment(req.body);
  return ResponseUtil.created(res, result, '创建部门成功');
};

export const updateDepartment = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const result = await departmentService.updateDepartment(id, req.body);
  return ResponseUtil.success(res, result, '更新部门成功');
};

export const deleteDepartment = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await departmentService.deleteDepartment(id);
  return ResponseUtil.success(res, null, '删除部门成功');
};

export const getDepartmentStats = async (req: Request, res: Response) => {
  const result = await departmentService.getDepartmentStats();
  return ResponseUtil.success(res, result, '获取部门统计成功');
};
