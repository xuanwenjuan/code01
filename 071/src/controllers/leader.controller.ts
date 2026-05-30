import { Request, Response, NextFunction } from 'express';
import leaderService from '../services/leader.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { LeaderStatus } from '../models/Leader.model';
import { LeaderListQuery } from '../types';

class LeaderController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const leader = await leaderService.createLeader(req.body);
      return ResponseUtil.success(res, leader, '申请成功，请等待审核');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const leader = await leaderService.updateLeader(Number(id), req.body);
      return ResponseUtil.success(res, leader, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const leader = await leaderService.getLeaderById(Number(id));
      return ResponseUtil.success(res, leader);
    } catch (error) {
      next(error);
    }
  }

  async getByUserId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const leader = await leaderService.getLeaderByUserId(Number(userId));
      return ResponseUtil.success(res, leader);
    } catch (error) {
      next(error);
    }
  }

  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        page, 
        pageSize, 
        status, 
        province, 
        city, 
        district,
        keyword,
        minCommissionRate,
        maxCommissionRate
      } = req.query as LeaderListQuery;
      
      const result = await leaderService.getLeaderList({
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        status: status as LeaderStatus | undefined,
        province: province as string | undefined,
        city: city as string | undefined,
        district: district as string | undefined,
        keyword: keyword as string | undefined,
        minCommissionRate: minCommissionRate ? Number(minCommissionRate) : undefined,
        maxCommissionRate: maxCommissionRate ? Number(maxCommissionRate) : undefined
      });
      return ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async audit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, auditRemark } = req.body;
      const leader = await leaderService.auditLeader(Number(id), status, auditRemark);
      return ResponseUtil.success(res, leader, '审核成功');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const leader = await leaderService.updateStatus(Number(id), status);
      return ResponseUtil.success(res, leader, '状态更新成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new LeaderController();
