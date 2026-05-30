import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';

export interface PatientAttributes {
  id?: number;
  name: string;
  gender: 'male' | 'female';
  birthDate?: Date;
  phone: string;
  idCard?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: string;
  allergyHistory?: string;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Patient extends Model<PatientAttributes> implements PatientAttributes {
  public id!: number;
  public name!: string;
  public gender!: 'male' | 'female';
  public birthDate?: Date;
  public phone!: string;
  public idCard?: string;
  public address?: string;
  public emergencyContact?: string;
  public emergencyPhone?: string;
  public medicalHistory?: string;
  public allergyHistory?: string;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Patient.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '姓名',
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
      comment: '性别',
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '出生日期',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '手机号',
    },
    idCard: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '身份证号',
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '地址',
    },
    emergencyContact: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '紧急联系人',
    },
    emergencyPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '紧急联系电话',
    },
    medicalHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '既往病史',
    },
    allergyHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '过敏史',
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
  },
  {
    sequelize,
    modelName: 'Patient',
    tableName: 'patients',
  }
);

export default Patient;
