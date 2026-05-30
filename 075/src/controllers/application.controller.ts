
import { Request, Response, NextFunction } from 'express';
import { AssetApplication, Asset, User, sequelize } from '../models';
import { 
  successResponse, 
  paginatedResponse, 
  NotFoundError, 
  BadRequestError,
  ForbiddenError
} from '../utils/response';
import { commonValidators, applicationValidators } from '../utils/validation';
import { validateRequest } from '../middleware/error.middleware';
import { 
  ApplicationStatus, 
  ApplicationType, 
  AssetStatus, 
  OperationType,
  UserRole
} from '../types';
import OperationLogService from '../services/operationLog.service';
import LocationSyncService from '../services/locationSync.service';
import { Op } from 'sequelize';

export const applicationValidationRules = {
  create: [
    applicationValidators.type,
    applicationValidators.assetId,
    applicationValidators.targetDepartment,
    applicationValidators.reason,
    applicationValidators.expectedReturnDate,
    validateRequest
  ],
  approve: [
    commonValidators.id,
    applicationValidators.status,
    applicationValidators.approvalRemark,
    validateRequest
  ],
  batchApprove: [
    applicationValidators.applicationIds,
    applicationValidators.batchStatus,
    applicationValidators.approvalRemark,
    validateRequest
  ],
  complete: [
    commonValidators.id,
    validateRequest
  ],
  cancel: [
    commonValidators.id,
    validateRequest
  ],
  getList: [
    commonValidators.page,
    commonValidators.pageSize,
    commonValidators.keyword,
    validateRequest
  ],
  getDetail: [
    commonValidators.id,
    validateRequest
  ]
};

const getNextAssetStatus = (applicationType: ApplicationType, currentStatus: AssetStatus): AssetStatus => {
  switch (applicationType) {
    case ApplicationType.RECEIVE:
      return AssetStatus.IN_USE;
    case ApplicationType.TRANSFER:
      return AssetStatus.IN_USE;
    case ApplicationType.RETURN:
      return AssetStatus.IDLE;
    case ApplicationType.REPAIR:
      return AssetStatus.IN_REPAIR;
    default:
      return currentStatus;
  }
};

const validateApplicationType = (applicationType: ApplicationType, assetStatus: AssetStatus): boolean => {
  switch (applicationType) {
    case ApplicationType.RECEIVE:
    case ApplicationType.TRANSFER:
      return assetStatus === AssetStatus.IDLE || assetStatus === AssetStatus.IN_USE;
    case ApplicationType.RETURN:
    case ApplicationType.REPAIR:
      return assetStatus === AssetStatus.IN_USE;
    default:
      return false;
  }
};

