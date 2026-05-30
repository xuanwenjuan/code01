import { Request, Response, NextFunction } from 'express';
import * as studentService from '../services/studentService';

export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await studentService.createStudent(req.body);
    res.success(result, '创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await studentService.updateStudent(Number(id), req.body);
    res.success(result, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await studentService.deleteStudent(Number(id));
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await studentService.getStudentById(Number(id));
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await studentService.getAllStudents(req.query);
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await studentService.updateStatus(Number(id), status);
    res.success(result, '状态更新成功');
  } catch (error) {
    next(error);
  }
};

export const enrollStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await studentService.enrollStudent(req.body);
    res.success(result, '报名成功');
  } catch (error) {
    next(error);
  }
};

export const approveEnrollment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await studentService.approveEnrollment(Number(id), req.body);
    res.success(result, '审批通过');
  } catch (error) {
    next(error);
  }
};

export const rejectEnrollment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await studentService.rejectEnrollment(Number(id), reason);
    res.success(result, '已驳回');
  } catch (error) {
    next(error);
  }
};

export const updatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { paidAmount } = req.body;
    const result = await studentService.updatePayment(Number(id), paidAmount);
    res.success(result, '缴费记录更新成功');
  } catch (error) {
    next(error);
  }
};

export const convertTrialToFormal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await studentService.convertTrialToFormal(Number(id));
    res.success(result, '试听转正式成功');
  } catch (error) {
    next(error);
  }
};

export const suspendStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    const result = await studentService.suspendStudent(Number(id), remark);
    res.success(result, '休学成功');
  } catch (error) {
    next(error);
  }
};
