import { ForageApplication, ApplicationItem, ForageCategory, ForageInventory, Stable, User, CostRecord } from '../models';
import { BusinessException } from '../utils/response';
import { logger } from '../utils/logger';
import { ApplicationStatus } from '../constants';
import { Op, fn, col, literal } from 'sequelize';
import dayjs from 'dayjs';

export interface ApplicationItemDto {
  categoryId: number;
  requestedQuantity: number;
  notes?: string;
}

export interface CreateApplicationDto {
  stableId: number;
  trainerId: number;
  feedingTime?: Date;
  items: ApplicationItemDto[];
  notes?: string;
}

export interface ApproveApplicationDto {
  approvedBy: number;
  items: {
    id: number;
    approvedQuantity: number;
  }[];
}

export interface DeliverApplicationDto {
  deliveredBy: number;
  items: {
    id: number;
    actualQuantity: number;
  }[];
}

export interface ReturnItemDto {
  id: number;
  returnedQuantity: number;
}

export interface DamageItemDto {
  id: number;
  damagedQuantity: number;
}

export interface ApplicationStatisticsDto {
  startDate?: Date;
  endDate?: Date;
  stableId?: number;
}

class ForageApplicationService {
  async createApplication(createDto: CreateApplicationDto) {
    const stable = await Stable.findByPk(createDto.stableId);
    if (!stable) {
      throw new BusinessException('马舍不存在', 400);
    }

    const trainer = await User.findByPk(createDto.trainerId);
    if (!trainer) {
      throw new BusinessException('驯养员不存在', 400);
    }

    for (const item of createDto.items) {
      const category = await ForageCategory.findByPk(item.categoryId);
      if (!category) {
        throw new BusinessException(`饲草料类目 ${item.categoryId} 不存在`, 400);
      }

      if (category.status === 'obsolete' || category.status === 'inactive') {
        throw new BusinessException(`饲草料类目 ${category.name} 已停用或淘汰`, 400);
      }

      const inventory = await ForageInventory.findOne({ where: { categoryId: item.categoryId } });
      if (!inventory || (inventory.quantity as any) < item.requestedQuantity) {
        throw new BusinessException(`饲草料 ${category.name} 库存不足`, 400);
      }
    }

    const applicationNo = `FA${dayjs().format('YYYYMMDDHHmmss')}${Math.floor(Math.random() * 1000)}`;
    
    const expireAt = dayjs().add(24, 'hour').toDate();

    const t = await ForageApplication.sequelize!.transaction();
    
    try {
      const application = await ForageApplication.create({
        applicationNo,
        stableId: createDto.stableId,
        trainerId: createDto.trainerId,
        status: ApplicationStatus.PENDING,
        feedingTime: createDto.feedingTime,
        expireAt,
        notes: createDto.notes
      }, { transaction: t });

      for (const item of createDto.items) {
        await ApplicationItem.create({
          applicationId: application.id,
          categoryId: item.categoryId,
          requestedQuantity: item.requestedQuantity,
          notes: item.notes
        }, { transaction: t });
      }

      await t.commit();
      return this.getApplicationById(application.id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getApplications(
    page: number = 1,
    pageSize: number = 10,
    status?: ApplicationStatus,
    stableId?: number,
    trainerId?: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: any = {};
    if (status) where.status = status;
    if (stableId) where.stableId = stableId;
    if (trainerId) where.trainerId = trainerId;
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows } = await ForageApplication.findAndCountAll({
      where,
      include: [
        { model: Stable, as: 'stable' },
        { model: User, as: 'trainer', attributes: ['id', 'realName', 'username'] },
        { model: User, as: 'approver', attributes: ['id', 'realName', 'username'] },
        { model: User, as: 'deliverer', attributes: ['id', 'realName', 'username'] }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  }

  async getApplicationById(id: number) {
    const application = await ForageApplication.findByPk(id, {
      include: [
        { model: Stable, as: 'stable' },
        { model: User, as: 'trainer' },
        { model: User, as: 'approver' },
        { model: User, as: 'deliverer' },
        {
          model: ApplicationItem,
          as: 'items',
          include: [{ model: ForageCategory, as: 'category' }]
        }
      ]
    });
    
    if (!application) {
      throw new BusinessException('申领单不存在', 404);
    }

    return application;
  }

  async approveApplication(id: number, approveDto: ApproveApplicationDto) {
    const application = await ForageApplication.findByPk(id);
    if (!application) {
      throw new BusinessException('申领单不存在', 404);
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BusinessException('只有待审核的申领单才能审批', 400);
    }

    const t = await ForageApplication.sequelize!.transaction();
    
    try {
      let totalAmount = 0;
      
      for (const item of approveDto.items) {
        const applicationItem = await ApplicationItem.findOne({
          where: { id: item.id, applicationId: id },
          transaction: t
        });
        
        if (!applicationItem) {
          throw new BusinessException(`申领明细 ${item.id} 不存在`, 400);
        }

        const inventory = await ForageInventory.findOne({
          where: { categoryId: applicationItem.categoryId },
          transaction: t
        });

        if (!inventory) {
          throw new BusinessException(`物料库存不存在`, 400);
        }

        const availableQuantity = (inventory.quantity as number) - ((inventory.reservedQuantity as number) || 0);
        if (availableQuantity < item.approvedQuantity) {
          throw new BusinessException(`物料库存不足，可用: ${availableQuantity}`, 400);
        }

        await inventory.update({
          reservedQuantity: ((inventory.reservedQuantity as number) || 0) + item.approvedQuantity
        }, { transaction: t });

        await applicationItem.update({
          approvedQuantity: item.approvedQuantity
        }, { transaction: t });

        totalAmount += item.approvedQuantity;
      }

      await application.update({
        status: ApplicationStatus.APPROVED,
        approvedBy: approveDto.approvedBy,
        approvedAt: new Date(),
        totalAmount
      }, { transaction: t });

      await t.commit();
      return this.getApplicationById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async deliverApplication(id: number, deliverDto: DeliverApplicationDto) {
    const application = await ForageApplication.findByPk(id);
    if (!application) {
      throw new BusinessException('申领单不存在', 404);
    }

    if (application.status !== ApplicationStatus.APPROVED) {
      throw new BusinessException('只有已审批的申领单才能出库', 400);
    }

    const t = await ForageApplication.sequelize!.transaction();
    
    try {
      for (const item of deliverDto.items) {
        const applicationItem = await ApplicationItem.findOne({
          where: { id: item.id, applicationId: id },
          transaction: t
        });
        
        if (!applicationItem) {
          throw new BusinessException(`申领明细 ${item.id} 不存在`, 400);
        }

        const inventory = await ForageInventory.findOne({
          where: { categoryId: applicationItem.categoryId },
          transaction: t
        });

        if (!inventory || (inventory.quantity as any) < item.actualQuantity) {
          throw new BusinessException('库存不足', 400);
        }

        await inventory.update({
          quantity: (inventory.quantity as any) - item.actualQuantity,
          reservedQuantity: ((inventory.reservedQuantity as any) || 0) - item.actualQuantity
        }, { transaction: t });

        await applicationItem.update({
          actualQuantity: item.actualQuantity
        }, { transaction: t });
      }

      await application.update({
        status: ApplicationStatus.DELIVERED,
        deliveredBy: deliverDto.deliveredBy,
        deliveredAt: new Date()
      }, { transaction: t });

      await t.commit();
      return this.getApplicationById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async returnItems(id: number, items: ReturnItemDto[]) {
    const application = await ForageApplication.findByPk(id);
    if (!application) {
      throw new BusinessException('申领单不存在', 404);
    }

    if (application.status !== ApplicationStatus.DELIVERED) {
      throw new BusinessException('只有已出库的申领单才能退料', 400);
    }

    const t = await ForageApplication.sequelize!.transaction();
    
    try {
      let totalReturned = 0;

      for (const item of items) {
        const applicationItem = await ApplicationItem.findOne({
          where: { id: item.id, applicationId: id },
          transaction: t
        });
        
        if (!applicationItem) {
          throw new BusinessException(`申领明细 ${item.id} 不存在`, 400);
        }

        const inventory = await ForageInventory.findOne({
          where: { categoryId: applicationItem.categoryId },
          transaction: t
        });

        if (inventory) {
          await inventory.update({
            quantity: (inventory.quantity as any) + item.returnedQuantity
          }, { transaction: t });
        }

        await applicationItem.update({
          returnedQuantity: item.returnedQuantity
        }, { transaction: t });

        totalReturned += item.returnedQuantity;
      }

      await application.update({
        returnedAmount: (application.returnedAmount || 0) + totalReturned
      }, { transaction: t });

      await t.commit();
      return this.getApplicationById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async reportDamage(id: number, items: DamageItemDto[]) {
    const application = await ForageApplication.findByPk(id);
    if (!application) {
      throw new BusinessException('申领单不存在', 404);
    }

    if (application.status !== ApplicationStatus.DELIVERED) {
      throw new BusinessException('只有已出库的申领单才能报损', 400);
    }

    const t = await ForageApplication.sequelize!.transaction();
    
    try {
      let totalDamaged = 0;

      for (const item of items) {
        const applicationItem = await ApplicationItem.findOne({
          where: { id: item.id, applicationId: id },
          transaction: t
        });
        
        if (!applicationItem) {
          throw new BusinessException(`申领明细 ${item.id} 不存在`, 400);
        }

        await applicationItem.update({
          damagedQuantity: item.damagedQuantity
        }, { transaction: t });

        totalDamaged += item.damagedQuantity;
      }

      await application.update({
        damagedAmount: (application.damagedAmount || 0) + totalDamaged
      }, { transaction: t });

      await t.commit();
      return this.getApplicationById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async completeApplication(id: number) {
    const application = await ForageApplication.findByPk(id, {
      include: [{ model: ApplicationItem, as: 'items' }]
    });
    if (!application) {
      throw new BusinessException('申领单不存在', 404);
    }

    if (application.status !== ApplicationStatus.DELIVERED) {
      throw new BusinessException('只有已出库的申领单才能完成', 400);
    }

    const t = await ForageApplication.sequelize!.transaction();
    
    try {
      await application.update({
        status: ApplicationStatus.COMPLETED,
        completedAt: new Date()
      }, { transaction: t });

      for (const item of application.items) {
        const actualQty = item.actualQuantity || 0;
        const returnedQty = item.returnedQuantity || 0;
        const damagedQty = item.damagedQuantity || 0;
        const consumedQty = actualQty - returnedQty - damagedQty;

        if (consumedQty > 0) {
          const inventory = await ForageInventory.findOne({
            where: { categoryId: item.categoryId },
            transaction: t
          });
          
          const unitPrice = inventory?.unitPrice || 0;
          
          await CostRecord.create({
            recordDate: new Date(),
            categoryId: item.categoryId,
            stableId: application.stableId,
            consumptionQuantity: consumedQty,
            avgUnitPrice: unitPrice,
            totalCost: consumedQty * unitPrice,
            lossQuantity: damagedQty,
            lossCost: damagedQty * unitPrice,
            type: 'daily'
          }, { transaction: t });
        }
      }

      await t.commit();
      return this.getApplicationById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async rejectApplication(id: number, approvedBy: number, reason?: string) {
    const application = await ForageApplication.findByPk(id);
    if (!application) {
      throw new BusinessException('申领单不存在', 404);
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BusinessException('只有待审核的申领单才能驳回', 400);
    }

    await application.update({
      status: ApplicationStatus.REJECTED,
      approvedBy,
      approvedAt: new Date(),
      notes: reason ? `${application.notes || ''}\n驳回原因: ${reason}` : application.notes
    });

    return this.getApplicationById(id);
  }

  async cancelApplication(id: number) {
    const application = await ForageApplication.findByPk(id, {
      include: [{ model: ApplicationItem, as: 'items' }]
    });
    if (!application) {
      throw new BusinessException('申领单不存在', 404);
    }

    if (![ApplicationStatus.PENDING, ApplicationStatus.APPROVED].includes(application.status)) {
      throw new BusinessException('只有待审核或已审批的申领单才能取消', 400);
    }

    const t = await ForageApplication.sequelize!.transaction();
    
    try {
      if (application.status === ApplicationStatus.APPROVED) {
        for (const item of application.items) {
          if (item.approvedQuantity) {
            const inventory = await ForageInventory.findOne({
              where: { categoryId: item.categoryId },
              transaction: t
            });
            
            if (inventory) {
              await inventory.update({
                reservedQuantity: ((inventory.reservedQuantity as any) || 0) - item.approvedQuantity
              }, { transaction: t });
            }
          }
        }
      }

      await application.update({
        status: ApplicationStatus.CANCELLED
      }, { transaction: t });

      await t.commit();
      return this.getApplicationById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async expireOverdueApplications() {
    const now = new Date();
    const applications = await ForageApplication.findAll({
      where: {
        status: ApplicationStatus.PENDING,
        expireAt: { [Op.lt]: now }
      },
      include: [{ model: ApplicationItem, as: 'items' }]
    });

    for (const application of applications) {
      const t = await ForageApplication.sequelize!.transaction();
      try {
        for (const item of application.items) {
          if (item.approvedQuantity && item.approvedQuantity > 0) {
            const inventory = await ForageInventory.findOne({
              where: { categoryId: item.categoryId },
              transaction: t
            });

            if (inventory) {
              await inventory.update({
                reservedQuantity: Math.max(0, (inventory.reservedQuantity || 0) - item.approvedQuantity)
              }, { transaction: t });
            }
          }
        }

        await application.update({ status: ApplicationStatus.EXPIRED }, { transaction: t });
        await t.commit();
        logger.info(`申领单 ${application.id} 已过期自动作废，并回滚预留库存`);
      } catch (error) {
        await t.rollback();
        logger.error(`处理过期申领单 ${application.id} 失败:`, error);
      }
    }

    return applications.length;
  }

  async getApplicationStatistics(params: ApplicationStatisticsDto) {
    const where: any = {
      status: { [Op.ne]: ApplicationStatus.CANCELLED }
    };
    
    if (params.startDate && params.endDate) {
      where.createdAt = { [Op.between]: [params.startDate, params.endDate] };
    }
    if (params.stableId) {
      where.stableId = params.stableId;
    }

    const statusStats = await ForageApplication.findAll({
      where,
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status']
    });

    const total = await ForageApplication.count({ where });

    const categoryUsage = await ApplicationItem.findAll({
      where: { '$application.status$': ApplicationStatus.COMPLETED },
      include: [{
        model: ForageApplication,
        as: 'application',
        attributes: [],
        where: params.startDate && params.endDate ? {
          completedAt: { [Op.between]: [params.startDate, params.endDate] }
        } : {}
      }],
      attributes: [
        'categoryId',
        [fn('SUM', literal('actualQuantity - returnedQuantity - damagedQuantity')), 'totalUsage']
      ],
      include: [{ model: ForageCategory, as: 'category', attributes: ['name', 'type'] }],
      group: ['categoryId']
    });

    const stableStats = await ForageApplication.findAll({
      where: {
        ...where,
        status: ApplicationStatus.COMPLETED
      },
      attributes: [
        'stableId',
        [fn('COUNT', col('id')), 'applicationCount'],
        [fn('SUM', col('totalAmount')), 'totalAmount']
      ],
      include: [{ model: Stable, as: 'stable', attributes: ['name'] }],
      group: ['stableId']
    });

    return {
      total,
      byStatus: statusStats,
      categoryUsage,
      byStable: stableStats
    };
  }
}

export const forageApplicationService = new ForageApplicationService();
