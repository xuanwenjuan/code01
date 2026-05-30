import { Request, Response } from 'express';
import CollectionService from '../services/CollectionService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { CollectionStatus, ConditionGrade } from '../models/Collection';

class CollectionController {
  async createCollection(req: AuthRequest, res: Response) {
    const collection = await CollectionService.createCollection({
      ...req.body,
      createdBy: req.user!.id
    });
    return ResponseUtil.created(res, collection, '藏品创建成功');
  }

  async updateCollection(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const collection = await CollectionService.updateCollection(Number(id), req.body);
    return ResponseUtil.success(res, collection, '藏品更新成功');
  }

  async deleteCollection(req: AuthRequest, res: Response) {
    const { id } = req.params;
    await CollectionService.deleteCollection(Number(id));
    return ResponseUtil.success(res, null, '藏品删除成功');
  }

  async getCollectionById(req: Request, res: Response) {
    const { id } = req.params;
    const collection = await CollectionService.getCollectionById(Number(id));
    return ResponseUtil.success(res, collection);
  }

  async getCollectionList(req: Request, res: Response) {
    const { page, pageSize, collectionNo, name, categoryId, status, conditionGrade, brand, startDate, endDate } = req.query;
    const result = await CollectionService.getCollectionList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      collectionNo: collectionNo as string,
      name: name as string,
      categoryId: categoryId ? Number(categoryId) : undefined,
      status: status as CollectionStatus,
      conditionGrade: conditionGrade as ConditionGrade,
      brand: brand as string,
      startDate: startDate as string,
      endDate: endDate as string
    });
    return ResponseUtil.paginated(res, result);
  }

  async updateCollectionStatus(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const collection = await CollectionService.updateCollectionStatus(Number(id), status);
    return ResponseUtil.success(res, collection, '状态更新成功');
  }

  async batchUpdateStatus(req: AuthRequest, res: Response) {
    const { ids, status } = req.body;
    const result = await CollectionService.batchUpdateStatus(ids, status);
    return ResponseUtil.success(res, result, `批量更新成功，共更新${result.updatedCount}条`);
  }

  async batchDelete(req: AuthRequest, res: Response) {
    const { ids } = req.body;
    const result = await CollectionService.batchDelete(ids);
    return ResponseUtil.success(res, result, `批量删除成功，共删除${result.deletedCount}条`);
  }

  async getMaintenanceReminders(req: Request, res: Response) {
    const reminders = await CollectionService.getMaintenanceReminders();
    return ResponseUtil.success(res, reminders);
  }

  async getStatistics(req: Request, res: Response) {
    const statistics = await CollectionService.getStatistics();
    return ResponseUtil.success(res, statistics);
  }

  async triggerMaintenance(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const collection = await CollectionService.triggerMaintenance(Number(id));
    return ResponseUtil.success(res, collection, '保养成功，已更新下次保养时间');
  }
}

export default new CollectionController();