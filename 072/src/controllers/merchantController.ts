import { Request, Response, NextFunction } from 'express';
import { Op, Transaction, literal } from 'sequelize';
import Merchant from '../models/Merchant';
import PricePackage from '../models/PricePackage';
import MerchantSchedule from '../models/MerchantSchedule';
import Activity from '../models/Activity';
import ActivityCategory from '../models/ActivityCategory';
import { AppError } from '../middleware/errorHandler';
import { MerchantStatus, ActivityStatus, UserRole } from '../types';
import sequelize from '../config/database';
import logger from '../config/logger';

export const getMerchants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      keyword, 
      status,
      cooperationStatus,
      serviceCategoryId,
      hasAvailableSchedule,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const where: any = {};

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { contactPerson: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (cooperationStatus === 'active') {
      where[Op.and] = [
        { cooperationStartDate: { [Op.lte]: new Date() } },
        { 
          [Op.or]: [
            { cooperationEndDate: { [Op.gte]: new Date() } },
            { cooperationEndDate: null }
          ]
        }
      ];
    } else if (cooperationStatus === 'expired') {
      where.cooperationEndDate = { [Op.lt]: new Date() };
    }

    let merchantIdsWithCategory: number[] | undefined;
    if (serviceCategoryId) {
      const categoryId = Number(serviceCategoryId);
      const category = await ActivityCategory.findByPk(categoryId);
      if (category) {
        const categories = await ActivityCategory.findAll({
          where: { parentId: categoryId }
        });
        const childIds = categories.map(c => c.id);
        const allCategoryIds = [categoryId, ...childIds];
        
        merchantIdsWithCategory = (await MerchantSchedule.findAll({
          attributes: ['merchantId'],
          where: { date: { [Op.gte]: new Date() } },
          include: [{
            model: Activity,
            attributes: [],
            where: { categoryId: { [Op.in]: allCategoryIds } },
            required: false
          }],
          group: ['merchantId']
        })).map(s => s.merchantId);
      }
    }

    if (hasAvailableSchedule === 'true') {
      const scheduleWhere: any = { isLocked: false };
      if (startDate && endDate) {
        scheduleWhere.date = { [Op.between]: [startDate, endDate] };
      } else {
        scheduleWhere.date = { [Op.gte]: new Date() };
      }
      
      const merchantsWithSchedule = await MerchantSchedule.findAll({
        attributes: ['merchantId'],
        where: scheduleWhere,
        group: ['merchantId']
      });
      
      const scheduleMerchantIds = merchantsWithSchedule.map(s => s.merchantId);
      if (merchantIdsWithCategory) {
        merchantIdsWithCategory = merchantIdsWithCategory.filter(id => 
          scheduleMerchantIds.includes(id)
        );
      } else {
        merchantIdsWithCategory = scheduleMerchantIds;
      }
    }

    if (merchantIdsWithCategory && merchantIdsWithCategory.length > 0) {
      where.id = { [Op.in]: merchantIdsWithCategory };
    }

    const order = [[sortBy as string, sortOrder as string]];
    if (sortBy === 'cooperationEndDate') {
      order.unshift([literal('CASE WHEN cooperationEndDate IS NULL THEN 1 ELSE 0 END'), 'ASC']);
    }

    const { count, rows } = await Merchant.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order,
      include: [
        { model: PricePackage, required: false },
        { 
          model: MerchantSchedule,
          required: false,
          limit: 5,
          order: [['date', 'ASC']],
          where: { date: { [Op.gte]: new Date() } },
          separate: true
        }
      ],
      distinct: true
    });

    const merchantsWithStats = await Promise.all(rows.map(async (merchant) => {
      const merchantJson = merchant.toJSON();
      
      const [approvedCount, pendingCount] = await Promise.all([
        Activity.count({
          where: { merchantId: merchant.id, status: ActivityStatus.REGISTERING }
        }),
        Activity.count({
          where: { merchantId: merchant.id, status: ActivityStatus.DRAFT }
        })
      ]);

      const availableScheduleCount = await MerchantSchedule.count({
        where: { 
          merchantId: merchant.id, 
          isLocked: false,
          date: { [Op.gte]: new Date() }
        }
      });

      return {
        ...merchantJson,
        stats: {
          activeActivities: approvedCount,
          pendingActivities: pendingCount,
          availableSchedules: availableScheduleCount
        }
      };
    }));

    res.success({
      list: merchantsWithStats,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(count / Number(pageSize))
    });
  } catch (error) {
    logger.error('获取商家列表失败:', error);
    next(error);
  }
};

