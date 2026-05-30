import { Request, Response, NextFunction } from 'express';
import workerService from '../services/worker.service';
import { ResponseUtil } from '../utils/response';

export class WorkerController {
  static async createWorker(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workerService.createWorker(req.body);
      ResponseUtil.created(res, result, '创建师傅档案成功');
    } catch (error) {
      next(error);
    }
  }

  static async updateWorker(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await workerService.updateWorker(id, req.body);
      ResponseUtil.success(res, result, '更新师傅档案成功');
    } catch (error) {
      next(error);
    }
  }

  static async updateWorkerStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await workerService.updateWorkerStatus(id, status);
      ResponseUtil.success(res, result, '更新师傅状态成功');
    } catch (error) {
      next(error);
    }
  }

  static async getWorkerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await workerService.getWorkerById(id);
      ResponseUtil.success(res, result, '获取师傅信息成功');
    } catch (error) {
      next(error);
    }
  }

  static async getWorkerByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await workerService.getWorkerByUserId(userId);
      ResponseUtil.success(res, result, '获取师傅信息成功');
    } catch (error) {
      next(error);
    }
  }

  static async getWorkerList(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, skill, serviceArea, keyword, page = 1, pageSize = 10 } = req.query;
      const result = await workerService.getWorkerList(
        { 
          status: status as any, 
          skill: skill as string, 
          serviceArea: serviceArea as string, 
          keyword: keyword as string 
        },
        Number(page),
        Number(pageSize)
      );
      ResponseUtil.paginated(res, result, '获取师傅列表成功');
    } catch (error) {
      next(error);
    }
  }

  static async getWorkersForDispatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { skill, serviceArea } = req.query;
      const result = await workerService.getWorkersForDispatch(skill as string, serviceArea as string);
      ResponseUtil.success(res, result, '获取可派单师傅列表成功');
    } catch (error) {
      next(error);
    }
  }

  static async getExpiringCertificates(req: Request, res: Response, next: NextFunction) {
    try {
      const { days = 7 } = req.query;
      const result = await workerService.getExpiringCertificates(Number(days));
      ResponseUtil.success(res, result, '获取即将到期证件列表成功');
    } catch (error) {
      next(error);
    }
  }
}

export default WorkerController;