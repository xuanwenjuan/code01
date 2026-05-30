import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, BelongsToMany, HasMany } from 'sequelize-typescript';
import { TeacherStatus } from '../types';
import { CourseCategory } from './CourseCategory';
import { Class } from './Class';
import { TeacherCourse } from './TeacherCourse';

@Table({
  tableName: 'teachers',
  timestamps: true
})
export class Teacher extends Model<Teacher> {
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
    allowNull: false,
    unique: true
  })
  phone!: string;

  @Column({
    type: DataType.STRING(100)
  })
  email?: string;

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
    type: DataType.TEXT
  })
  qualifications?: string;

  @Column({
    type: DataType.DATE
  })
  qualificationExpiryDate?: Date;

  @Column({
    type: DataType.JSON
  })
  availableTimeSlots?: any;

  @Column({
    type: DataType.ENUM(...Object.values(TeacherStatus)),
    allowNull: false,
    defaultValue: TeacherStatus.ON_JOB
  })
  status!: TeacherStatus;

  @Column({
    type: DataType.DECIMAL(3, 2),
    defaultValue: 5.00
  })
  rating!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  ratingCount!: number;

  @Column({
    type: DataType.TEXT
  })
  remark?: string;

  @BelongsToMany(() => CourseCategory, () => TeacherCourse)
  courses!: CourseCategory[];

  @HasMany(() => Class)
  classes!: Class[];

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
