import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, HasMany } from 'sequelize-typescript';
import { StudentStatus } from '../types';
import { Enrollment } from './Enrollment';
import { Attendance } from './Attendance';

@Table({
  tableName: 'students',
  timestamps: true
})
export class Student extends Model<Student> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  parentPhone!: string;

  @Column({
    type: DataType.STRING(100)
  })
  parentName?: string;

  @Column({
    type: DataType.STRING(10)
  })
  gender?: string;

  @Column({
    type: DataType.DATE
  })
  birthDate?: Date;

  @Column({
    type: DataType.STRING(255)
  })
  avatar?: string;

  @Column({
    type: DataType.STRING(255)
  })
  address?: string;

  @Column({
    type: DataType.ENUM(...Object.values(StudentStatus)),
    allowNull: false,
    defaultValue: StudentStatus.ACTIVE
  })
  status!: StudentStatus;

  @Column({
    type: DataType.TEXT
  })
  remark?: string;

  @HasMany(() => Enrollment)
  enrollments!: Enrollment[];

  @HasMany(() => Attendance)
  attendances!: Attendance[];

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
