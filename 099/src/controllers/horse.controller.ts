import { Response } from 'express';
import { horseService } from '../services/horse.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { operationLogService } from '../services/operationLog.service';

export const horseController = {
  async createHorse(req: AuthRequest, res: Response) {
    const result = await horseService.createHorse(req.body);
    await operationLogService.logHorseOperation(
      req.user!.id,
      req.user!.username,
      'create',
      result.id,
      result.name
    );
    res.json(ResponseUtil.success(result, '创建成功'));
  },

  async getHorses(req: AuthRequest, res: Response) {
    const params: any = {};
    if (req.query.page) params.page = parseInt(req.query.page as string);
    if (req.query.pageSize) params.pageSize = parseInt(req.query.pageSize as string);
    if (req.query.status) params.status = req.query.status as any;
    if (req.query.stableId) params.stableId = parseInt(req.query.stableId as string);
    if (req.query.trainerId) params.trainerId = parseInt(req.query.trainerId as string);
    if (req.query.breed) params.breed = req.query.breed as string;
    if (req.query.keyword) params.keyword = req.query.keyword as string;
    if (req.query.gender) params.gender = req.query.gender as 'male' | 'female';
    if (req.query.minAge) params.minAge = parseInt(req.query.minAge as string);
    if (req.query.maxAge) params.maxAge = parseInt(req.query.maxAge as string);
    if (req.query.minWeight) params.minWeight = parseFloat(req.query.minWeight as string);
    if (req.query.maxWeight) params.maxWeight = parseFloat(req.query.maxWeight as string);
    if (req.query.trainingLevel) params.trainingLevel = parseInt(req.query.trainingLevel as string);
    if (req.query.sortBy) params.sortBy = req.query.sortBy as string;
    if (req.query.sortOrder) params.sortOrder = req.query.sortOrder as 'ASC' | 'DESC';
    
    const result = await horseService.getHorses(params);
    res.json(ResponseUtil.success(result));
  },

  async getHorse(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await horseService.getHorseById(id);
    res.json(ResponseUtil.success(result));
  },

  async updateHorse(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await horseService.updateHorse(id, req.body);
    await operationLogService.logHorseOperation(
      req.user!.id,
      req.user!.username,
      'update',
      result.id,
      result.name
    );
    res.json(ResponseUtil.success(result, '更新成功'));
  },

  async deleteHorse(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const horse = await horseService.getHorseById(id);
    await horseService.deleteHorse(id);
    await operationLogService.logHorseOperation(
      req.user!.id,
      req.user!.username,
      'delete',
      id,
      horse.name
    );
    res.json(ResponseUtil.success(null, '删除成功'));
  },

  async getVaccinationReminders(req: AuthRequest, res: Response) {
    const days = parseInt(req.query.days as string) || 7;
    const result = await horseService.getVaccinationReminders(days);
    res.json(ResponseUtil.success(result));
  },

  async recordVaccination(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const { vaccinationDate, nextVaccinationDate } = req.body;
    const result = await horseService.recordVaccination(id, new Date(vaccinationDate), nextVaccinationDate ? new Date(nextVaccinationDate) : undefined);
    await operationLogService.logHorseOperation(
      req.user!.id,
      req.user!.username,
      'vaccination',
      id,
      result.name
    );
    res.json(ResponseUtil.success(result, '防疫记录成功'));
  },

  async getHorseStatistics(req: AuthRequest, res: Response) {
    const result = await horseService.getHorseStatistics();
    res.json(ResponseUtil.success(result));
  },

  async createStable(req: AuthRequest, res: Response) {
    const result = await horseService.createStable(req.body);
    res.json(ResponseUtil.success(result, '马舍创建成功'));
  },

  async getStables(req: AuthRequest, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const status = req.query.status as string;
    
    const result = await horseService.getStables(page, pageSize, status);
    res.json(ResponseUtil.success(result));
  },

  async getStable(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await horseService.getStableById(id);
    res.json(ResponseUtil.success(result));
  },

  async updateStable(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await horseService.updateStable(id, req.body);
    res.json(ResponseUtil.success(result, '马舍更新成功'));
  },

  async deleteStable(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    await horseService.deleteStable(id);
    res.json(ResponseUtil.success(null, '马舍删除成功'));
  }
};
