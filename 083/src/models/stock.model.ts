import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Part } from './part.model';
import { Supplier } from './supplier.model';

@Table({
  tableName: 'stocks',
  timestamps: true,
})
export class Stock extends Model<Stock> {
  @ForeignKey(() => Part)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  partId!: number;

  @BelongsTo(() => Part)
  part?: Part;

  @ForeignKey(() => Supplier)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  supplierId?: number;

  @BelongsTo(() => Supplier)
  supplier?: Supplier;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '批次号',
  })
  batchNo!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  unitPrice!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: '入库时间',
  })
  inboundDate?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: '有效期至',
  })
  expireDate?: Date;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  warehouseLocation?: string;
}
