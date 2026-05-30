import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EnrollmentStatus, PaymentStatus } from '../types';
import { Student } from './Student';
import { Class } from './Class';

@Table({
  tableName: 'enrollments',
  timestamps: true
})
export class Enrollment extends Model<Enrollment> {
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
    type: DataType.ENUM(...Object.values(EnrollmentStatus)),
    allowNull: false,
    defaultValue: EnrollmentStatus.PENDING
  })
  status!: EnrollmentStatus;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    allowNull: false,
    defaultValue: PaymentStatus.UNPAID
  })
  paymentStatus!: PaymentStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  amount!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  paidAmount!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  usedHours!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  totalHours!: number;

  @Column({
    type: DataType.DATE
  })
  enrollmentDate!: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isTrial!: boolean;

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