export const getMerchantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const merchant = await Merchant.findByPk(id, {
      include: [
        PricePackage,
        {
          model: MerchantSchedule,
          limit: 30,
          order: [['date', 'ASC'], ['timeSlot', 'ASC']],
          where: { date: { [Op.gte]: new Date() } },
          required: false
        }
      ]
    });

    if (!merchant) {
      throw new AppError('商家不存在', 404);
    }

    const merchantJson = merchant.toJSON();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivities = await Activity.count({
      where: { 
        merchantId: id,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    const totalParticipants = await Activity.sum('currentParticipants', {
      where: { merchantId: id }
    });

    merchantJson.stats = {
      recentActivities,
      totalParticipants: totalParticipants || 0
    };

    res.success(merchantJson);
  } catch (error) {
    next(error);
  }
};

export const createMerchant = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const {
      name, contactPerson, phone, email, address,
      businessLicense, serviceItems, cooperationStartDate, cooperationEndDate
    } = req.body;

    if (!name || !contactPerson || !phone) {
      throw new AppError('商家名称、联系人和电话不能为空', 400);
    }

    const existingMerchant = await Merchant.findOne({
      where: { name },
      transaction: t
    });

    if (existingMerchant) {
      throw new AppError('该商家名称已存在', 400);
    }

    const merchant = await Merchant.create({
      name,
      contactPerson,
      phone,
      email,
      address,
      businessLicense,
      serviceItems,
      cooperationStartDate,
      cooperationEndDate,
      status: MerchantStatus.PENDING
    }, { transaction: t });

    await t.commit();
    
    logger.info(`创建商家: ${merchant.id} - ${merchant.name}`);
    res.success(merchant, '商家创建成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const updateMerchant = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, ...updateData } = req.body;

    const merchant = await Merchant.findByPk(id, { transaction: t });
    if (!merchant) {
      throw new AppError('商家不存在', 404);
    }

    if (name) {
      const existingMerchant = await Merchant.findOne({
        where: { 
          name,
          id: { [Op.ne]: id }
        },
        transaction: t
      });

      if (existingMerchant) {
        throw new AppError('该商家名称已存在', 400);
      }
      (updateData as any).name = name;
    }

    await merchant.update(updateData, { transaction: t });
    await t.commit();

    logger.info(`更新商家: ${merchant.id} - ${merchant.name}`);
    res.success(merchant, '商家更新成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const auditMerchant = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, auditRemark } = req.body;

    const merchant = await Merchant.findByPk(id, { transaction: t });
    if (!merchant) {
      throw new AppError('商家不存在', 404);
    }

    if (![MerchantStatus.APPROVED, MerchantStatus.REJECTED, MerchantStatus.SUSPENDED].includes(status)) {
      throw new AppError('无效的审核状态', 400);
    }

    if (merchant.status === MerchantStatus.APPROVED && status === MerchantStatus.APPROVED) {
      throw new AppError('商家已通过审核，无需重复审核', 400);
    }

    if (status === MerchantStatus.SUSPENDED) {
      await Activity.update(
        { status: ActivityStatus.CLOSED },
        { 
          where: { merchantId: id, status: ActivityStatus.REGISTERING },
          transaction: t
        }
      );
    }

    await merchant.update({ status, auditRemark }, { transaction: t });
    await t.commit();

    const statusText: Record<MerchantStatus, string> = {
      [MerchantStatus.PENDING]: '待审核',
      [MerchantStatus.APPROVED]: '审核通过',
      [MerchantStatus.REJECTED]: '审核拒绝',
      [MerchantStatus.SUSPENDED]: '已暂停'
    };

    logger.info(`商家审核: ${merchant.id} - ${statusText[status]}`);
    res.success(merchant, `商家${statusText[status]}`);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const deleteMerchant = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const merchant = await Merchant.findByPk(id, { transaction: t });

    if (!merchant) {
      throw new AppError('商家不存在', 404);
    }

    const activityCount = await Activity.count({
      where: { merchantId: id },
      transaction: t
    });

    if (activityCount > 0) {
      throw new AppError('该商家关联了活动，无法删除，请先处理相关活动', 400);
    }

    await PricePackage.destroy({
      where: { merchantId: id },
      transaction: t
    });

    await MerchantSchedule.destroy({
      where: { merchantId: id },
      transaction: t
    });

    await merchant.destroy({ transaction: t });
    await t.commit();

    logger.info(`删除商家: ${merchant.id} - ${merchant.name}`);
    res.success(null, '商家删除成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getMerchantSchedules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { merchantId } = req.params;
    const { startDate, endDate, isLocked, hasActivity, page = 1, pageSize = 30 } = req.query;

    const where: any = { merchantId };
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }

    if (isLocked !== undefined) {
      where.isLocked = isLocked === 'true';
    }

    const include: any[] = [{
      model: Activity,
      attributes: ['id', 'title', 'status', 'maxParticipants', 'currentParticipants'],
      required: hasActivity === 'true'
    }];

    const { count, rows } = await MerchantSchedule.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['date', 'ASC'], ['timeSlot', 'ASC']],
      include
    });

    res.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    });
  } catch (error) {
    next(error);
  }
};

