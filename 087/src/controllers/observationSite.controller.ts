import { Request, Response, NextFunction } from 'express';
import observationSiteService from '../services/observationSite.service';
import { ResponseUtil } from '../utils/response';

class ObservationSiteController {
  async createSite(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        createdBy: req.user?.userId
      };
      const site = await observationSiteService.createSite(data, req);
      res.json(ResponseUtil.success(site, '创建成功'));
    } catch (error) {
      next(error);
    }
  }

  async updateSite(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const site = await observationSiteService.updateSite(Number(id), req.body, req);
      res.json(ResponseUtil.success(site, '更新成功'));
    } catch (error) {
      next(error);
    }
  }

  async deleteSite(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await observationSiteService.deleteSite(Number(id), req);
      res.json(ResponseUtil.success(null, '删除成功'));
    } catch (error) {
      next(error);
    }
  }

  async getSiteById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const site = await observationSiteService.getSiteById(Number(id));
      res.json(ResponseUtil.success(site));
    } catch (error) {
      next(error);
    }
  }

  async getSiteList(req: Request, res: Response, next: NextFunction) {
    try {
      const params = {
        ...req.query,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined
      };
      const result = await observationSiteService.getSiteList(params);
      res.json(ResponseUtil.success(result));
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const site = await observationSiteService.updateStatus(Number(id), status, req);
      res.json(ResponseUtil.success(site, '状态更新成功'));
    } catch (error) {
      next(error);
    }
  }

  async updateInspectionDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { lastInspectionDate, nextInspectionDate } = req.body;
      const site = await observationSiteService.updateInspectionDate(
        Number(id),
        lastInspectionDate,
        nextInspectionDate,
        req
      );
      res.json(ResponseUtil.success(site, '巡检日期更新成功'));
    } catch (error) {
      next(error);
    }
  }

  async getSitesNeedingInspection(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : 7;
      const sites = await observationSiteService.getSitesNeedingInspection(days);
      res.json(ResponseUtil.success(sites));
    } catch (error) {
      next(error);
    }
  }

  async getOverdueInspectionSites(req: Request, res: Response, next: NextFunction) {
    try {
      const sites = await observationSiteService.getOverdueInspectionSites();
      res.json(ResponseUtil.success(sites));
    } catch (error) {
      next(error);
    }
  }

  async getSiteStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const statistics = await observationSiteService.getSiteStatistics();
      res.json(ResponseUtil.success(statistics));
    } catch (error) {
      next(error);
    }
  }

  async getDistrictList(req: Request, res: Response, next: NextFunction) {
    try {
      const districts = await observationSiteService.getDistrictList();
      res.json(ResponseUtil.success(districts));
    } catch (error) {
      next(error);
    }
  }
}

export default new ObservationSiteController();
