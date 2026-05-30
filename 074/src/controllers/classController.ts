import { Request, Response, NextFunction } from 'express';
import * as classService from '../services/classService';

export const createClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await classService.createClass(req.body);
    res.success(result, '创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await classService.updateClass(Number(id), req.body);
    res.success(result, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await classService.deleteClass(Number(id));
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getClassById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await classService.getClassById(Number(id));
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getAllClasses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await classService.getAllClasses(req.query);
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await classService.updateStatus(Number(id), status);
    res.success(result, '状态更新成功');
  } catch (error) {
    next(error);
  }
};

export const recordAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await classService.recordAttendance(req.body);
    res.success(result, '考勤记录成功');
  } catch (error) {
    next(error);
  }
};

export const getClassAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const result = await classService.getClassAttendance(Number(id), date as string);
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getClassAttendanceStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const result = await classService.getClassAttendanceStats(
      Number(id),
      startDate as string,
      endDate as string
    );
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;
    const { classId } = req.query;
    const result = await classService.getStudentAttendance(
      Number(studentId),
      classId ? Number(classId) : undefined
    );
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await classService.updateAttendance(Number(id), req.body);
    res.success(result, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await classService.deleteAttendance(Number(id));
    res.success(result);
  } catch (error) {
    next(error);
  }
};
