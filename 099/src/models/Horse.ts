import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';
import { HorseStatus } from '../constants';

export interface HorseAttributes {
  id?: number;
  horseNo: string;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  weight?: number;
  trainingLevel: number;
  status: HorseStatus;
  stableId?: number;
  dailyRationStandard?: string;
  lastVaccinationDate?: Date;
  nextVaccinationDate?: Date;
  trainerId?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Horse extends Model<HorseAttributes> implements HorseAttributes {
  public id!: number;
  public horseNo!: string;
  public name!: string;
  public breed!: string;
  public age!: number;
  public gender!: 'male' | 'female';
  public weight?: number;
  public trainingLevel!: number;
  public status!: HorseStatus;
  public stableId?: number;
  public dailyRationStandard?: string;
  public lastVaccinationDate?: Date;
  public nextVaccinationDate?: Date;
  public trainerId?: number;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Horse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    horseNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '马匹编号'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '马匹名称'
    },
    breed: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '品系'
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '年龄'
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
      comment: '性别'
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '体重(kg)'
    },
    trainingLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '驯养等级'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(HorseStatus)),
      defaultValue: HorseStatus.HEALTHY,
      comment: '状态: healthy-健康, resting-休养, racing-参赛, sick-生病'
    },
    stableId: {
      type: DataTypes.INTEGER,
      comment: '所属马舍ID'
    },
    dailyRationStandard: {
      type: DataTypes.TEXT,
      comment: '日粮标准'
    },
    lastVaccinationDate: {
      type: DataTypes.DATE,
      comment: '上次防疫日期'
    },
    nextVaccinationDate: {
      type: DataTypes.DATE,
      comment: '下次防疫日期'
    },
    trainerId: {
      type: DataTypes.INTEGER,
      comment: '驯养员ID'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'Horse',
    tableName: 'horses',
    indexes: [
      { fields: ['horseNo'], unique: true },
      { fields: ['status'] },
      { fields: ['stableId'] },
      { fields: ['trainerId'] },
      { fields: ['nextVaccinationDate'] }
    ]
  }
);

export default Horse;
