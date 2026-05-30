import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Supplier } from './supplier.model';
import { PurchaseOrderStatus } from '../constants/business';
import { PurchaseOrderItem } from './purchaseOrderItem.model';

@Table({
  tableName: 'purchase_orders',
  timestamps: true,
  paranoid: true,
})
export class PurchaseOrder extends Model<PurchaseOrder> {
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  orderNo!: string;

  @ForeignKey(() => Supplier)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  supplierId!: number;

  @BelongsTo(() => Supplier)
  supplier?: Supplier;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  purchaserId!: number;

  @BelongsTo(() => User)
  purchaser?: User;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expectedDate?: Date;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
  })
  totalAmount!: number;

  @Column({
    type: DataType.ENUM(...Object.values(PurchaseOrderStatus)),
    defaultValue: PurchaseOrderStatus.PENDING,
  })
  status!: PurchaseOrderStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  remark?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  inspectorId?: number;

  @BelongsTo(() => User, 'inspectorId')
  inspector?: User;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  inspectionDate?: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  inspectionRemark?: string;

  @HasMany(() => PurchaseOrderItem)
  items?: PurchaseOrderItem[];
}
