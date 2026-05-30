import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Part } from './part.model';
import { Category } from './category.model';
import { Supplier } from './supplier.model';

@Table({
  tableName: 'stock_snapshots',
  timestamps: true,
  indexes: [
    {
      fields: ['partId', 'snapshotDate'],
      unique: true,
    },
  ],
})
export class StockSnapshot extends Model<StockSnapshot> {
  @ForeignKey(() => Part)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  partId!: number;

  @BelongsTo(() => Part)
  part?: Part;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  categoryId!: number;

  @ForeignKey(() => Supplier)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  supplierId?: number;

  @BelongsTo(() => Supplier)
  supplier?: Supplier;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  beginQuantity!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  inboundQuantity!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  outboundQuantity!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  endQuantity!: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  })
  beginAmount!: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  })
  inboundAmount!: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  })
  outboundAmount!: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  })
  endAmount!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  snapshotDate!: Date;
}
