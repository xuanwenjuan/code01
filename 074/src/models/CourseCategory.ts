import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { CourseCategoryStatus } from '../types';

@Table({
  tableName: 'course_categories',
  timestamps: true
})
export class CourseCategory extends Model<CourseCategory> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING(500)
  })
  description?: string;

  @ForeignKey(() => CourseCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  parentId?: number;

  @BelongsTo(() => CourseCategory, { foreignKey: 'parentId', as: 'parent' })
  parent?: CourseCategory;

  @HasMany(() => CourseCategory, { foreignKey: 'parentId', as: 'children' })
  children?: CourseCategory[];

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  sortOrder!: number;

  @Column({
    type: DataType.ENUM(...Object.values(CourseCategoryStatus)),
    allowNull: false,
    defaultValue: CourseCategoryStatus.ACTIVE
  })
  status!: CourseCategoryStatus;

  @Column({
    type: DataType.STRING(255)
  })
  icon?: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
