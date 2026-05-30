import { Request, Response } from 'express';
import equipmentService from '../services/equipment.service';
import ResponseUtil from '../utils/response';
import { EquipmentStatus } from '../types';

export class EquipmentController {
  async create(req: Request, res: Response) {
    const equipment = await equipmentService.create(req.body);
    ResponseUtil.success(res, equipment, '创建成功');
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const equipment = await equipmentService.update(parseInt(id), req.body);
    ResponseUtil.success(res, equipment, '更新成功');
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await equipmentService.delete(parseInt(id));
    ResponseUtil.success(res, null, '删除成功');
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const equipment = await equipmentService.findById(parseInt(id));
    ResponseUtil.success(res, equipment, '查询成功');
  }

  async findAll(req: Request, res: Response) {
    const { name, code, categoryId, departmentId, status, page, pageSize } = req.query;
    const result = await equipmentService.findAll({
      name: name as string,
      code: code as string,
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      departmentId: departmentId ? parseInt(departmentId as string) : undefined,
      status: status as EquipmentStatus,
      page: parseInt(page as string) || 1,
      pageSize: parseInt(pageSize as string) || 10,
    });
    ResponseUtil.paginated(res, result.list, result.total, result.page, result.pageSize);
  }

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const equipment = await equipmentService.updateStatus(parseInt(id), status);
    ResponseUtil.success(res, equipment, '状态更新成功');
  }

  async getStatistics(req: Request, res: Response) {
    const statistics = await equipmentService.getStatistics();
    ResponseUtil.success(res, statistics, '查询成功');
  }
}

export default new EquipmentController();
