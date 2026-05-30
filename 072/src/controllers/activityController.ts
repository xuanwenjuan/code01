import { Request, Response, NextFunction } from 'express';
import { Op, Transaction, literal } from 'sequelize';
import Activity from '../models/Activity';
import ActivityCategory from '../models/ActivityCategory';
import Merchant from '../models/Merchant';
import Registration from '../models/Registration';
import User from '../models/User';
import Department from '../models/Department';
import MerchantSchedule from '../models/MerchantSchedule';
import { AppError } from '../middleware/errorHandler';
import { ActivityStatus, RegistrationStatus, MerchantStatus, UserRole, DepartmentTree } from '../types';
import sequelize from '../config/database';
import logger from '../config/logger';

const checkCategoryStatus = async (categoryId: number, t?: Transaction): Promise<boolean> => {
  const category = await ActivityCategory.findByPk(categoryId, { transaction: t });
  if (!category) return false;
  if (category.status === 0) return false;
  if (category.parentId) {
    return checkCategoryStatus(category.parentId, t);
  }
  return true;
};

export const getActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      keyword, 
      categoryId,
      status,
      merchantId,
      startDate,
      endDate,
      departmentId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const where: any = {};

    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (startDate && endDate) {
      where.activityDate = { [Op.between]: [startDate, endDate] };
    }

    if (departmentId) {
      where.departmentIds = { [Op.like]: `%${departmentId}%` };
    }

    const user = req.user as any;
    if (user && user.role === UserRole.DEPARTMENT_MANAGER && user.departmentId) {
      where[Op.and] = [
        {
          [Op.or]: [
            { departmentIds: { [Op.like]: `%${user.departmentId}%` } },
            { departmentIds: null },
            { createdByDepartmentId: user.departmentId }
          ]
        }
      ];
    }

    const { count, rows } = await Activity.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [[sortBy as string, sortOrder as string]],
      include: [
        { model: ActivityCategory, attributes: ['id', 'name'] },
        { model: Merchant, attributes: ['id', 'name', 'contactPerson'] }
      ],
      distinct: true
    });

    const activitiesWithStats = await Promise.all(rows.map(async (activity) => {
      const activityJson = activity.toJSON();
      
      const [approvedCount, pendingCount] = await Promise.all([
        Registration.count({
          where: { activityId: activity.id, status: RegistrationStatus.APPROVED }
        }),
        Registration.count({
          where: { activityId: activity.id, status: RegistrationStatus.PENDING }
        })
      ]);

      const remainingSlots = activity.maxParticipants 
        ? Math.max(0, activity.maxParticipants - activity.currentParticipants)
        : null;

      return {
        ...activityJson,
        stats: {
          approvedRegistrations: approvedCount,
          pendingRegistrations: pendingCount,
          remainingSlots,
          isFull: remainingSlots !== null && remainingSlots <= 0
        }
      };
    }));

    res.success({
      list: activitiesWithStats,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(count / Number(pageSize))
    });
  } catch (error) {
    logger.error('获取活动列表失败:', error);
    next(error);
  }
};

