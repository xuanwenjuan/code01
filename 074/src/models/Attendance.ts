import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { AttendanceStatus } from '../types';
import { Student } from './Student';
import { Class } from './Class';

@Table({
  tableName: 'attendances',
  timestamps: true
})
export class Attendance extends Model<Attendance> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  studentId!: number;

  @BelongsTo(() => Student)
  student!: Student;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  classId!: number;

  @BelongsTo(() => Class)
  class!: Class;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  attendanceDate!: string;

  @Column({
    type: DataType.ENUM(...Object.values(AttendanceStatus)),
    allowNull: false,
    defaultValue: AttendanceStatus.PRESENT
  })
  status!: AttendanceStatus;

  @Column({
    type: DataType.TIME
  })
  checkInTime?: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1
  })
  hoursConsumed!: number;

  @Column({
    type: DataType.TEXT
  })
  remark?: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
