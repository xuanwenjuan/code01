import cron from 'node-cron';
import { Op } from 'sequelize';
import Activity from '../models/Activity';
import Registration from '../models/Registration';
import { ActivityStatus, RegistrationStatus } from '../types';
import logger from '../config/logger';
import sequelize from '../config/database';

const updateActivityStatus = async () => {
  const t = await sequelize.transaction();
  try {
    logger.info('执行活动状态自动更新任务...');
    const now = new Date();

    const [draftUpdated] = await Activity.update(
      { status: ActivityStatus.REGISTERING },
      {
        where: {
          status: ActivityStatus.DRAFT,
          registrationStartTime: { [Op.lte]: now },
          registrationEndTime: { [Op.gt]: now }
        },
        transaction: t
      }
    );

    const [closedUpdated] = await Activity.update(
      { status: ActivityStatus.CLOSED },
      {
        where: {
          status: ActivityStatus.REGISTERING,
          registrationEndTime: { [Op.lte]: now }
        },
        transaction: t
      }
    );

    const [completedUpdated] = await Activity.update(
      { status: ActivityStatus.COMPLETED },
      {
        where: {
          status: { [Op.in]: [ActivityStatus.REGISTERING, ActivityStatus.CLOSED] },
          activityEndTime: { [Op.lte]: now }
        },
        transaction: t
      }
    );

    await Activity.update(
      { status: ActivityStatus.CLOSED },
      {
        where: {
          status: ActivityStatus.REGISTERING,
          [Op.and]: [
            sequelize.literal(`(
              SELECT COUNT(*) FROM registrations 
              WHERE registrations.activityId = Activity.id 
              AND registrations.status IN ('pending', 'approved')
            ) >= maxParticipants`)
          ]
        },
        transaction: t
      }
    );

    await t.commit();
    
    logger.info(`活动状态更新完成:
      - 开启报名: ${draftUpdated}个
      - 截止报名: ${closedUpdated}个
      - 自动完结: ${completedUpdated}个
    `);
  } catch (error) {
    await t.rollback();
    logger.error('活动状态更新任务执行失败:', error);
  }
};

const cleanupExpiredRegistrations = async () => {
  try {
    logger.info('执行过期报名记录清理任务...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [cancelledCount] = await Registration.update(
      { status: RegistrationStatus.CANCELLED },
      {
        where: {
          status: RegistrationStatus.PENDING,
          createdAt: { [Op.lte]: thirtyDaysAgo }
        }
      }
    );

    logger.info(`清理过期报名记录完成: 自动取消${cancelledCount}条待审核报名`);
  } catch (error) {
    logger.error('清理过期报名记录任务执行失败:', error);
  }
};

export const initScheduler = () => {
  cron.schedule('0 * * * *', updateActivityStatus);
  logger.info('活动状态自动更新任务已启动 (每小时执行)');

  cron.schedule('0 2 * * *', cleanupExpiredRegistrations);
  logger.info('过期报名记录清理任务已启动 (每天凌晨2点执行)');

  setTimeout(updateActivityStatus, 5000);
  logger.info('定时任务初始化完成');
};