export const getActivityById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findByPk(id, {
      include: [
        { model: ActivityCategory, attributes: ['id', 'name'] },
        { model: Merchant, attributes: ['id', 'name', 'contactPerson', 'phone'] }
      ]
    });

    if (!activity) {
      throw new AppError('活动不存在', 404);
    }

    const activityJson = activity.toJSON();

    const [approvedCount, pendingCount, rejectedCount] = await Promise.all([
      Registration.count({ where: { activityId: id, status: RegistrationStatus.APPROVED } }),
      Registration.count({ where: { activityId: id, status: RegistrationStatus.PENDING } }),
      Registration.count({ where: { activityId: id, status: RegistrationStatus.REJECTED } })
    ]);

    const remainingSlots = activity.maxParticipants 
      ? Math.max(0, activity.maxParticipants - activity.currentParticipants)
      : null;

    activityJson.stats = {
      approvedRegistrations: approvedCount,
      pendingRegistrations: pendingCount,
      rejectedRegistrations: rejectedCount,
      remainingSlots,
      isFull: remainingSlots !== null && remainingSlots <= 0
    };

    res.success(activityJson);
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const {
      title, description, categoryId, merchantId, scheduleId,
      maxParticipants, registrationStartDate, registrationEndDate,
      activityDate, location, pricePackageId, departmentIds,
      needApproval, coverImage
    } = req.body;

    const user = req.user as any;

    if (!title || !categoryId || !merchantId) {
      throw new AppError('活动标题、类目、商家不能为空', 400);
    }

    const categoryActive = await checkCategoryStatus(categoryId, t);
    if (!categoryActive) {
      throw new AppError('所选类目或其父类目已停用，无法创建活动', 400);
    }

    const merchant = await Merchant.findByPk(merchantId, { transaction: t });
    if (!merchant) {
      throw new AppError('商家不存在', 404);
    }

    if (merchant.status !== MerchantStatus.APPROVED) {
      throw new AppError('商家未通过审核，无法创建活动', 400);
    }

    let schedule: MerchantSchedule | null = null;
    if (scheduleId) {
      schedule = await MerchantSchedule.findByPk(scheduleId, { transaction: t });
      if (!schedule) {
        throw new AppError('档期不存在', 404);
      }
      if (schedule.merchantId !== merchantId) {
        throw new AppError('档期不属于所选商家', 400);
      }
      if (schedule.isLocked || schedule.eventId) {
        throw new AppError('档期已被占用或锁定', 400);
      }
    }

    const activity = await Activity.create({
      title,
      description,
      categoryId,
      merchantId,
      scheduleId,
      maxParticipants,
      currentParticipants: 0,
      registrationStartDate,
      registrationEndDate,
      activityDate,
      location,
      pricePackageId,
      departmentIds,
      needApproval: needApproval ?? true,
      coverImage,
      status: ActivityStatus.DRAFT,
      createdBy: user?.id,
      createdByDepartmentId: user?.departmentId
    }, { transaction: t });

    if (schedule) {
      await schedule.update(
        { eventId: activity.id, isLocked: true },
        { transaction: t }
      );
    }

    await t.commit();

    logger.info(`创建活动: ${activity.id} - ${activity.title}`, {
      userId: user?.id,
      userName: user?.name
    });
    res.success(activity, '活动创建成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const updateActivity = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const user = req.user as any;
    const { scheduleId, categoryId, merchantId, ...updateData } = req.body;

    const activity = await Activity.findByPk(id, { transaction: t });
    if (!activity) {
      throw new AppError('活动不存在', 404);
    }

    if (activity.status !== ActivityStatus.DRAFT) {
      throw new AppError('只有草稿状态的活动可以编辑', 400);
    }

    if (categoryId) {
      const categoryActive = await checkCategoryStatus(categoryId, t);
      if (!categoryActive) {
        throw new AppError('所选类目或其父类目已停用', 400);
      }
      (updateData as any).categoryId = categoryId;
    }

    if (merchantId) {
      const merchant = await Merchant.findByPk(merchantId, { transaction: t });
      if (!merchant || merchant.status !== MerchantStatus.APPROVED) {
        throw new AppError('商家不存在或未通过审核', 400);
      }
      (updateData as any).merchantId = merchantId;
    }

    if (scheduleId && scheduleId !== activity.scheduleId) {
      const schedule = await MerchantSchedule.findByPk(scheduleId, { transaction: t });
      if (!schedule) {
        throw new AppError('档期不存在', 404);
      }
      if (schedule.merchantId !== (merchantId || activity.merchantId)) {
        throw new AppError('档期不属于所选商家', 400);
      }
      if (schedule.isLocked || schedule.eventId) {
        throw new AppError('档期已被占用或锁定', 400);
      }

      if (activity.scheduleId) {
        await MerchantSchedule.update(
          { eventId: null, isLocked: false },
          { where: { id: activity.scheduleId }, transaction: t }
        );
      }

      await schedule.update(
        { eventId: activity.id, isLocked: true },
        { transaction: t }
      );
      (updateData as any).scheduleId = scheduleId;
    }

    await activity.update(updateData, { transaction: t });
    await t.commit();

    logger.info(`更新活动: ${activity.id} - ${activity.title}`, {
      userId: user?.id,
      userName: user?.name
    });
    res.success(activity, '活动更新成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const updateActivityStatus = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user as any;

    const activity = await Activity.findByPk(id, { transaction: t });
    if (!activity) {
      throw new AppError('活动不存在', 404);
    }

    const validTransitions: Record<ActivityStatus, ActivityStatus[]> = {
      [ActivityStatus.DRAFT]: [ActivityStatus.REGISTERING, ActivityStatus.CANCELLED],
      [ActivityStatus.REGISTERING]: [ActivityStatus.REGISTRATION_CLOSED, ActivityStatus.CANCELLED],
      [ActivityStatus.REGISTRATION_CLOSED]: [ActivityStatus.IN_PROGRESS, ActivityStatus.CANCELLED],
      [ActivityStatus.IN_PROGRESS]: [ActivityStatus.COMPLETED, ActivityStatus.CANCELLED],
      [ActivityStatus.COMPLETED]: [],
      [ActivityStatus.CANCELLED]: [],
      [ActivityStatus.CLOSED]: []
    };

    if (!validTransitions[activity.status].includes(status)) {
      throw new AppError(`无法从${activity.status}状态转换到${status}状态`, 400);
    }

    if (status === ActivityStatus.REGISTERING) {
      const categoryActive = await checkCategoryStatus(activity.categoryId, t);
      if (!categoryActive) {
        throw new AppError('活动类目已停用，无法开启报名', 400);
      }

      const now = new Date();
      if (activity.registrationStartDate && activity.registrationStartDate > now) {
        throw new AppError('未到报名开始时间', 400);
      }
      if (activity.registrationEndDate && activity.registrationEndDate < now) {
        throw new AppError('报名已结束，无法开启报名', 400);
      }

      if (activity.scheduleId) {
        await MerchantSchedule.update(
          { isLocked: true },
          { where: { id: activity.scheduleId }, transaction: t }
        );
      }
    }

    if (status === ActivityStatus.CANCELLED) {
      if (activity.scheduleId) {
        await MerchantSchedule.update(
          { eventId: null, isLocked: false },
          { where: { id: activity.scheduleId }, transaction: t }
        );
      }
    }

    await activity.update({ status }, { transaction: t });
    await t.commit();

    const statusText: Record<ActivityStatus, string> = {
      [ActivityStatus.DRAFT]: '草稿',
      [ActivityStatus.REGISTERING]: '报名中',
      [ActivityStatus.REGISTRATION_CLOSED]: '报名截止',
      [ActivityStatus.IN_PROGRESS]: '进行中',
      [ActivityStatus.COMPLETED]: '已完成',
      [ActivityStatus.CANCELLED]: '已取消',
      [ActivityStatus.CLOSED]: '已关闭'
    };

    logger.info(`活动状态变更: ${activity.id} - ${statusText[status]}`, {
      userId: user?.id,
      userName: user?.name
    });
    res.success(activity, `活动已${statusText[status]}`);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const deleteActivity = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const user = req.user as any;

    const activity = await Activity.findByPk(id, { transaction: t });
    if (!activity) {
      throw new AppError('活动不存在', 404);
    }

    if (activity.status !== ActivityStatus.DRAFT) {
      throw new AppError('只有草稿状态的活动可以删除', 400);
    }

    const registrationCount = await Registration.count({
      where: { activityId: id },
      transaction: t
    });

    if (registrationCount > 0) {
      throw new AppError('该活动已有报名记录，无法删除', 400);
    }

    if (activity.scheduleId) {
      await MerchantSchedule.update(
        { eventId: null, isLocked: false },
        { where: { id: activity.scheduleId }, transaction: t }
      );
    }

    await activity.destroy({ transaction: t });
    await t.commit();

    logger.info(`删除活动: ${activity.id} - ${activity.title}`, {
      userId: user?.id,
      userName: user?.name
    });
    res.success(null, '活动删除成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const registerForActivity = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
  });
  
  try {
    const { activityId, remark } = req.body;
    const user = req.user as any;

    if (!user) {
      throw new AppError('用户未登录', 401);
    }

    const activity = await Activity.findByPk(activityId, { 
      transaction: t,
      lock: true
    });
    
    if (!activity) {
      throw new AppError('活动不存在', 404);
    }

    if (activity.status !== ActivityStatus.REGISTERING) {
      throw new AppError('活动不在报名状态', 400);
    }

    const now = new Date();
    if (activity.registrationStartDate && activity.registrationStartDate > now) {
      throw new AppError('报名尚未开始', 400);
    }
    if (activity.registrationEndDate && activity.registrationEndDate < now) {
      throw new AppError('报名已结束', 400);
    }

    const remainingSlots = activity.maxParticipants 
      ? activity.maxParticipants - activity.currentParticipants
      : Infinity;
    
    if (remainingSlots <= 0) {
      throw new AppError('活动名额已满', 400);
    }

    const existingRegistration = await Registration.findOne({
      where: { 
        activityId, 
        userId: user.id,
        status: { [Op.ne]: RegistrationStatus.CANCELLED }
      },
      transaction: t
    });

    if (existingRegistration) {
      throw new AppError('您已报名该活动', 400);
    }

    if (activity.departmentIds) {
      const allowedDepartmentIds = JSON.parse(activity.departmentIds);
      if (!allowedDepartmentIds.includes(user.departmentId)) {
        throw new AppError('您所在部门无权报名该活动', 400);
      }
    }

    const initialStatus = activity.needApproval 
      ? RegistrationStatus.PENDING 
      : RegistrationStatus.APPROVED;

    const registration = await Registration.create({
      activityId,
      userId: user.id,
      userName: user.name,
      departmentId: user.departmentId,
      status: initialStatus,
      remark
    }, { transaction: t });

    if (!activity.needApproval) {
      const newCurrentParticipants = activity.currentParticipants + 1;
      
      await activity.update(
        { currentParticipants: newCurrentParticipants },
        { transaction: t }
      );

      if (activity.maxParticipants && newCurrentParticipants >= activity.maxParticipants) {
        await activity.update(
          { status: ActivityStatus.REGISTRATION_CLOSED },
          { transaction: t }
        );
        logger.info(`活动满额自动截止: ${activity.id} - ${activity.title}`);
      }
    }

    await t.commit();

    logger.info(`活动报名: ${activity.id} - ${user.name}`, {
      userId: user.id,
      status: initialStatus
    });
    res.success(registration, activity.needApproval ? '报名成功，等待审批' : '报名成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getMyRegistrations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { page = 1, pageSize = 10, status } = req.query;

    const where: any = { userId: user.id };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Registration.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Activity,
          attributes: ['id', 'title', 'activityDate', 'location', 'status']
        }
      ]
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

export const getDepartmentRegistrations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { page = 1, pageSize = 10, status, activityId } = req.query;

    const where: any = {};
    
    if (user.role === UserRole.DEPARTMENT_MANAGER) {
      where.departmentId = user.departmentId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (activityId) {
      where.activityId = activityId;
    }

    const { count, rows } = await Registration.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Activity,
          attributes: ['id', 'title', 'activityDate', 'location']
        },
        {
          model: User,
          attributes: ['id', 'name', 'phone']
        },
        {
          model: Department,
          attributes: ['id', 'name']
        }
      ]
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

