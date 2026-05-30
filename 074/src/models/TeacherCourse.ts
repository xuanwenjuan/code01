import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Teacher } from './Teacher';
import { CourseCategory } from './CourseCategory';

@Table({
  tableName: 'teacher_courses',
  timestamps: false
})
export class TeacherCourse extends Model<TeacherCourse> {
  @ForeignKey(() => Teacher)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true
  })
  teacherId!: number;

  @ForeignKey(() => CourseCategory)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true
  })
  courseId!: number;
}
