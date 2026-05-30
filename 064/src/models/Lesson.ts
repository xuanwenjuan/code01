import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export class Lesson extends Model {
  public id!: number;
  public classId!: number;
  public teacherId!: number;
  public majorId!: number;
  public title!: string;
  public content!: string;
  public lessonDate!: Date;
  public startTime!: string;
  public endTime!: string;
  public duration!: number;
  public classroom!: string;
  public isCompleted!: boolean;
  public remark!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lesson.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    classId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '班级ID'
    },
    teacherId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '讲师ID'
    },
    majorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '专业ID'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '课程标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '课程内容'
    },
    lessonDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '上课日期'
    },
    startTime: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '开始时间 HH:mm'
    },
    endTime: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '结束时间 HH:mm'
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '课时数'
    },
    classroom: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '教室'
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否已完成'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'lessons',
    modelName: 'Lesson',
    timestamps: true,
    indexes: [
      { fields: ['classId'] },
      { fields: ['teacherId'] },
      { fields: ['lessonDate'] },
      { fields: ['isCompleted'] }
    ]
  }
);
