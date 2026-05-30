import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Class } from './Class';

@Table({
  tableName: 'schedules',
  timestamps: true
})
export class Schedule extends Model<Schedule> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  classId!: number;

  @BelongsTo(() => Class)
  class!: Class;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  dayOfWeek!: number;

  @Column({
    type: DataType.TIME,
    allowNull: false
  })
  startTime!: string;

  @Column({
    type: DataType.TIME,
    allowNull: false
  })
  endTime!: string;

  @Column({
    type: DataType.STRING(100)
  })
  classroom?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
