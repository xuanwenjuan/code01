import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { DocumentStatus, DocumentType } from '../types/common';
import Supplier from './Supplier';
import User from './User';
import DocumentItem from './DocumentItem';

@Table({
  tableName: 'warehouse_documents',
  timestamps: true
})
export default class WarehouseDocument extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(50),
    unique: true,
    allowNull: false
  })
  documentNo: string;

  @Column({
    type: DataType.ENUM(...Object.values(DocumentType)),
    allowNull: false
  })
  type: DocumentType;

  @Column({
    type: DataType.ENUM(...Object.values(DocumentStatus)),
    defaultValue: DocumentStatus.PENDING
  })
  status: DocumentStatus;

  @ForeignKey(() => Supplier)
  @Column({
    type: DataType.INTEGER
  })
  supplierId: number;

  @Column({
    type: DataType.STRING(100)
  })
  supplierName: string;

  @Column({
    type: DataType.STRING(500)
  })
  remark: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0
  })
  totalAmount: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER
  })
  createdById: number;

  @Column({
    type: DataType.STRING(50)
  })
  createdByName: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER
  })
  approvedById: number;

  @Column({
    type: DataType.STRING(50)
  })
  approvedByName: string;

  @Column({
    type: DataType.DATE
  })
  approvedAt: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isTimeout: boolean;

  @BelongsTo(() => Supplier)
  supplier: Supplier;

  @BelongsTo(() => User, 'createdById')
  createdBy: User;

  @BelongsTo(() => User, 'approvedById')
  approvedBy: User;

  @HasMany(() => DocumentItem)
  items: DocumentItem[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
