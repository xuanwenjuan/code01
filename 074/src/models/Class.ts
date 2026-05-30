import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { ClassStatus } from '../types';
import { Teacher } from './Teacher';
import { CourseCategory } from './CourseCategory';
import { Enrollment } from './Enrollment';
import { Schedule } from './Schedule';
import { Attendance } from './Attendance';

@Table({
  tableName: 'classes',
  timestamps: true
})
export class Class extends Model<Class> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  name!: string;

  @ForeignKey(() => CourseCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  courseId!: number;

  @BelongsTo(() => CourseCategory)
  course!: CourseCategory;

  @ForeignKey(() => Teacher)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  teacherId!: number;

  @BelongsTo(() => Teacher)
  teacher!: Teacher;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  maxStudents!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  currentStudents!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  totalHours!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  tuition!: number;

  @Column({
    type: DataType.DATE
  })
  startDate?: Date;

  @Column({
    type: DataType.DATE
  })
  endDate?: Date;

  @Column({
    type: DataType.ENUM(...Object.values(ClassStatus)),
    allowNull: false,
    defaultValue: ClassStatus.NOT_STARTED
  })
  status!: ClassStatus;

  @Column({
    type: DataType.STRING(500)
  })
  description?: string;

  @HasMany(() => Enrollment)
  enrollments!: Enrollment[];

  @HasMany(() => Schedule)
  schedules!: Schedule[];

  @HasMany(() => Attendance)
  attendances!: Attendance[];

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
