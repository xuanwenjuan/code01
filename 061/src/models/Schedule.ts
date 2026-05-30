import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Staff from './Staff';

export interface ScheduleAttributes {
  id?: number;
  staffId: number;
  date: Date;
  shiftType: 'morning' | 'afternoon' | 'full' | 'off';
  startTime?: string;
  endTime?: string;
  maxPatients?: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Schedule extends Model<ScheduleAttributes> implements ScheduleAttributes {
  public id!: number;
  public staffId!: number;
  public date!: Date;
  public shiftType!: 'morning' | 'afternoon' | 'full' | 'off';
  public startTime?: string;
  public endTime?: string;
  public maxPatients?: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Schedule.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    staffId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '员工ID',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '排班日期',
    },
    shiftType: {
      type: DataTypes.ENUM('morning', 'afternoon', 'full', 'off'),
      allowNull: false,
      comment: '班次类型',
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: '开始时间',
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: '结束时间',
    },
    maxPatients: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
      comment: '最大接诊数',
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
  },
  {
    sequelize,
    modelName: 'Schedule',
    tableName: 'schedules',
    indexes: [
      {
        unique: true,
        fields: ['staffId', 'date'],
      },
    ],
  }
);

Schedule.belongsTo(Staff, {
  foreignKey: 'staffId',
  as: 'staff',
});

Staff.hasMany(Schedule, {
  foreignKey: 'staffId',
  as: 'schedules',
});

export default Schedule;
