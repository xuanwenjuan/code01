import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { PurchaseStatus } from '../types';
import Store from './Store';
import Supplier from './Supplier';
import User from './User';
import PurchaseOrderItem from './PurchaseOrderItem';

@Table({
  tableName: 'purchase_orders',
  timestamps: true,
  paranoid: true
})
export default class PurchaseOrder extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true
  })
  orderNo: string;

  @ForeignKey(() => Store)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  storeId: number;

  @BelongsTo(() => Store)
  store: Store;

  @ForeignKey(() => Supplier)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  supplierId: number;

  @BelongsTo(() => Supplier)
  supplier: Supplier;

  @Column({
    type: DataType.ENUM(...Object.values(PurchaseStatus)),
    defaultValue: PurchaseStatus.PENDING
  })
  status: PurchaseStatus;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  createdBy: number;

  @BelongsTo(() => User, { foreignKey: 'createdBy' })
  creator: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  reviewedBy: number;

  @BelongsTo(() => User, { foreignKey: 'reviewedBy' })
  reviewer: User;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  reviewedAt: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  receivedBy: number;

  @BelongsTo(() => User, { foreignKey: 'receivedBy' })
  receiver: User;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  receivedAt: Date;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false
  })
  totalAmount: number;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  expectedDeliveryDate: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  remark: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  rejectReason: string;

  @HasMany(() => PurchaseOrderItem)
  items: PurchaseOrderItem[];
}
