import { Request, Response } from 'express';
import * as attendanceService from '../services/attendance.service';
import { ResponseUtil } from '../utils/response';

export const clockIn = async (req: Request, res: Response) => {
  const employeeId = req.user!.employeeId;
  if (!employeeId) {
    return ResponseUtil.badRequest(res, '用户未关联员工');
  }
  const result = await attendanceService.clockIn(employeeId, req.body);
  return ResponseUtil.success(res, result, '签到成功');
};

export const clockOut = async (req: Request, res: Response) => {
  const employeeId = req.user!.employeeId;
  if (!employeeId) {
    return ResponseUtil.badRequest(res, '用户未关联员工');
  }
  const result = await attendanceService.clockOut(employeeId, req.body);
  return ResponseUtil.success(res, result, '签退成功');
};

export const getTodayAttendance = async (req: Request, res: Response) => {
  const employeeId = req.user!.employeeId;
  if (!employeeId) {
    return ResponseUtil.badRequest(res, '用户未关联员工');
  }
  const result = await attendanceService.getTodayAttendance(employeeId);
  return ResponseUtil.success(res, result, '获取今日考勤成功');
};

export const getAttendanceRecords = async (req: Request, res: Response) => {
  const params = {
    employeeId: req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined,
    departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    status: req.query.status as string | undefined,
    page: parseInt(req.query.page as string) || 1,
    pageSize: parseInt(req.query.pageSize as string) || 10,
  };
  const result = await attendanceService.getAttendanceRecords(params);
  return ResponseUtil.success(res, result, '获取考勤记录成功');
};

export const getAttendanceStats = async (req: Request, res: Response) => {
  const employeeId = req.user!.employeeId;
  if (!employeeId) {
    return ResponseUtil.badRequest(res, '用户未关联员工');
  }
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const result = await attendanceService.getAttendanceStats(employeeId, year, month);
  return ResponseUtil.success(res, result, '获取考勤统计成功');
};

export const getMonthlyAttendanceReport = async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
  const result = await attendanceService.getMonthlyAttendanceReport(year, month, departmentId);
  return ResponseUtil.success(res, result, '获取月度考勤报表成功');
};

export const createLeaveRequest = async (req: Request, res: Response) => {
  const employeeId = req.user!.employeeId;
  if (!employeeId) {
    return ResponseUtil.badRequest(res, '用户未关联员工');
  }
  const result = await attendanceService.createLeaveRequest(employeeId, req.body);
  return ResponseUtil.created(res, result, '请假申请提交成功');
};

export const getLeaveRequests = async (req: Request, res: Response) => {
  const params = {
    employeeId: req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined,
    status: req.query.status as string | undefined,
    type: req.query.type as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    page: parseInt(req.query.page as string) || 1,
    pageSize: parseInt(req.query.pageSize as string) || 10,
  };
  const result = await attendanceService.getLeaveRequests(params);
  return ResponseUtil.success(res, result, '获取请假申请成功');
};

export const getLeaveRequestById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const result = await attendanceService.getLeaveRequestById(id);
  return ResponseUtil.success(res, result, '获取请假申请详情成功');
};

export const approveLeaveRequest = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const approverId = req.user!.userId;
  const { approved, approvalRemark } = req.body;
  const result = await attendanceService.approveLeaveRequest(id, approverId, approved, approvalRemark);
  return ResponseUtil.success(res, result, approved ? '审批通过' : '审批拒绝');
};

export const cancelLeaveRequest = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const employeeId = req.user!.employeeId;
  if (!employeeId) {
    return ResponseUtil.badRequest(res, '用户未关联员工');
  }
  const result = await attendanceService.cancelLeaveRequest(id, employeeId);
  return ResponseUtil.success(res, result, '请假申请已取消');
};

export const createMakeupCardRequest = async (req: Request, res: Response) => {
  const employeeId = req.user!.employeeId;
  if (!employeeId) {
    return ResponseUtil.badRequest(res, '用户未关联员工');
  }
  const result = await attendanceService.createMakeupCardRequest(employeeId, req.body);
  return ResponseUtil.created(res, result, '补卡申请提交成功');
};

export const getMakeupCardRequests = async (req: Request, res: Response) => {
  const params = {
    employeeId: req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined,
    status: req.query.status as string | undefined,
    page: parseInt(req.query.page as string) || 1,
    pageSize: parseInt(req.query.pageSize as string) || 10,
  };
  const result = await attendanceService.getMakeupCardRequests(params);
  return ResponseUtil.success(res, result, '获取补卡申请成功');
};

export const getMakeupCardRequestById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const result = await attendanceService.getMakeupCardRequestById(id);
  return ResponseUtil.success(res, result, '获取补卡申请详情成功');
};

export const approveMakeupCardRequest = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const approverId = req.user!.userId;
  const { approved, approvalRemark } = req.body;
  const result = await attendanceService.approveMakeupCardRequest(id, approverId, approved, approvalRemark);
  return ResponseUtil.success(res, result, approved ? '补卡审批通过' : '补卡审批拒绝');
};
