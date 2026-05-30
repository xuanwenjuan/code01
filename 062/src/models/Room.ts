import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { RoomType } from './RoomType';

export enum RoomStatus {
  VACANT = 'vacant',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  CLEANING = 'cleaning'
}

export enum RoomOrientation {
  NORTH = 'north',
  SOUTH = 'south',
  EAST = 'east',
  WEST = 'west'
}

@Table({
  tableName: 'rooms',
  timestamps: true
})
export class Room extends Model<Room> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true
  })
  roomNumber: string;

  @ForeignKey(() => RoomType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  roomTypeId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  floor: number;

  @Column({
    type: DataType.ENUM(...Object.values(RoomOrientation)),
    allowNull: true
  })
  orientation: RoomOrientation;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  facilities: string;

  @Column({
    type: DataType.ENUM(...Object.values(RoomStatus)),
    allowNull: false,
    defaultValue: RoomStatus.VACANT
  })
  status: RoomStatus;

  @Column({
    type: DataType.STRING(200),
    allowNull: true
  })
  remark: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isLocked: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  lockedUntil: Date | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  lockReason: string | null;

  @BelongsTo(() => RoomType)
  roomType: RoomType;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

