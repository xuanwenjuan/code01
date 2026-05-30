import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';

@Table({
  tableName: 'categories',
  timestamps: true
})
export default class Category extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  name: string;

  @Column({
    type: DataType.STRING(255)
  })
  description: string;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  parentId: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  sort: number;

  @Column({
    type: DataType.STRING(255)
  })
  image: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive: boolean;

  @BelongsTo(() => Category, 'parentId')
  parent: Category;

  @HasMany(() => Category, 'parentId')
  children: Category[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
