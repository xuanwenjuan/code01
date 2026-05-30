import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import StrainCategory from './StrainCategory';
import User from './User';

class TraceabilityRecord extends Model {
  public id!: number;
  public recordCode!: string;
  public categoryId!: number;
  public periodStart!: Date;
  public periodEnd!: Date;
  public totalBatches!: number;
  public totalQuantity!: number;
  public scrappedQuantity!: number;
  public qcPassedCount!: number;
  public qcFailedCount!: number;
  public qcPassRate!: number;
  public totalCost!: number;
  public unitCost!: number;
  public remark!: string | null;
  public generatedBy!: number;
  public readonly category?: StrainCategory;
  public readonly generatedByUser?: User;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TraceabilityRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    recordCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'record_code'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
      references: {
        model: StrainCategory,
        key: 'id'
      }
    },
    periodStart: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'period_start'
    },
    periodEnd: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'period_end'
    },
    totalBatches: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_batches'
    },
    totalQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_quantity'
    },
    scrappedQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'scrapped_quantity'
    },
    qcPassedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'qc_passed_count'
    },
    qcFailedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'qc_failed_count'
    },
    qcPassRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      field: 'qc_pass_rate'
    },
    totalCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'total_cost'
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'unit_cost'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    generatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'generated_by'
    }
  },
  {
    sequelize,
    modelName: 'TraceabilityRecord',
    tableName: 'traceability_records'
  }
);

TraceabilityRecord.belongsTo(StrainCategory, {
  as: 'category',
  foreignKey: 'categoryId'
});

TraceabilityRecord.belongsTo(User, {
  as: 'generatedByUser',
  foreignKey: 'generatedBy'
});

export default TraceabilityRecord;