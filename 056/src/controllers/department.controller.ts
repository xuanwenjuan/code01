import { Request, Response } from 'express';
import departmentService from '../services/department.service';
import ResponseUtil from '../utils/response';

export class DepartmentController {
  async create(req: Request, res: Response) {
    const department = await departmentService.create(req.body);
    ResponseUtil.success(res, department, '创建成功');
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const department = await departmentService.update(parseInt(id), req.body);
    ResponseUtil.success(res, department, '更新成功');
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await departmentService.delete(parseInt(id));
    ResponseUtil.success(res, null, '删除成功');
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const department = await departmentService.findById(parseInt(id));
    ResponseUtil.success(res, department, '查询成功');
  }

  async findAll(req: Request, res: Response) {
    const { name, isActive, page, pageSize } = req.query;
    const result = await departmentService.findAll({
      name: name as string,
      isActive: isActive === 'true',
      page: parseInt(page as string) || 1,
      pageSize: parseInt(pageSize as string) || 10,
    });
    ResponseUtil.paginated(res, result.list, result.total, result.page, result.pageSize);
  }

  async getTree(req: Request, res: Response) {
    const tree = await departmentService.getTree();
    ResponseUtil.success(res, tree, '查询成功');
  }
}

export default new DepartmentController();
