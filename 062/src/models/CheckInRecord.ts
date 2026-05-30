import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Room } from './Room';
import { Reservation } from './Reservation';
import { User } from './User';
import { Guest } from './Guest';

@Table({
  tableName: 'check_in_records',
  timestamps: true
})
export class CheckInRecord extends Model<CheckInRecord> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @ForeignKey(() => Reservation)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  reservationId: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  roomId: number;

  @ForeignKey(() => Guest)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  guestId: number;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  checkInDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  checkOutDate: Date | null;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1
  })
  nights: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  roomPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  extraCharges: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  totalAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  paidAmount: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isCheckedOut: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  checkedInBy: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  checkedOutBy: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  remark: string;

  @BelongsTo(() => Reservation)
  reservation: Reservation;

  @BelongsTo(() => Room)
  room: Room;

  @BelongsTo(() => Guest)
  guest: Guest;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
