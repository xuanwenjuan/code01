import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';
import { StudentStatus } from '../types';

export class Student extends Model {
  public id!: number;
  public userId!: number | null;
  public name!: string;
  public phone!: string;
  public idCard!: string;
  public gender!: 'male' | 'female';
  public birthday!: Date;
  public status!: StudentStatus;
  public avatar!: string;
  public email!: string;
  public address!: string;
  public education!: string;
  public remark!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Student.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '关联用户ID'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '学员姓名'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '联系电话'
    },
    idCard: {
      type: DataTypes.STRING(18),
      allowNull: true,
      comment: '身份证号'
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: true,
      comment: '性别'
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '生日'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(StudentStatus)),
      allowNull: false,
      defaultValue: StudentStatus.REGISTERED,
      comment: '状态'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱'
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '地址'
    },
    education: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '学历'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'students',
    modelName: 'Student',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['phone'] },
      { fields: ['status'] }
    ]
  }
);
