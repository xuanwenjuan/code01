import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum BatchStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

class BenefitBatch extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public festival!: string;
  public startDate!: Date;
  public endDate!: Date;
  public claimDeadline!: Date;
  public budget!: number;
  public quotaPerPerson!: number;
  public description!: string | null;
  public status!: BatchStatus;
  public isArchived!: number;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BenefitBatch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '批次名称'
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '批次编码'
    },
    festival: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '节日名称'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '发放开始日期'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '发放结束日期'
    },
    claimDeadline: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '申领截止日期'
    },
    budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '预算金额'
    },
    quotaPerPerson: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '每人申领名额限制'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '描述'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BatchStatus)),
      defaultValue: BatchStatus.DRAFT,
      comment: '状态：draft草稿，published已发布，in_progress发放中，completed已完成，cancelled已取消'
    },
    isArchived: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '是否已归档：1是，0否'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '创建人ID'
    }
  },
  {
    sequelize,
    modelName: 'BenefitBatch',
    tableName: 'benefit_batches',
    comment: '福利发放批次表'
  }
);

export default BenefitBatch;
