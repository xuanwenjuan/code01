import { Table, Column, Model, DataType, BelongsToMany } from 'sequelize-typescript';
import { CooperationStatus } from '../types';
import Store from './Store';
import SupplierStore from './SupplierStore';

@Table({
  tableName: 'suppliers',
  timestamps: true,
  paranoid: true
})
export default class Supplier extends Model {
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
  supplierName: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true
  })
  supplierCode: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true
  })
  contactPerson: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  contactPhone: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true
  })
  address: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  businessLicense: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  qualificationExpireDate: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 30
  })
  settlementPeriodDays: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 3
  })
  deliveryTimeDays: number;

  @Column({
    type: DataType.ENUM(...Object.values(CooperationStatus)),
    defaultValue: CooperationStatus.ACTIVE
  })
  cooperationStatus: CooperationStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true
  })
  creditLimit: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  supplyCategories: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  remark: string;

  @BelongsToMany(() => Store, () => SupplierStore)
  stores: Store[];
}
