import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import Supplier from './Supplier';
import Store from './Store';

@Table({
  tableName: 'supplier_stores',
  timestamps: true
})
export default class SupplierStore extends Model {
  @ForeignKey(() => Supplier)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true
  })
  supplierId: number;

  @ForeignKey(() => Store)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true
  })
  storeId: number;
}
