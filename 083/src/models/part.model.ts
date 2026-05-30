import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Category } from './category.model';
import { Supplier } from './supplier.model';

@Table({
  tableName: 'parts',
  timestamps: true,
  paranoid: true,
})
export class Part extends Model<Part> {
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  code!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  specification?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: '车型适配',
  })
  vehicleModel?: string;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  categoryId!: number;

  @BelongsTo(() => Category)
  category?: Category;

  @ForeignKey(() => Supplier)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  supplierId?: number;

  @BelongsTo(() => Supplier)
  supplier?: Supplier;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: '单位',
  })
  unitPrice!: number;

  @Column({
    type: DataType.STRING(20),
    defaultValue: '个',
  })
  unit!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '安全库存',
  })
  safeStock!: number;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  remark?: string;
}
