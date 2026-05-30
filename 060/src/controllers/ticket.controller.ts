import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';
import { ticketService } from '../services/ticket.service';

export class TicketController {
  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketCode } = req.body;
      const result = await ticketService.verify(
        ticketCode,
        req.user!.id,
        req.user!.username
      );
      return ApiResponse.success(res, result, '核销成功');
    } catch (error) {
      next(error);
    }
  }

  async batchVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketCodes } = req.body;
      if (!Array.isArray(ticketCodes) || ticketCodes.length === 0) {
        return ApiResponse.badRequest(res, '票券码列表不能为空');
      }
      const result = await ticketService.batchVerify(
        ticketCodes,
        req.user!.id,
        req.user!.username
      );
      return ApiResponse.success(res, result, `成功核销 ${result.success} 张票券`);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ticketService.getById(Number(id));
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const result = await ticketService.getByCode(code);
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ticketService.getList(req.query);
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getVerifyRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ticketService.getVerifyRecords(req.query);
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ticketService.getStatistics(req.query);
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }
}

export const ticketController = new TicketController();
