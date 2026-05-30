import { Response, NextFunction } from 'express';
import branchService from '../services/branchService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { BranchType, BranchStatus } from '../models/Branch';

class BranchController {
  async createBranch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const branch = await branchService.createBranch(req.body);
      ResponseUtil.success(res, branch, '网点创建成功');
    } catch (error) {
      next(error);
    }
  }

  async updateBranch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const branch = await branchService.updateBranch(Number(id), req.body);
      ResponseUtil.success(res, branch, '网点更新成功');
    } catch (error) {
      next(error);
    }
  }

  async deleteBranch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await branchService.deleteBranch(Number(id));
      ResponseUtil.success(res, null, '网点删除成功');
    } catch (error) {
      next(error);
    }
  }

  async getBranchById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const branch = await branchService.getBranchById(Number(id));
      ResponseUtil.success(res, branch);
    } catch (error) {
      next(error);
    }
  }

  async getBranchList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, status, keyword, page, pageSize, includeChildren } = req.query;
      const result = await branchService.getBranchList({
        type: type as BranchType,
        status: status as BranchStatus,
        keyword: keyword as string,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        includeChildren: includeChildren === 'true'
      });
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getBranchTree(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, status, parentId, keyword, includeInactive } = req.query;
      const tree = await branchService.getBranchTree({
        type: type as BranchType,
        status: status as BranchStatus,
        parentId: parentId ? Number(parentId) : undefined,
        keyword: keyword as string,
        includeInactive: includeInactive === 'true'
      });
      ResponseUtil.success(res, tree);
    } catch (error) {
      next(error);
    }
  }

  async updateBranchStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, remark } = req.body;
      const branch = await branchService.updateBranchStatus(
        Number(id),
        status,
        req.user?.id,
        remark
      );
      ResponseUtil.success(res, branch, '状态更新成功');
    } catch (error) {
      next(error);
    }
  }

  async bindParentBranch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { parentId } = req.body;
      const branch = await branchService.bindParentBranch(Number(id), parentId);
      ResponseUtil.success(res, branch, '绑定上级网点成功');
    } catch (error) {
      next(error);
    }
  }

  async getBranchStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await branchService.getBranchStats(Number(id));
      ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new BranchController();
