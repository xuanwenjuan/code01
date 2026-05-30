import { Response } from 'express';
import { partService } from '../services/part.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export class PartController {
  async create(req: AuthRequest, res: Response) {
    const part = await partService.createPart(req.body);
    return ResponseUtil.success(res, part);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const part = await partService.updatePart(Number(id), req.body);
    return ResponseUtil.success(res, part);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    await partService.deletePart(Number(id));
    return ResponseUtil.success(res, null, '删除成功');
  }

  async get(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const part = await partService.getPart(Number(id));
    return ResponseUtil.success(res, part);
  }

  async getList(req: AuthRequest, res: Response) {
    const { page, pageSize, code, name, categoryId, supplierId, lowStock } = req.query;
    const result = await partService.getPartList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      code: code as string,
      name: name as string,
      categoryId: categoryId ? Number(categoryId) : undefined,
      supplierId: supplierId ? Number(supplierId) : undefined,
      lowStock: lowStock === 'true',
    });
    return ResponseUtil.success(res, result);
  }
}

export const partController = new PartController();
