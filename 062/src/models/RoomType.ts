import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, HasMany } from 'sequelize-typescript';
import { Room } from './Room';

export enum RoomTypeStatus {
  ON_SHELF = 'on_shelf',
  OFF_SHELF = 'off_shelf'
}

@Table({
  tableName: 'room_types',
  timestamps: true
})
export class RoomType extends Model<RoomType> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: null
  })
  parentId: number | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  name: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true
  })
  description: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  facilities: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  basePrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true
  })
  weekendPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true
  })
  holidayPrice: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  maxGuests: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  bedCount: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  area: number;

  @Column({
    type: DataType.ENUM(...Object.values(RoomTypeStatus)),
    allowNull: false,
    defaultValue: RoomTypeStatus.ON_SHELF
  })
  status: RoomTypeStatus;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  sortOrder: number;

  @HasMany(() => Room)
  rooms: Room[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