export const createMerchantSchedule = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { merchantId, date, timeSlot, pricePackageId, maxParticipants } = req.body;

    const merchant = await Merchant.findByPk(merchantId, { transaction: t });
    if (!merchant) {
      throw new AppError('商家不存在', 404);
    }

    if (merchant.status !== MerchantStatus.APPROVED) {
      throw new AppError('商家未通过审核，无法创建档期', 400);
    }

    const existing = await MerchantSchedule.findOne({
      where: { merchantId, date, timeSlot },
      transaction: t
    });

    if (existing) {
      throw new AppError('该时间段档期已存在', 400);
    }

    if (pricePackageId) {
      const pricePackage = await PricePackage.findByPk(pricePackageId, { transaction: t });
      if (!pricePackage || pricePackage.merchantId !== merchantId) {
        throw new AppError('无效的报价套餐', 400);
      }
    }

    const schedule = await MerchantSchedule.create({
      merchantId,
      date,
      timeSlot,
      pricePackageId,
      maxParticipants,
      isLocked: false
    }, { transaction: t });

    await t.commit();
    
    logger.info(`创建档期: ${schedule.id} - ${date} ${timeSlot}`);
    res.success(schedule, '档期创建成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const updateMerchantSchedule = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const schedule = await MerchantSchedule.findByPk(id, { transaction: t });

    if (!schedule) {
      throw new AppError('档期不存在', 404);
    }

    if (schedule.eventId) {
      throw new AppError('该档期已被活动占用，无法修改', 400);
    }

    const { merchantId, date, timeSlot, ...updateData } = req.body;

    if (date && timeSlot && merchantId) {
      const existing = await MerchantSchedule.findOne({
        where: { 
          merchantId, 
          date, 
          timeSlot,
          id: { [Op.ne]: id }
        },
        transaction: t
      });

      if (existing) {
        throw new AppError('该时间段档期已存在', 400);
      }
    }

    await schedule.update(updateData, { transaction: t });
    await t.commit();

    logger.info(`更新档期: ${schedule.id}`);
    res.success(schedule, '档期更新成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const toggleScheduleLock = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { isLocked } = req.body;

    const schedule = await MerchantSchedule.findByPk(id, { transaction: t });
    if (!schedule) {
      throw new AppError('档期不存在', 404);
    }

    if (schedule.eventId && isLocked === false) {
      throw new AppError('该档期已被活动占用，无法解锁', 400);
    }

    await schedule.update({ isLocked }, { transaction: t });
    await t.commit();

    logger.info(`档期锁定状态变更: ${schedule.id} - ${isLocked ? '锁定' : '解锁'}`);
    res.success(schedule, isLocked ? '档期已锁定' : '档期已解锁');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const deleteMerchantSchedule = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const schedule = await MerchantSchedule.findByPk(id, { transaction: t });

    if (!schedule) {
      throw new AppError('档期不存在', 404);
    }

    if (schedule.eventId) {
      throw new AppError('该档期已被活动占用，无法删除', 400);
    }

    await schedule.destroy({ transaction: t });
    await t.commit();

    logger.info(`删除档期: ${schedule.id}`);
    res.success(null, '档期删除成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getPricePackages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { merchantId, status, keyword } = req.query;
    const where: any = {};

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (status !== undefined) {
      where.status = Number(status);
    }

    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }

    const packages = await PricePackage.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [Merchant]
    });

    res.success(packages);
  } catch (error) {
    next(error);
  }
};

