import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { RoomType } from './RoomType';
import { Room } from './Room';
import { User } from './User';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum ReservationSource {
  ONLINE = 'online',
  OFFLINE = 'offline',
  WALK_IN = 'walk_in',
  THIRD_PARTY = 'third_party'
}

@Table({
  tableName: 'reservations',
  timestamps: true
})
export class Reservation extends Model<Reservation> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    unique: true
  })
  orderNo: string;

  @ForeignKey(() => RoomType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  roomTypeId: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  roomId: number | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  guestName: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  guestPhone: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  guestIdCard: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1
  })
  guestCount: number;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  checkInDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  checkOutDate: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1
  })
  nights: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  totalPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  deposit: number;

  @Column({
    type: DataType.ENUM(...Object.values(ReservationStatus)),
    allowNull: false,
    defaultValue: ReservationStatus.PENDING
  })
  status: ReservationStatus;

  @Column({
    type: DataType.ENUM(...Object.values(ReservationSource)),
    allowNull: false,
    defaultValue: ReservationSource.OFFLINE
  })
  source: ReservationSource;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  handledBy: number;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  checkInTime: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  checkOutTime: Date | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  remark: string;

  @BelongsTo(() => RoomType)
  roomType: RoomType;

  @BelongsTo(() => Room)
  room: Room;

  @BelongsTo(() => User)
  handler: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
