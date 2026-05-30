import cron from 'node-cron';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import Supplier from '../models/Supplier';
import BenefitBatch, { BatchStatus } from '../models/BenefitBatch';
import BenefitClaim, { ClaimStatus } from '../models/BenefitClaim';
import BenefitProduct from '../models/BenefitProduct';
import logger from '../utils/logger';

export const initCronJobs = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      logger.info('Running: Check expiring supplier qualifications');
      
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      
      const expiringSuppliers = await Supplier.findAll({
        where: {
          qualificationExpireDate: {
            [Op.between]: [new Date(), thirtyDaysLater]
          },
          status: 1
        }
      });
      
      logger.info(`Found ${expiringSuppliers.length} suppliers with expiring qualifications`);
    } catch (error) {
      logger.error('Error checking expiring suppliers:', error);
    }
  });

  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running: Update batch status');
      
      const today = new Date();
      
      await BenefitBatch.update(
        { status: BatchStatus.IN_PROGRESS },
        {
          where: {
            status: BatchStatus.PUBLISHED,
            startDate: { [Op.lte]: today },
            endDate: { [Op.gte]: today }
          }
        }
      );
      
      await BenefitBatch.update(
        { status: BatchStatus.COMPLETED },
        {
          where: {
            status: BatchStatus.IN_PROGRESS,
            endDate: { [Op.lt]: today }
          }
        }
      );
      
      logger.info('Batch status updated successfully');
    } catch (error) {
      logger.error('Error updating batch status:', error);
    }
  });

  cron.schedule('0 2 * * *', async () => {
    const t: Transaction = await sequelize.transaction();
    try {
      logger.info('Running: Archive expired batches and settle unclaimed benefits');
      
      const today = new Date();
      const archiveDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const batchesToArchive = await BenefitBatch.findAll({
        where: {
          endDate: { [Op.lt]: archiveDate },
          isArchived: 0
        },
        transaction: t
      });

      for (const batch of batchesToArchive) {
        const pendingClaims = await BenefitClaim.findAll({
          where: {
            batchId: batch.id,
            status: { [Op.in]: [ClaimStatus.PENDING, ClaimStatus.APPROVED] }
          },
          transaction: t
        });

        for (const claim of pendingClaims) {
          if (claim.status === ClaimStatus.PENDING) {
            await claim.update({ status: ClaimStatus.CANCELLED }, { transaction: t });
            
            const product = await BenefitProduct.findByPk(claim.productId, { transaction: t });
            if (product) {
              await product.increment('stock', { by: claim.quantity, transaction: t });
            }
          }
        }

        const allClaims = await BenefitClaim.findAll({
          where: { batchId: batch.id },
          transaction: t
        });

        const totalClaimed = allClaims.filter(c => c.status !== ClaimStatus.CANCELLED).length;
        const totalAmount = allClaims
          .filter(c => c.status !== ClaimStatus.CANCELLED)
          .reduce((sum, c) => sum + Number(c.totalAmount), 0);

        await batch.update({ isArchived: 1 }, { transaction: t });

        logger.info(`Batch archived: ID=${batch.id}, Name=${batch.name}, TotalClaimed=${totalClaimed}, TotalAmount=${totalAmount}`);
      }

      await t.commit();
      logger.info('Batch archiving completed successfully');
    } catch (error) {
      await t.rollback();
      logger.error('Error archiving batches:', error);
    }
  });

  logger.info('Cron jobs initialized');
};
