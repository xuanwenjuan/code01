import { Request, Response } from 'express';
import userService from '../services/user.service';
import ResponseUtil from '../utils/response';
import { UserRole } from '../types';

export class UserController {
  async create(req: Request, res: Response) {
    const user = await userService.create(req.body);
    ResponseUtil.success(res, user, '创建成功');
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const user = await userService.update(parseInt(id), req.body);
    ResponseUtil.success(res, user, '更新成功');
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await userService.delete(parseInt(id));
    ResponseUtil.success(res, null, '删除成功');
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const user = await userService.findById(parseInt(id));
    ResponseUtil.success(res, user, '查询成功');
  }

  async findAll(req: Request, res: Response) {
    const { username, realName, role, departmentId, isActive, page, pageSize } = req.query;
    const result = await userService.findAll({
      username: username as string,
      realName: realName as string,
      role: role as UserRole,
      departmentId: departmentId ? parseInt(departmentId as string) : undefined,
      isActive: isActive === 'true',
      page: parseInt(page as string) || 1,
      pageSize: parseInt(pageSize as string) || 10,
    });
    ResponseUtil.paginated(res, result.list, result.total, result.page, result.pageSize);
  }

  async resetPassword(req: Request, res: Response) {
    const { id } = req.params;
    const { newPassword } = req.body;
    await userService.resetPassword(parseInt(id), newPassword);
    ResponseUtil.success(res, null, '密码重置成功');
  }
}

export default new UserController();
