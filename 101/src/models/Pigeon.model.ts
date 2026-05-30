import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { PigeonType, PigeonStatus } from '../constants/enum';

export interface PigeonAttributes {
  id?: number;
  ringNumber: string;
  name?: string;
  categoryId: number;
  type: PigeonType;
  status: PigeonStatus;
  gender: 'MALE' | 'FEMALE';
  birthDate?: Date;
  age?: number;
  generation?: string;
  fatherId?: number;
  motherId?: number;
  bloodline?: string;
  featherColor?: string;
  eyeColor?: string;
  loftId?: number;
  healthStatus?: string;
  lastDewormingDate?: Date;
  nextDewormingDate?: Date;
  lastVaccinationDate?: Date;
  nextVaccinationDate?: Date;
  racingResults?: string;
  breedingCount?: number;
  remarks?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Pigeon extends Model<PigeonAttributes> implements PigeonAttributes {
  public id!: number;
  public ringNumber!: string;
  public name?: string;
  public categoryId!: number;
  public type!: PigeonType;
  public status!: PigeonStatus;
  public gender!: 'MALE' | 'FEMALE';
  public birthDate?: Date;
  public age?: number;
  public generation?: string;
  public fatherId?: number;
  public motherId?: number;
  public bloodline?: string;
  public featherColor?: string;
  public eyeColor?: string;
  public loftId?: number;
  public healthStatus?: string;
  public lastDewormingDate?: Date;
  public nextDewormingDate?: Date;
  public lastVaccinationDate?: Date;
  public nextVaccinationDate?: Date;
  public racingResults?: string;
  public breedingCount?: number;
  public remarks?: string;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Pigeon.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    ringNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(...Object.values(PigeonType)),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PigeonStatus)),
      allowNull: false,
      defaultValue: PigeonStatus.IN_LOFT
    },
    gender: {
      type: DataTypes.ENUM('MALE', 'FEMALE'),
      allowNull: false
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    age: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    generation: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fatherId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    motherId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    bloodline: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    featherColor: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    eyeColor: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    loftId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    healthStatus: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    lastDewormingDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextDewormingDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastVaccinationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextVaccinationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    racingResults: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    breedingCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'pigeons',
    modelName: 'Pigeon',
    timestamps: true
  }
);

export default Pigeon;
