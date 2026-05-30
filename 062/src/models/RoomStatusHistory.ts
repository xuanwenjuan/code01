import { Table, Column, Model, DataType, CreatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Room } from './Room';
import { User } from './User';

export enum RoomStatusChangeType {
  MANUAL = 'manual',
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
  CLEAN_COMPLETE = 'clean_complete',
  MAINTENANCE_START = 'maintenance_start',
  MAINTENANCE_END = 'maintenance_end',
  LOCK = 'lock',
  UNLOCK = 'unlock'
}

@Table({
  tableName: 'room_status_histories',
  timestamps: false
})
export class RoomStatusHistory extends Model<RoomStatusHistory> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  roomId: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  oldStatus: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  newStatus: string;

  @Column({
    type: DataType.ENUM(...Object.values(RoomStatusChangeType)),
    allowNull: false
  })
  changeType: RoomStatusChangeType;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  operatorId: number | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  operatorName: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  remark: string;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => Room)
  room: Room;

  @BelongsTo(() => User)
  operator: User;
}
