import { Op } from 'sequelize';
import sequelize from '../config/database';
import { MaterialStatus, ProcessStatus } from '../constants/material.constants';
import { BadRequestException, NotFoundException } from '../exceptions/base.exception';
import Material from '../models/material.model';
import ProcessRecord from '../models/process-record.model';
import InventoryLedger, { LedgerType } from '../models/inventory-ledger.model';
import User from '../models/user.model';

export interface CreateProcessDto {
  materialId: number;
  inputQuantity: number;
  processDetails?: string;
}

export interface UpdateProcessDto {
  outputQuantity?: number;
  lossQuantity?: number;
  processDetails?: string;
  qualityCheckResult?: string;
  isQualified?: boolean;
}

const StatusTransitionRules: Record<ProcessStatus, ProcessStatus[]> = {
  [ProcessStatus.PENDING_SELECTION]: [ProcessStatus.SELECTING, ProcessStatus.FAILED],
  [ProcessStatus.SELECTING]: [ProcessStatus.SELECTED, ProcessStatus.FAILED],
  [ProcessStatus.SELECTED]: [ProcessStatus.PENDING_PROCESS, ProcessStatus.FAILED],
  [ProcessStatus.PENDING_PROCESS]: [ProcessStatus.PROCESSING, ProcessStatus.FAILED],
  [ProcessStatus.PROCESSING]: [ProcessStatus.PROCESSED, ProcessStatus.FAILED],
  [ProcessStatus.PROCESSED]: [ProcessStatus.PENDING_DRYING, ProcessStatus.FAILED],
  [ProcessStatus.PENDING_DRYING]: [ProcessStatus.DRYING, ProcessStatus.FAILED],
  [ProcessStatus.DRYING]: [ProcessStatus.DRIED, ProcessStatus.FAILED],
  [ProcessStatus.DRIED]: [ProcessStatus.PACKAGED, ProcessStatus.FAILED],
  [ProcessStatus.PACKAGED]: [],
  [ProcessStatus.FAILED]: [],
};

class ProcessService {
  private validateStatusTransition(currentStatus: ProcessStatus, targetStatus: ProcessStatus): boolean {
    const allowedTransitions = StatusTransitionRules[currentStatus];
    return allowedTransitions.includes(targetStatus);
  }

  async create(createDto: CreateProcessDto, userId: number): Promise<ProcessRecord> {
    const material = await Material.findByPk(createDto.materialId);
    if (!material) {
      throw new NotFoundException('原料不存在');
    }

    if (material.quantity < createDto.inputQuantity) {
      throw new BadRequestException('原料库存不足');
    }

    if (material.status === MaterialStatus.ISOLATED) {
      throw new BadRequestException('该批次已被隔离，无法加工');
    }

    if (material.status === MaterialStatus.PROCESSING) {
      throw new BadRequestException('该批次正在加工中');
    }

    const existingProcess = await ProcessRecord.findOne({
      where: { 
        materialId: createDto.materialId,
        status: { [Op.notIn]: [ProcessStatus.PACKAGED, ProcessStatus.FAILED] }
      }
    });
    if (existingProcess) {
      throw new BadRequestException('该原料已有未完成的加工记录');
    }

    return await sequelize.transaction(async (t) => {
      const record = await ProcessRecord.create(
        {
          ...createDto,
          batchNo: material.batchNo,
          status: ProcessStatus.PENDING_SELECTION,
          operatorId: userId,
        },
        { transaction: t }
      );

      await material.update(
        { status: MaterialStatus.PROCESSING },
        { transaction: t }
      );

      return record;
    });
  }

  async findAll(status?: ProcessStatus, materialId?: number): Promise<ProcessRecord[]> {
    const where: any = {};
    if (status) where.status = status;
    if (materialId) where.materialId = materialId;

    return await ProcessRecord.findAll({
      where,
      include: [
        { model: Material, as: 'material', attributes: ['id', 'name', 'batchNo', 'status'] },
        { model: User, as: 'operator', attributes: ['id', 'username', 'realName'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: number): Promise<ProcessRecord> {
    const record = await ProcessRecord.findByPk(id, {
      include: [
        { model: Material, as: 'material' },
        { model: User, as: 'operator', attributes: ['id', 'username', 'realName'] },
      ],
    });
    if (!record) {
      throw new NotFoundException('加工记录不存在');
    }
    return record;
  }

  async updateStatus(id: number, status: ProcessStatus, userId: number): Promise<ProcessRecord> {
    const record = await this.findOne(id);

    if (record.status === ProcessStatus.PACKAGED || record.status === ProcessStatus.FAILED) {
      throw new BadRequestException('该加工记录已完成或失败，无法更新状态');
    }

    if (!this.validateStatusTransition(record.status, status)) {
      throw new BadRequestException(`不允许从 ${record.status} 状态转换到 ${status} 状态`);
    }

    return await sequelize.transaction(async (t) => {
      if (status === ProcessStatus.FAILED) {
        await Material.update(
          { 
            status: MaterialStatus.FAILED,
            isLocked: true,
            lockReason: '炮制不合格自动锁定',
            lockedAt: new Date(),
            lockedBy: userId,
          },
          { where: { id: record.materialId }, transaction: t }
        );
      }

      if (status === ProcessStatus.PACKAGED) {
        if (!record.outputQuantity) {
          throw new BadRequestException('请先设置产出数量');
        }

        await Material.update(
          {
            quantity: record.outputQuantity,
            status: MaterialStatus.PROCESSED,
          },
          { where: { id: record.materialId }, transaction: t }
        );

        const lossQuantity = record.lossQuantity || record.inputQuantity - record.outputQuantity;
        await InventoryLedger.create(
          {
            categoryId: record.material!.categoryId,
            materialId: record.materialId,
            batchNo: record.batchNo,
            type: LedgerType.PROCESS_LOSS,
            quantity: lossQuantity,
            beforeQuantity: record.inputQuantity,
            afterQuantity: record.outputQuantity,
            operatorId: userId,
            remarks: '加工损耗',
          },
          { transaction: t }
        );
      }

      const updateData: any = { status };
      if (status === ProcessStatus.SELECTING && !record.startAt) {
        updateData.startAt = new Date();
      }
      if (status === ProcessStatus.PACKAGED) {
        updateData.endAt = new Date();
      }

      await record.update(updateData, { transaction: t });
      return record;
    });
  }

  async updateProcessDetails(id: number, updateDto: UpdateProcessDto, userId: number): Promise<ProcessRecord> {
    const record = await this.findOne(id);
    await record.update(updateDto);
    return record;
  }

  async getProcessChain(materialId: number): Promise<ProcessRecord[]> {
    return await ProcessRecord.findAll({
      where: { materialId },
      include: [{ model: User, as: 'operator', attributes: ['id', 'username', 'realName'] }],
      order: [['createdAt', 'ASC']],
    });
  }
}

export default new ProcessService();