export const approveRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
  });
  
  try {
    const { id } = req.params;
    const { approved, reason } = req.body;
    const user = req.user as any;

    const registration = await Registration.findByPk(id, { 
      transaction: t,
      lock: true
    });
    
    if (!registration) {
      throw new AppError('报名记录不存在', 404);
    }

    if (registration.status !== RegistrationStatus.PENDING) {
      throw new AppError('只能审批待审核的报名', 400);
    }

    if (user.role === UserRole.DEPARTMENT_MANAGER) {
      if (registration.departmentId !== user.departmentId) {
        throw new AppError('您只能审批本部门员工的报名', 403);
      }
    }

    const activity = await Activity.findByPk(registration.activityId, { 
      transaction: t,
      lock: true
    });
    
    if (!activity) {
      throw new AppError('活动不存在', 404);
    }

    if (activity.status === ActivityStatus.CANCELLED) {
      throw new AppError('活动已取消', 400);
    }

    const newStatus = approved ? RegistrationStatus.APPROVED : RegistrationStatus.REJECTED;

    if (approved) {
      const remainingSlots = activity.maxParticipants 
        ? activity.maxParticipants - activity.currentParticipants
        : Infinity;
      
      if (remainingSlots <= 0) {
        throw new AppError('活动名额已满，无法审批通过', 400);
      }

      const newCurrentParticipants = activity.currentParticipants + 1;
      
      await activity.update(
        { currentParticipants: newCurrentParticipants },
        { transaction: t }
      );

      if (activity.maxParticipants && newCurrentParticipants >= activity.maxParticipants) {
        await activity.update(
          { status: ActivityStatus.REGISTRATION_CLOSED },
          { transaction: t }
        );
        logger.info(`活动满额自动截止: ${activity.id} - ${activity.title}`);
      }
    }

    await registration.update({
      status: newStatus,
      approvedBy: user.id,
      approvedAt: new Date(),
      approvalRemark: reason
    }, { transaction: t });

    await t.commit();

    logger.info(`报名审批: ${registration.id} - ${approved ? '通过' : '拒绝'}`, {
      userId: user.id,
      userName: user.name,
      participantId: registration.userId,
      participantName: registration.userName
    });
    res.success(registration, approved ? '审批通过' : '已拒绝');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const cancelRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
  });
  
  try {
    const { id } = req.params;
    const user = req.user as any;

    const registration = await Registration.findByPk(id, { 
      transaction: t,
      lock: true
    });
    
    if (!registration) {
      throw new AppError('报名记录不存在', 404);
    }

    if (registration.userId !== user.id && 
        user.role !== UserRole.ADMIN && 
        user.role !== UserRole.SUPER_ADMIN) {
      throw new AppError('您只能取消自己的报名', 403);
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new AppError('该报名已取消', 400);
    }

    if (registration.status === RegistrationStatus.CHECKED_IN) {
      throw new AppError('已签到的报名无法取消', 400);
    }

    const activity = await Activity.findByPk(registration.activityId, { 
      transaction: t,
      lock: true
    });
    
    if (!activity) {
      throw new AppError('活动不存在', 404);
    }

    const wasApproved = registration.status === RegistrationStatus.APPROVED;

    await registration.update({
      status: RegistrationStatus.CANCELLED,
      cancelledAt: new Date()
    }, { transaction: t });

    if (wasApproved) {
      const newCurrentParticipants = Math.max(0, activity.currentParticipants - 1);
      
      await activity.update(
        { currentParticipants: newCurrentParticipants },
        { transaction: t }
      );

      if (activity.status === ActivityStatus.REGISTRATION_CLOSED && 
          activity.maxParticipants && 
          newCurrentParticipants < activity.maxParticipants) {
        const now = new Date();
        if (activity.registrationEndDate && activity.registrationEndDate > now) {
          await activity.update(
            { status: ActivityStatus.REGISTERING },
            { transaction: t }
          );
          logger.info(`活动名额释放，重新开启报名: ${activity.id} - ${activity.title}`);
        }
      }
    }

    await t.commit();

    logger.info(`取消报名: ${registration.id}`, {
      userId: user.id,
      userName: user.name,
      participantId: registration.userId,
      participantName: registration.userName
    });
    res.success(registration, '报名已取消');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const checkIn = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const user = req.user as any;

    const registration = await Registration.findByPk(id, { transaction: t });
    if (!registration) {
      throw new AppError('报名记录不存在', 404);
    }

    if (registration.status !== RegistrationStatus.APPROVED) {
      throw new AppError('只能对已审批通过的报名进行签到', 400);
    }

    const activity = await Activity.findByPk(registration.activityId, { transaction: t });
    if (!activity) {
      throw new AppError('活动不存在', 404);
    }

    const now = new Date();
    if (activity.activityDate) {
      const activityDate = new Date(activity.activityDate);
      const dayBefore = new Date(activityDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      
      if (now < dayBefore) {
        throw new AppError('未到签到时间', 400);
      }
    }

    await registration.update({
      status: RegistrationStatus.CHECKED_IN,
      checkedInAt: now,
      checkedInBy: user.id
    }, { transaction: t });

    await t.commit();

    logger.info(`活动签到: ${registration.id} - ${registration.userName}`, {
      userId: user.id,
      userName: user.name
    });
    res.success(registration, '签到成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getActivityStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activityId, departmentId, startDate, endDate } = req.query;

    const where: any = {};
    
    if (activityId) {
      where.activityId = activityId;
    }
    
    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const [byStatus, byDepartment, byActivity] = await Promise.all([
      Registration.findAll({
        where,
        attributes: ['status', [literal('COUNT(*)'), 'count']],
        group: ['status'],
        raw: true
      }),
      Registration.findAll({
        where,
        attributes: ['departmentId', [literal('COUNT(*)'), 'count']],
        include: [{ model: Department, attributes: ['name'] }],
        group: ['departmentId'],
        raw: true
      }),
      Registration.findAll({
        where,
        attributes: ['activityId', [literal('COUNT(*)'), 'count']],
        include: [{ model: Activity, attributes: ['title'] }],
        group: ['activityId'],
        limit: 10,
        order: [[literal('COUNT(*)'), 'DESC']],
        raw: true
      })
    ]);

    const totalRegistrations = await Registration.count({ where });

    res.success({
      totalRegistrations,
      byStatus,
      byDepartment,
      byActivity
    });
  } catch (error) {
    next(error);
  }
};