export const createApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { type, assetId, targetDepartment, reason, expectedReturnDate } = req.body;
    const applicantId = req.user!.userId;

    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      throw new NotFoundError('资产不存在');
    }

    if (asset.status === AssetStatus.SCRAPPED) {
      throw new BadRequestError('资产已报废，无法申请');
    }

    if (!validateApplicationType(type, asset.status)) {
      throw new BadRequestError('当前资产状态不支持此申请类型');
    }

    const pendingApplication = await AssetApplication.findOne({
      where: {
        assetId,
        status: ApplicationStatus.PENDING
      }
    });
    if (pendingApplication) {
      throw new BadRequestError('该资产已有待审批的申请');
    }

    const applicationNo = `APPLY-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const application = await AssetApplication.create(
      {
        applicationNo,
        type,
        assetId,
        applicantId,
        applicantDepartment: req.user!.department,
        targetDepartment,
        reason,
        expectedReturnDate,
        status: ApplicationStatus.PENDING
      },
      { transaction }
    );

    await OperationLogService.logApplicationOperation(
      req,
      OperationType.CREATE,
      application.id,
      application.applicationNo,
      '创建资产申请',
      'success'
    );

    await transaction.commit();
    successResponse(res, application, '申请创建成功', 201);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const approveApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, approvalRemark } = req.body;
    const approverId = req.user!.userId;

    const application = await AssetApplication.findByPk(id);
    if (!application) {
      throw new NotFoundError('申请不存在');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestError('只能审批待审批的申请');
    }

    const asset = await Asset.findByPk(application.assetId);
    if (!asset) {
      throw new NotFoundError('关联资产不存在');
    }

    if (status === ApplicationStatus.APPROVED) {
      const nextStatus = getNextAssetStatus(application.type, asset.status);
      const updateData: any = { status: nextStatus };

      if (application.type === ApplicationType.RECEIVE) {
        updateData.department = req.user!.department;
        updateData.responsiblePerson = req.user!.realName;
        
        const locationResult = LocationSyncService.syncLocationByDepartment(
          req.user!.department,
          asset.storageLocation
        );
        if (locationResult.isChanged) {
          updateData.storageLocation = locationResult.location;
        }
      } else if (application.type === ApplicationType.TRANSFER && application.targetDepartment) {
        updateData.department = application.targetDepartment;
        
        const locationResult = LocationSyncService.syncLocationByDepartment(
          application.targetDepartment,
          asset.storageLocation
        );
        if (locationResult.isChanged) {
          updateData.storageLocation = locationResult.location;
        }
      } else if (application.type === ApplicationType.RETURN) {
        updateData.department = null;
        updateData.responsiblePerson = null;
      }

      await asset.update(updateData, { transaction });

      await OperationLogService.logAssetOperation(
        req,
        OperationType.APPROVE,
        asset.id,
        asset.name,
        `申请${application.type}已批准，资产状态变更为${nextStatus}`,
        'success'
      );
    }

    await application.update(
      {
        status,
        approverId,
        approvalRemark,
        approvalTime: new Date()
      },
      { transaction }
    );

    await OperationLogService.logApplicationOperation(
      req,
      OperationType.APPROVE,
      application.id,
      application.applicationNo,
      `申请已${status === ApplicationStatus.APPROVED ? '批准' : '驳回'}`,
      'success'
    );

    await transaction.commit();
    successResponse(res, application, `申请已${status === ApplicationStatus.APPROVED ? '批准' : '驳回'}`);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const batchApproveApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { applicationIds, status, approvalRemark } = req.body;
    const approverId = req.user!.userId;

    const applications = await AssetApplication.findAll({
      where: {
        id: { [Op.in]: applicationIds },
        status: ApplicationStatus.PENDING
      },
      include: [{ model: Asset, as: 'asset' }]
    });

    if (applications.length === 0) {
      throw new BadRequestError('没有可审批的申请');
    }

    const assetIdMap = new Map();
    for (const app of applications) {
      if (app.asset) {
        assetIdMap.set(app.assetId, app.asset);
      }
    }

    for (const application of applications) {
      const asset = assetIdMap.get(application.assetId);
      
      if (status === ApplicationStatus.APPROVED && asset) {
        const nextStatus = getNextAssetStatus(application.type, asset.status);
        const updateData: any = { status: nextStatus };

        if (application.type === ApplicationType.RECEIVE) {
          updateData.department = req.user!.department;
          updateData.responsiblePerson = req.user!.realName;
          
          const locationResult = LocationSyncService.syncLocationByDepartment(
            req.user!.department,
            asset.storageLocation
          );
          if (locationResult.isChanged) {
            updateData.storageLocation = locationResult.location;
          }
        } else if (application.type === ApplicationType.TRANSFER && application.targetDepartment) {
          updateData.department = application.targetDepartment;
          
          const locationResult = LocationSyncService.syncLocationByDepartment(
            application.targetDepartment,
            asset.storageLocation
          );
          if (locationResult.isChanged) {
            updateData.storageLocation = locationResult.location;
          }
        } else if (application.type === ApplicationType.RETURN) {
          updateData.department = null;
          updateData.responsiblePerson = null;
        }

        await asset.update(updateData, { transaction });
      }

      await application.update(
        {
          status,
          approverId,
          approvalRemark,
          approvalTime: new Date()
        },
        { transaction }
      );
    }

    await transaction.commit();
    successResponse(
      res, 
      { count: applications.length }, 
      `成功${status === ApplicationStatus.APPROVED ? '批准' : '驳回'}${applications.length}个申请`
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const completeApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const application = await AssetApplication.findByPk(id, {
      include: [{ model: Asset, as: 'asset' }]
    });
    if (!application) {
      throw new NotFoundError('申请不存在');
    }

    if (application.status !== ApplicationStatus.APPROVED) {
      throw new BadRequestError('只能完成已批准的申请');
    }

    if (application.type === ApplicationType.REPAIR && application.asset) {
      await application.asset.update(
        { status: AssetStatus.IDLE },
        { transaction }
      );

      await OperationLogService.logAssetOperation(
        req,
        OperationType.COMPLETE,
        application.asset.id,
        application.asset.name,
        '维修完成，资产状态变更为闲置',
        'success'
      );
    }

    await application.update(
      {
        status: ApplicationStatus.COMPLETED,
        completionTime: new Date()
      },
      { transaction }
    );

    await OperationLogService.logApplicationOperation(
      req,
      OperationType.COMPLETE,
      application.id,
      application.applicationNo,
      '申请已完成',
      'success'
    );

    await transaction.commit();
    successResponse(res, application, '申请已完成');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const cancelApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const application = await AssetApplication.findByPk(id);
    if (!application) {
      throw new NotFoundError('申请不存在');
    }

    if (application.applicantId !== req.user!.userId) {
      throw new ForbiddenError('只能取消自己创建的申请');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestError('只能取消待审批的申请');
    }

    await application.destroy({ transaction });

    await OperationLogService.logApplicationOperation(
      req,
      OperationType.CANCEL,
      application.id,
      application.applicationNo,
      '取消申请',
      'success'
    );

    await transaction.commit();
    successResponse(res, null, '申请已取消');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getApplicationList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, pageSize = 20, keyword, type, status } = req.query;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const user = req.user!;
    if (user.role === UserRole.GENERAL_USER) {
      where.applicantId = user.userId;
    } else if (user.role === UserRole.DEPARTMENT_HEAD && user.department) {
      where[Op.or] = [
        { applicantId: user.userId },
        { applicantDepartment: user.department }
      ];
    }

    const { count, rows } = await AssetApplication.findAndCountAll({
      where,
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetCode', 'name', 'status']
        },
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'realName', 'department']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'username', 'realName']
        }
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']]
    });

    paginatedResponse(res, rows, count, Number(page), Number(pageSize), '查询成功');
  } catch (error) {
    next(error);
  }
};

export const getApplicationDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await AssetApplication.findByPk(id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetCode', 'name', 'status']
        },
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'realName', 'department']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'username', 'realName']
        }
      ]
    });

    if (!application) {
      throw new NotFoundError('申请不存在');
    }

    successResponse(res, application);
  } catch (error) {
    next(error);
  }
};

export const getApplicationStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const where: any = {};

    if (user.role === UserRole.GENERAL_USER) {
      where.applicantId = user.userId;
    } else if (user.role === UserRole.DEPARTMENT_HEAD && user.department) {
      where.applicantDepartment = user.department;
    }

    const [totalApplications, typeStats, statusStats] = await Promise.all([
      AssetApplication.count({ where }),
      AssetApplication.findAll({
        where,
        attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['type']
      }),
      AssetApplication.findAll({
        where,
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['status']
      })
    ]);

    const typeMap: any = {};
    typeStats.forEach((t: any) => {
      typeMap[t.type] = t.dataValues.count;
    });

    const statusMap: any = {};
    statusStats.forEach((s: any) => {
      statusMap[s.status] = s.dataValues.count;
    });

    const statistics = {
      totalApplications,
      typeBreakdown: {
        receive: typeMap[ApplicationType.RECEIVE] || 0,
        transfer: typeMap[ApplicationType.TRANSFER] || 0,
        return: typeMap[ApplicationType.RETURN] || 0,
        repair: typeMap[ApplicationType.REPAIR] || 0
      },
      statusBreakdown: {
        pending: statusMap[ApplicationStatus.PENDING] || 0,
        approved: statusMap[ApplicationStatus.APPROVED] || 0,
        rejected: statusMap[ApplicationStatus.REJECTED] || 0,
        completed: statusMap[ApplicationStatus.COMPLETED] || 0
      }
    };

    successResponse(res, statistics, '统计数据获取成功');
  } catch (error) {
    next(error);
  }
};
