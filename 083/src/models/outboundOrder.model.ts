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
import { OutboundOrderStatus } from '../constants/business';
import { OutboundOrderItem } from './outboundOrderItem.model';

@Table({
  tableName: 'outbound_orders',
  timestamps: true,
  paranoid: true,
})
export class OutboundOrder extends Model<OutboundOrder> {
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  orderNo!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: '维修工单编号',
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  approverId?: number;

  @BelongsTo(() => User, 'approverId')
  approver?: User;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approvalDate?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  outboundDate?: Date;

  @Column({
    type: DataType.ENUM(...Object.values(OutboundOrderStatus)),
    defaultValue: OutboundOrderStatus.PENDING,
  })
  status!: OutboundOrderStatus;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  vehiclePlate?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  vehicleModel?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  remark?: string;

  @HasMany(() => OutboundOrderItem)
  items?: OutboundOrderItem[];
}
