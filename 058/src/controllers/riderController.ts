import { Request, Response } from 'express';
import { RiderService } from '../services/riderService';
import { Result } from '../utils/response';
import { RiderStatus } from '../types';

export const applyRider = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { realName, idCard, phone, vehicleType, idCardFront, idCardBack, vehicleNumber, deliveryArea } = req.body;
  const rider = await RiderService.applyRider(
    userId, realName, idCard, phone, vehicleType, idCardFront, idCardBack, vehicleNumber, deliveryArea
  );
  return Result.sendSuccess(res, rider, '骑手申请提交成功');
};

export const auditRider = async (req: Request, res: Response) => {
  const auditorId = req.user!.id;
  const { riderId, status, remark } = req.body;
  const rider = await RiderService.auditRider(riderId, auditorId, status as RiderStatus.APPROVED | RiderStatus.REJECTED, remark);
  return Result.sendSuccess(res, rider, '审核成功');
};

export const updateRiderStatus = async (req: Request, res: Response) => {
  const { riderId, status } = req.body;
  const operatorId = req.user!.id;
  const rider = await RiderService.updateRiderStatus(riderId, status as RiderStatus, operatorId);
  return Result.sendSuccess(res, rider, '状态更新成功');
};

export const updateDeliveryArea = async (req: Request, res: Response) => {
  const { riderId, deliveryArea } = req.body;
  const rider = await RiderService.updateDeliveryArea(riderId, deliveryArea);
  return Result.sendSuccess(res, rider, '配送范围更新成功');
};

export const getRiderList = async (req: Request, res: Response) => {
  const { page, pageSize, status, keyword } = req.query;
  const result = await RiderService.getRiderList(
    Number(page),
    Number(pageSize),
    status as RiderStatus,
    keyword as string
  );
  return Result.sendSuccess(res, result, '获取成功');
};

export const getRiderById = async (req: Request, res: Response) => {
  const { riderId } = req.params;
  const rider = await RiderService.getRiderById(Number(riderId));
  return Result.sendSuccess(res, rider, '获取成功');
};

export const getMyRiderInfo = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const rider = await RiderService.getRiderByUserId(userId);
  return Result.sendSuccess(res, rider, '获取成功');
};

export const updateRiderInfo = async (req: Request, res: Response) => {
  const { riderId, phone, vehicleType, vehicleNumber, deliveryArea } = req.body;
  const rider = await RiderService.updateRiderInfo(riderId, {
    phone, vehicleType, vehicleNumber, deliveryArea
  });
  return Result.sendSuccess(res, rider, '信息更新成功');
};

export const updateReceiveOrderPermission = async (req: Request, res: Response) => {
  const { riderId, canReceiveOrder } = req.body;
  const operatorId = req.user!.id;
  const rider = await RiderService.updateReceiveOrderPermission(riderId, canReceiveOrder, operatorId);
  return Result.sendSuccess(res, rider, '接单权限更新成功');
};

export const getRiderBalance = async (req: Request, res: Response) => {
  const { riderId } = req.params;
  const balance = await RiderService.getRiderBalance(Number(riderId));
  return Result.sendSuccess(res, balance, '获取成功');
};

export const getAvailableRiders = async (req: Request, res: Response) => {
  const { deliveryArea } = req.query;
  const riders = await RiderService.getAvailableRiders(deliveryArea as string);
  return Result.sendSuccess(res, riders, '获取成功');
};
