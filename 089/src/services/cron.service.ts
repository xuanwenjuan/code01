import cron from 'node-cron';
import logger from '../config/logger';
import MotherStrain from '../models/MotherStrain';
import { MotherStrainStatus, Op } from '../types';

class CronService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  startAllTasks() {
    this.startViabilityWarningTask();
    logger.info('所有定时任务已启动');
  }

  private startViabilityWarningTask() {
    const task = cron.schedule('0 9 * * *', async () => {
      try {
        logger.info('执行菌种活性到期预警检查...');
        
        const now = new Date();
        const warningDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const expiringStrains = await MotherStrain.findAll({
          where: {
            viabilityDate: { [Op.lte]: warningDate },
            status: { [Op.in]: [MotherStrainStatus.BREEDING, MotherStrainStatus.DORMANT] },
            warningSent: false
          }
        });

        if (expiringStrains.length > 0) {
          logger.warn(`发现 ${expiringStrains.length} 个菌种即将到期：`);
          expiringStrains.forEach(strain => {
            logger.warn(`  - ${strain.strainName} (${strain.strainCode})：${strain.viabilityDate.toISOString().split('T')[0]}`);
          });

          await MotherStrain.update(
            { warningSent: true },
            { where: { id: { [Op.in]: expiringStrains.map(s => s.id) } } }
          );
        }

        logger.info('菌种活性到期预警检查完成');
      } catch (error) {
        logger.error('菌种活性到期预警任务执行失败:', error);
      }
    });

    this.tasks.set('viabilityWarning', task);
    logger.info('菌种活性到期预警任务已启动（每天上午9点执行）');
  }

  stopAllTasks() {
    this.tasks.forEach((task, name) => {
      task.stop();
      logger.info(`定时任务 ${name} 已停止`);
    });
    this.tasks.clear();
  }
}

export default new CronService();