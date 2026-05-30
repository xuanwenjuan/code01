import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import CultivationBatch from './CultivationBatch';
import StrainCategory from './StrainCategory';
import User from './User';

class LossStatisticModel extends Model {
  public id!: number;
  public batchId!: number;
  public batchCode!: string;
  public categoryId!: number;
  public lossType!: 'qc_failed' | 'contamination' | 'abnormal' | 'other';
  public lossQuantity!: number;
  public lossReason!: string;
  public lossDate!: Date;
  public recordedBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly batch?: CultivationBatch;
  public readonly category?: StrainCategory;
  public readonly recorder?: User;
}

LossStatisticModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    batchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'batch_id',
      references: {
        model: 'cultivation_batches',
        key: 'id'
      }
    },
    batchCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'batch_code'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'strain_categories',
        key: 'id'
      }
    },
    lossType: {
      type: DataTypes.ENUM('qc_failed', 'contamination', 'abnormal', 'other'),
      allowNull: false,
      field: 'loss_type'
    },
    lossQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'loss_quantity',
      defaultValue: 0
    },
    lossReason: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'loss_reason'
    },
    lossDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'loss_date'
    },
    recordedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'recorded_by',
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'LossStatistic',
    tableName: 'loss_statistics',
    indexes: [
      { fields: ['batch_id'] },
      { fields: ['category_id'] },
      { fields: ['loss_type'] },
      { fields: ['loss_date'] },
      { fields: ['recorded_by'] }
    ]
  }
);

LossStatisticModel.belongsTo(CultivationBatch, {
  as: 'batch',
  foreignKey: 'batchId'
});

LossStatisticModel.belongsTo(StrainCategory, {
  as: 'category',
  foreignKey: 'categoryId'
});

LossStatisticModel.belongsTo(User, {
  as: 'recorder',
  foreignKey: 'recordedBy'
});

export default LossStatisticModel;
