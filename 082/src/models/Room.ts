import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { RoomStatus, SeasonType } from '../constants';

interface RoomAttributes {
  id: number;
  roomNo: string;
  categoryId: number;
  building: string;
  floor: string;
  bedCount: number;
  maxGuests: number;
  area: number;
  facilities: string;
  images?: string;
  peakPrice: number;
  normalPrice: number;
  lowPrice: number;
  status: RoomStatus;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  description?: string;
}

interface RoomCreationAttributes extends Optional<RoomAttributes, 'id' | 'images' | 'lastMaintenanceDate' | 'nextMaintenanceDate' | 'description'> {}

class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  public id!: number;
  public roomNo!: string;
  public categoryId!: number;
  public building!: string;
  public floor!: string;
  public bedCount!: number;
  public maxGuests!: number;
  public area!: number;
  public facilities!: string;
  public images?: string;
  public peakPrice!: number;
  public normalPrice!: number;
  public lowPrice!: number;
  public status!: RoomStatus;
  public lastMaintenanceDate?: Date;
  public nextMaintenanceDate?: Date;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Room.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: '房源ID'
    },
    roomNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '房间号'
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '房型分类ID'
    },
    building: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '楼栋'
    },
    floor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '楼层'
    },
    bedCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '床位数量'
    },
    maxGuests: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '最大入住人数'
    },
    area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '面积(㎡)'
    },
    facilities: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '设施标签(JSON)'
    },
    images: {
      type: DataTypes.TEXT,
      comment: '图片URL(JSON)'
    },
    peakPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '旺季价格'
    },
    normalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '平季价格'
    },
    lowPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '淡季价格'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RoomStatus)),
      allowNull: false,
      defaultValue: RoomStatus.VACANT,
      comment: '房源状态'
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      comment: '上次维保日期'
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      comment: '下次维保日期'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    }
  },
  {
    sequelize,
    tableName: 'rooms',
    modelName: 'Room',
    comment: '房源表'
  }
);

export default Room;
