import { ObservationSite, InspectionWorkOrder } from '../models';
import { SiteStatus, WorkOrderStatus, OperationModule } from '../types';
import { NotFoundException, ConflictException, BadRequestException } from '../exceptions/http.exception';
import { Op, fn, col } from 'sequelize';
import moment from 'moment';
import logger from '../utils/logger';
import operationLogService from './operationLog.service';
import { Request } from 'express';

class ObservationSiteService {
  async createSite(data: {
    siteCode: string;
    name: string;
    address: string;
    district: string;
    longitude: number;
    latitude: number;
    altitude?: number;
    buildDate: Date;
    contactPerson?: string;
    contactPhone?: string;
    remark?: string;
    createdBy?: number;
  }, req?: Request) {
    const existingSite = await ObservationSite.findOne({
      where: { siteCode: data.siteCode }
    });
    if (existingSite) {
      throw new ConflictException('站点编号已存在');
    }

    const site = await ObservationSite.create({
      ...data,
      status: SiteStatus.NORMAL
    });

    if (req) {
      await operationLogService.logCreate(OperationModule.SITE, site.id, site, req);
    }

    logger.info(`站点已创建 - 站点ID: ${site.id}, 站点名称: ${site.name}`);

    return site;
  }

  async updateSite(id: number, data: {
    siteCode?: string;
    name?: string;
    address?: string;
    district?: string;
    longitude?: number;
    latitude?: number;
    altitude?: number;
    buildDate?: Date;
    status?: SiteStatus;
    lastInspectionDate?: Date;
    nextInspectionDate?: Date;
    contactPerson?: string;
    contactPhone?: string;
    remark?: string;
  }, req?: Request) {
    const site = await ObservationSite.findByPk(id);
    if (!site) {
      throw new NotFoundException('站点不存在');
    }

    const beforeData = site.toJSON();

    if (data.siteCode && data.siteCode !== site.siteCode) {
      const existingSite = await ObservationSite.findOne({
        where: { siteCode: data.siteCode, id: { [Op.ne]: id } }
      });
      if (existingSite) {
        throw new ConflictException('站点编号已存在');
      }
    }

    await site.update(data);

    if (req) {
      await operationLogService.logUpdate(OperationModule.SITE, id, beforeData, site, req);
    }

    return site;
  }

  async deleteSite(id: number, req?: Request) {
    const site = await ObservationSite.findByPk(id);
    if (!site) {
      throw new NotFoundException('站点不存在');
    }

    const pendingWorkOrders = await InspectionWorkOrder.count({
      where: {
        siteId: id,
        status: {
          [Op.in]: [
            WorkOrderStatus.PENDING,
            WorkOrderStatus.IN_PROGRESS,
            WorkOrderStatus.FAULT_REPORTED,
            WorkOrderStatus.MAINTENANCE,
            WorkOrderStatus.REINSPECTION
          ]
        }
      }
    });

    if (pendingWorkOrders > 0) {
      throw new BadRequestException(`该站点下存在 ${pendingWorkOrders} 个未完成的巡检工单，无法删除`);
    }

    const beforeData = site.toJSON();
    await site.destroy();

    if (req) {
      await operationLogService.logDelete(OperationModule.SITE, id, beforeData, req);
    }

    logger.info(`站点已删除 - 站点ID: ${id}, 站点名称: ${site.name}`);
    return true;
  }

  async getSiteById(id: number) {
    const site = await ObservationSite.findByPk(id);
    if (!site) {
      throw new NotFoundException('站点不存在');
    }
    return site;
  }

  async getSiteList(params: {
    name?: string;
    siteCode?: string;
    district?: string;
    status?: SiteStatus;
    startBuildDate?: string;
    endBuildDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { name, siteCode, district, status, startBuildDate, endBuildDate, page = 1, pageSize = 10 } = params;
    const where: any = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (siteCode) {
      where.siteCode = { [Op.like]: `%${siteCode}%` };
    }
    if (district) {
      where.district = { [Op.like]: `%${district}%` };
    }
    if (status) {
      where.status = status;
    }
    if (startBuildDate && endBuildDate) {
      where.buildDate = {
        [Op.between]: [new Date(startBuildDate), new Date(endBuildDate)]
      };
    }

    const { count, rows } = await ObservationSite.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async updateStatus(id: number, status: SiteStatus, req?: Request) {
    const site = await ObservationSite.findByPk(id);
    if (!site) {
      throw new NotFoundException('站点不存在');
    }

    const beforeData = site.toJSON();

    if (beforeData.status === status) {
      return site;
    }

    if (status === SiteStatus.NORMAL && beforeData.status === SiteStatus.FAULT) {
      const pendingWorkOrders = await InspectionWorkOrder.count({
        where: {
          siteId: id,
          status: {
            [Op.in]: [
              WorkOrderStatus.FAULT_REPORTED,
              WorkOrderStatus.MAINTENANCE,
              WorkOrderStatus.REINSPECTION
            ]
          }
        }
      });

      if (pendingWorkOrders > 0) {
        throw new BadRequestException(`该站点下存在 ${pendingWorkOrders} 个未闭环的故障工单，无法恢复为正常状态`);
      }
    }

    await site.update({ status });

    if (req) {
      await operationLogService.logUpdate(OperationModule.SITE, id, beforeData, site, req);
    }

    logger.info(`站点状态更新 - 站点ID: ${id}, 原状态: ${beforeData.status}, 新状态: ${status}`);
    return site;
  }

  async updateInspectionDate(id: number, lastInspectionDate: Date, nextInspectionDate?: Date, req?: Request) {
    const site = await ObservationSite.findByPk(id);
    if (!site) {
      throw new NotFoundException('站点不存在');
    }

    const beforeData = site.toJSON();
    const updateData: any = { lastInspectionDate };
    if (nextInspectionDate) {
      updateData.nextInspectionDate = nextInspectionDate;
    }
    
    await site.update(updateData);

    if (req) {
      await operationLogService.logUpdate(OperationModule.SITE, id, beforeData, site, req);
    }

    return site;
  }

  async getSitesNeedingInspection(days: number = 7) {
    const targetDate = moment().add(days, 'days').toDate();
    const now = new Date();

    const sites = await ObservationSite.findAll({
      where: {
        status: SiteStatus.NORMAL,
        nextInspectionDate: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.lte]: targetDate },
            { [Op.gte]: now }
          ]
        }
      },
      order: [['nextInspectionDate', 'ASC']]
    });

    return sites;
  }

  async getOverdueInspectionSites() {
    const now = new Date();

    const sites = await ObservationSite.findAll({
      where: {
        status: SiteStatus.NORMAL,
        nextInspectionDate: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.lt]: now }
          ]
        }
      },
      order: [['nextInspectionDate', 'ASC']]
    });

    return sites;
  }

  async getSiteStatistics() {
    const total = await ObservationSite.count();
    const normal = await ObservationSite.count({ where: { status: SiteStatus.NORMAL } });
    const fault = await ObservationSite.count({ where: { status: SiteStatus.FAULT } });
    const maintenance = await ObservationSite.count({ where: { status: SiteStatus.MAINTENANCE } });

    const districts = await ObservationSite.findAll({
      attributes: ['district', [fn('COUNT', col('id')), 'count']],
      group: ['district']
    });

    return {
      total,
      normal,
      fault,
      maintenance,
      districts
    };
  }

  async getDistrictList() {
    const districts = await ObservationSite.findAll({
      attributes: ['district'],
      group: ['district']
    });

    return districts.map(d => d.district);
  }
}

export default new ObservationSiteService();
