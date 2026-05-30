import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { CategoryStatus } from '../constants/business';

@Table({
  tableName: 'categories',
  timestamps: true,
  paranoid: true,
})
export class Category extends Model<Category> {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  description?: string;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  parentId?: number;

  @BelongsTo(() => Category, 'parentId')
  parent?: Category;

  @HasMany(() => Category, 'parentId')
  children?: Category[];

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  sort!: number;

  @Column({
    type: DataType.ENUM(...Object.values(CategoryStatus)),
    defaultValue: CategoryStatus.ACTIVE,
  })
  status!: CategoryStatus;

  level?: number;
}
