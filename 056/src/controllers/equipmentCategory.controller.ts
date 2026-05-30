import { Request, Response } from 'express';
import equipmentCategoryService from '../services/equipmentCategory.service';
import ResponseUtil from '../utils/response';

export class EquipmentCategoryController {
  async create(req: Request, res: Response) {
    const category = await equipmentCategoryService.create(req.body);
    ResponseUtil.success(res, category, '创建成功');
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const category = await equipmentCategoryService.update(parseInt(id), req.body);
    ResponseUtil.success(res, category, '更新成功');
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await equipmentCategoryService.delete(parseInt(id));
    ResponseUtil.success(res, null, '删除成功');
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const category = await equipmentCategoryService.findById(parseInt(id));
    ResponseUtil.success(res, category, '查询成功');
  }

  async findAll(req: Request, res: Response) {
    const { name, isActive, page, pageSize } = req.query;
    const result = await equipmentCategoryService.findAll({
      name: name as string,
      isActive: isActive === 'true',
      page: parseInt(page as string) || 1,
      pageSize: parseInt(pageSize as string) || 10,
    });
    ResponseUtil.paginated(res, result.list, result.total, result.page, result.pageSize);
  }

  async getTree(req: Request, res: Response) {
    const tree = await equipmentCategoryService.getTree();
    ResponseUtil.success(res, tree, '查询成功');
  }
}

export default new EquipmentCategoryController();
