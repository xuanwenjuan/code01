import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';
import { ClassStatus } from '../types';

export class Class extends Model {
  public id!: number;
  public name!: string;
  public majorId!: number;
  public teacherId!: number;
  public maxStudents!: number;
  public currentStudents!: number;
  public status!: ClassStatus;
  public startDate!: Date;
  public endDate!: Date;
  public totalHours!: number;
  public completedHours!: number;
  public classroom!: string;
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Class.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '班级名称'
    },
    majorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '专业ID'
    },
    teacherId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '讲师ID'
    },
    maxStudents: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 30,
      comment: '最大人数'
    },
    currentStudents: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '当前人数'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ClassStatus)),
      allowNull: false,
      defaultValue: ClassStatus.PREPARING,
      comment: '班级状态'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '开班日期'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '结课日期'
    },
    totalHours: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '总课时'
    },
    completedHours: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '已完成课时'
    },
    classroom: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '教室'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '班级描述'
    }
  },
  {
    sequelize,
    tableName: 'classes',
    modelName: 'Class',
    timestamps: true,
    indexes: [
      { fields: ['majorId'] },
      { fields: ['teacherId'] },
      { fields: ['status'] }
    ]
  }
);
