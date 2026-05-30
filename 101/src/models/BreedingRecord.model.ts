import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface BreedingRecordAttributes {
  id?: number;
  recordNo: string;
  fatherId: number;
  motherId: number;
  pairingDate: Date;
  eggCount?: number;
  hatchCount?: number;
  survivalCount?: number;
  offspringIds?: string;
  status: 'PAIRED' | 'LAYING' | 'HATCHING' | 'COMPLETED';
  operatorId?: number;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class BreedingRecord extends Model<BreedingRecordAttributes> implements BreedingRecordAttributes {
  public id!: number;
  public recordNo!: string;
  public fatherId!: number;
  public motherId!: number;
  public pairingDate!: Date;
  public eggCount?: number;
  public hatchCount?: number;
  public survivalCount?: number;
  public offspringIds?: string;
  public status!: 'PAIRED' | 'LAYING' | 'HATCHING' | 'COMPLETED';
  public operatorId?: number;
  public remarks?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BreedingRecord.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    recordNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    fatherId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    motherId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    pairingDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    eggCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    hatchCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    survivalCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    offspringIds: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('PAIRED', 'LAYING', 'HATCHING', 'COMPLETED'),
      allowNull: false,
      defaultValue: 'PAIRED'
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'breeding_records',
    modelName: 'BreedingRecord',
    timestamps: true
  }
);

export default BreedingRecord;
