import { Request, Response } from 'express';
import inspectionPlanService from '../services/inspectionPlan.service';
import ResponseUtil from '../utils/response';

export class InspectionPlanController {
  async create(req: Request, res: Response) {
    const data = {
      ...req.body,
      createdBy: req.user!.userId,
    };
    const plan = await inspectionPlanService.create(data);
    ResponseUtil.success(res, plan, '创建成功');
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const plan = await inspectionPlanService.update(parseInt(id), req.body);
    ResponseUtil.success(res, plan, '更新成功');
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await inspectionPlanService.delete(parseInt(id));
    ResponseUtil.success(res, null, '删除成功');
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const plan = await inspectionPlanService.findById(parseInt(id));
    ResponseUtil.success(res, plan, '查询成功');
  }

  async findAll(req: Request, res: Response) {
    const { name, code, equipmentId, inspectorId, frequencyType, isActive, page, pageSize } = req.query;
    const result = await inspectionPlanService.findAll({
      name: name as string,
      code: code as string,
      equipmentId: equipmentId ? parseInt(equipmentId as string) : undefined,
      inspectorId: inspectorId ? parseInt(inspectorId as string) : undefined,
      frequencyType: frequencyType as string,
      isActive: isActive === 'true',
      page: parseInt(page as string) || 1,
      pageSize: parseInt(pageSize as string) || 10,
    });
    ResponseUtil.paginated(res, result.list, result.total, result.page, result.pageSize);
  }

  async toggleActive(req: Request, res: Response) {
    const { id } = req.params;
    const plan = await inspectionPlanService.toggleActive(parseInt(id));
    ResponseUtil.success(res, plan, '状态更新成功');
  }
}

export default new InspectionPlanController();
