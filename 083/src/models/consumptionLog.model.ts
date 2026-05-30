import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Part } from './part.model';
import { Category } from './category.model';
import { User } from './user.model';

@Table({
  tableName: 'consumption_logs',
  timestamps: true,
})
export class ConsumptionLog extends Model<ConsumptionLog> {
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

  @BelongsTo(() => Category)
  category?: Category;

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
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
  })
  totalAmount!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  vehicleModel?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  vehiclePlate?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  repairOrderNo?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  technicianId!: number;

  @BelongsTo(() => User, 'technicianId')
  technician?: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  consumptionDate!: Date;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  remark?: string;
}