export const createPricePackage = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const {
      merchantId, name, description, basePrice, pricePerPerson,
      minParticipants, maxParticipants, includedServices
    } = req.body;

    if (!merchantId || !name) {
      throw new AppError('商家ID和套餐名称不能为空', 400);
    }

    const merchant = await Merchant.findByPk(merchantId, { transaction: t });
    if (!merchant) {
      throw new AppError('商家不存在', 404);
    }

    if (merchant.status !== MerchantStatus.APPROVED) {
      throw new AppError('商家未通过审核，无法创建报价套餐', 400);
    }

    const existingPackage = await PricePackage.findOne({
      where: { merchantId, name },
      transaction: t
    });

    if (existingPackage) {
      throw new AppError('该商家下已存在同名套餐', 400);
    }

    const pricePackage = await PricePackage.create({
      merchantId,
      name,
      description,
      basePrice: basePrice || 0,
      pricePerPerson: pricePerPerson || 0,
      minParticipants: minParticipants || 1,
      maxParticipants,
      includedServices,
      status: 1
    }, { transaction: t });

    await t.commit();

    logger.info(`创建报价套餐: ${pricePackage.id} - ${pricePackage.name}`);
    res.success(pricePackage, '报价套餐创建成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const updatePricePackage = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const pricePackage = await PricePackage.findByPk(id, { transaction: t });

    if (!pricePackage) {
      throw new AppError('报价套餐不存在', 404);
    }

    const { name, merchantId, ...updateData } = req.body;

    if (merchantId && merchantId !== pricePackage.merchantId) {
      throw new AppError('不能修改套餐所属商家', 400);
    }

    if (name) {
      const existingPackage = await PricePackage.findOne({
        where: {
          merchantId: pricePackage.merchantId,
          name,
          id: { [Op.ne]: id }
        },
        transaction: t
      });

      if (existingPackage) {
        throw new AppError('该商家下已存在同名套餐', 400);
      }
      (updateData as any).name = name;
    }

    await pricePackage.update(updateData, { transaction: t });
    await t.commit();

    logger.info(`更新报价套餐: ${pricePackage.id} - ${pricePackage.name}`);
    res.success(pricePackage, '报价套餐更新成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const deletePricePackage = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const pricePackage = await PricePackage.findByPk(id, { transaction: t });

    if (!pricePackage) {
      throw new AppError('报价套餐不存在', 404);
    }

    const activityCount = await Activity.count({
      where: { pricePackageId: id },
      transaction: t
    });

    if (activityCount > 0) {
      throw new AppError('该套餐已被活动使用，无法删除', 400);
    }

    await pricePackage.destroy({ transaction: t });
    await t.commit();

    logger.info(`删除报价套餐: ${pricePackage.id} - ${pricePackage.name}`);
    res.success(null, '报价套餐删除成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
