import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { BatchStatus } from '../types';
import MotherStrain from './MotherStrain';
import User from './User';

class CultivationBatch extends Model {
  public id!: number;
  public batchCode!: string;
  public motherStrainId!: number;
  public cultivatorId!: number;
  public inoculationDate!: Date;
  public quantity!: number;
  public temperature!: number;
  public humidity!: number;
  public status!: BatchStatus;
  public qcInspectorId!: number | null;
  public qcDate!: Date | null;
  public qcResult!: string | null;
  public qcRemark!: string | null;
  public packagedQuantity!: number | null;
  public packagedDate!: Date | null;
  public shippedQuantity!: number | null;
  public shippedDate!: Date | null;
  public orderNo!: string | null;
  public isAbnormal!: boolean;
  public abnormalReason!: string | null;
  public remark!: string | null;
  public readonly motherStrain?: MotherStrain;
  public readonly cultivator?: User;
  public readonly qcInspector?: User;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CultivationBatch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    batchCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'batch_code'
    },
    motherStrainId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'mother_strain_id',
      references: {
        model: MotherStrain,
        key: 'id'
      }
    },
    cultivatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'cultivator_id',
      references: {
        model: User,
        key: 'id'
      }
    },
    inoculationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'inoculation_date'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    temperature: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    humidity: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BatchStatus)),
      allowNull: false,
      defaultValue: BatchStatus.INOCULATED
    },
    qcInspectorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'qc_inspector_id',
      references: {
        model: User,
        key: 'id'
      }
    },
    qcDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'qc_date'
    },
    qcResult: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'qc_result'
    },
    qcRemark: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'qc_remark'
    },
    packagedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'packaged_quantity'
    },
    packagedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'packaged_date'
    },
    shippedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'shipped_quantity'
    },
    shippedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'shipped_date'
    },
    orderNo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'order_no'
    },
    isAbnormal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_abnormal'
    },
    abnormalReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'abnormal_reason'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'CultivationBatch',
    tableName: 'cultivation_batches'
  }
);

CultivationBatch.belongsTo(MotherStrain, {
  as: 'motherStrain',
  foreignKey: 'motherStrainId'
});

CultivationBatch.belongsTo(User, {
  as: 'cultivator',
  foreignKey: 'cultivatorId'
});

CultivationBatch.belongsTo(User, {
  as: 'qcInspector',
  foreignKey: 'qcInspectorId'
});

export default CultivationBatch;