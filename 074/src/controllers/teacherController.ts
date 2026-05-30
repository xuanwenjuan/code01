import { Request, Response, NextFunction } from 'express';
import * as teacherService from '../services/teacherService';

export const createTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await teacherService.createTeacher(req.body);
    res.success(result, '创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await teacherService.updateTeacher(Number(id), req.body);
    res.success(result, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await teacherService.deleteTeacher(Number(id));
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getTeacherById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await teacherService.getTeacherById(Number(id));
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getAllTeachers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await teacherService.getAllTeachers(req.query);
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await teacherService.updateStatus(Number(id), status);
    res.success(result, '状态更新成功');
  } catch (error) {
    next(error);
  }
};

export const getExpiringQualifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { days = 30 } = req.query;
    const result = await teacherService.getTeachersWithExpiringQualifications(Number(days));
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const rateTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const result = await teacherService.rateTeacher(Number(id), rating);
    res.success(result, '评分成功');
  } catch (error) {
    next(error);
  }
};

export const getAvailableTeachers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await teacherService.getAvailableTeachers(req.query);
    res.success(result);
  } catch (error) {
    next(error);
  }
};
