import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Category from './Category';

@Table({
  tableName: 'products',
  timestamps: true
})
export default class Product extends Model {
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
    type: DataType.STRING(50),
    unique: true,
    allowNull: false
  })
  sku: string;

  @Column({
    type: DataType.STRING(500)
  })
  specification: string;

  @Column({
    type: DataType.STRING(100)
  })
  brand: string;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  categoryId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  costPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  sellingPrice: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  stock: number;

  @Column({
    type: DataType.STRING(255)
  })
  image: string;

  @Column({
    type: DataType.TEXT
  })
  description: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive: boolean;

  @BelongsTo(() => Category)
  category: Category;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
