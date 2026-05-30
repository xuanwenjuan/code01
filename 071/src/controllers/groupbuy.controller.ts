import { Request, Response, NextFunction } from 'express';
import groupBuyService from '../services/groupbuy.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { GroupBuyStatus } from '../models/GroupBuy.model';

class GroupBuyController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const groupBuy = await groupBuyService.createGroupBuy(req.body);
      return ResponseUtil.success(res, groupBuy, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const groupBuy = await groupBuyService.updateGroupBuy(Number(id), req.body);
      return ResponseUtil.success(res, groupBuy, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await groupBuyService.deleteGroupBuy(Number(id));
      return ResponseUtil.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const groupBuy = await groupBuyService.getGroupBuyById(Number(id));
      return ResponseUtil.success(res, groupBuy);
    } catch (error) {
      next(error);
    }
  }

  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize, status, leaderId, productId } = req.query;
      const result = await groupBuyService.getGroupBuyList({
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        status: status as GroupBuyStatus | undefined,
        leaderId: leaderId ? Number(leaderId) : undefined,
        productId: productId ? Number(productId) : undefined
      });
      return ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const groupBuy = await groupBuyService.startGroupBuy(Number(id));
      return ResponseUtil.success(res, groupBuy, '拼团已开始');
    } catch (error) {
      next(error);
    }
  }

  async lock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const groupBuy = await groupBuyService.lockGroupBuy(Number(id));
      return ResponseUtil.success(res, groupBuy, '拼团已锁单');
    } catch (error) {
      next(error);
    }
  }

  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const groupBuy = await groupBuyService.completeGroupBuy(Number(id));
      return ResponseUtil.success(res, groupBuy, '拼团已完成');
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const groupBuy = await groupBuyService.cancelGroupBuy(Number(id));
      return ResponseUtil.success(res, groupBuy, '拼团已取消');
    } catch (error) {
      next(error);
    }
  }

  async triggerProcessExpired(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await groupBuyService.processExpiredGroupBuys();
      await groupBuyService.processPendingStart();
      return ResponseUtil.success(res, null, '处理成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new GroupBuyController();
