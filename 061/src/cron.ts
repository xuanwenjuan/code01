import cron from 'node-cron';
import { Op, Transaction } from 'sequelize';
import Appointment from './models/Appointment';
import TreatmentRecord from './models/TreatmentRecord';
import sequelize from './database';
import { AppointmentStatus } from './types';
import logger from './utils/logger';

export const initCronJobs = () => {
  logger.info('初始化定时任务...');

  cron.schedule('0 */30 * * * *', async () => {
    logger.info('执行预约超时自动取消任务...');
    const t: Transaction = await sequelize.transaction();
    
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const pendingToCancel = await Appointment.findAll({
        where: {
          status: AppointmentStatus.PENDING,
          createdAt: { [Op.lte]: thirtyMinutesAgo },
        },
        transaction: t,
      });

      if (pendingToCancel.length > 0) {
        await Appointment.update(
          { 
            status: AppointmentStatus.CANCELLED,
            cancelReason: '预约超时未确认，系统自动取消'
          },
          {
            where: {
              id: { [Op.in]: pendingToCancel.map(a => a.id) },
            },
            transaction: t,
          }
        );
        logger.info(`自动取消了 ${pendingToCancel.length} 个超时未确认的预约`);
      }

      await t.commit();
    } catch (error) {
      await t.rollback();
      logger.error('预约超时自动取消任务失败:', error);
    }
  });

  cron.schedule('0 0 22 * * *', async () => {
    logger.info('执行每日预约未到诊标记任务...');
    const t: Transaction = await sequelize.transaction();
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await Appointment.update(
        { status: AppointmentStatus.NO_SHOW },
        {
          where: {
            appointmentDate: { [Op.lt]: today },
            status: {
              [Op.in]: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.CHECKED_IN],
            },
          },
          transaction: t,
        }
      );

      logger.info(`标记了 ${result[0]} 个过期预约为未到诊`);
      await t.commit();
    } catch (error) {
      await t.rollback();
      logger.error('每日预约未到诊标记任务失败:', error);
    }
  });

  cron.schedule('0 0 23 * * *', async () => {
    logger.info('执行每日诊疗中未完成的预约自动完成任务...');
    const t: Transaction = await sequelize.transaction();
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const inProgressAppointments = await Appointment.findAll({
        where: {
          appointmentDate: { [Op.lt]: today },
          status: AppointmentStatus.IN_PROGRESS,
        },
        transaction: t,
      });

      for (const appointment of inProgressAppointments) {
        const hasRecord = await TreatmentRecord.count({
          where: { appointmentId: appointment.id },
          transaction: t,
        });

        if (hasRecord === 0) {
          await TreatmentRecord.create({
            patientId: appointment.patientId,
            appointmentId: appointment.id,
            doctorId: appointment.doctorId,
            chiefComplaint: appointment.chiefComplaint,
            recordNo: `REC${Date.now()}${Math.floor(Math.random() * 1000)}`,
            remark: '系统自动完成诊疗记录',
          }, { transaction: t });
        }

        await appointment.update({
          status: AppointmentStatus.COMPLETED,
          endTime: new Date(),
        }, { transaction: t });
      }

      logger.info(`自动完成了 ${inProgressAppointments.length} 个进行中的诊疗预约`);
      await t.commit();
    } catch (error) {
      await t.rollback();
      logger.error('每日诊疗中未完成的预约自动完成任务失败:', error);
    }
  });

  logger.info('定时任务初始化完成');
};
