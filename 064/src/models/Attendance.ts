import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';
import { AttendanceStatus } from '../types';

export class Attendance extends Model {
  public id!: number;
  public lessonId!: number;
  public studentId!: number;
  public classId!: number;
  public status!: AttendanceStatus;
  public checkInTime!: Date | null;
  public checkOutTime!: Date | null;
  public leaveReason!: string;
  public remark!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attendance.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    lessonId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '课时ID'
    },
    studentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '学员ID'
    },
    classId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '班级ID'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AttendanceStatus)),
      allowNull: false,
      defaultValue: AttendanceStatus.PRESENT,
      comment: '考勤状态'
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '签到时间'
    },
    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '签退时间'
    },
    leaveReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '请假原因'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'attendances',
    modelName: 'Attendance',
    timestamps: true,
    indexes: [
      { fields: ['lessonId'] },
      { fields: ['studentId'] },
      { fields: ['classId'] },
      { fields: ['status'] }
    ]
  }
);
