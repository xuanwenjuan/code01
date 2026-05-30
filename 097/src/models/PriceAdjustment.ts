import { Table, Column, Model, DataType, CreatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Supplier from './Supplier';
import Product from './Product';

@Table({
  tableName: 'price_adjustments',
  timestamps: false
})
export default class PriceAdjustment extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @ForeignKey(() => Supplier)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  supplierId: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  productId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  oldPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  newPrice: number;

  @Column({
    type: DataType.TEXT
  })
  reason: string;

  @Column({
    type: DataType.INTEGER
  })
  operatorId: number;

  @Column({
    type: DataType.STRING(50)
  })
  operatorName: string;

  @BelongsTo(() => Supplier)
  supplier: Supplier;

  @BelongsTo(() => Product)
  product: Product;

  @CreatedAt
  createdAt: Date;
}
