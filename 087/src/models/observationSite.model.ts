import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { SiteStatus } from '../types';

export interface ObservationSiteAttributes {
  id?: number;
  siteCode: string;
  name: string;
  address: string;
  district: string;
  longitude: number;
  latitude: number;
  altitude?: number;
  buildDate: Date;
  status: SiteStatus;
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
  contactPerson?: string;
  contactPhone?: string;
  remark?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class ObservationSite extends Model<ObservationSiteAttributes> implements ObservationSiteAttributes {
  public id!: number;
  public siteCode!: string;
  public name!: string;
  public address!: string;
  public district!: string;
  public longitude!: number;
  public latitude!: number;
  public altitude?: number;
  public buildDate!: Date;
  public status!: SiteStatus;
  public lastInspectionDate?: Date;
  public nextInspectionDate?: Date;
  public contactPerson?: string;
  public contactPhone?: string;
  public remark?: string;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ObservationSite.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    siteCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '站点编号'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '站点名称'
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '详细地址'
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '归属辖区'
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      comment: '经度'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      comment: '纬度'
    },
    altitude: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: '海拔高度(米)'
    },
    buildDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '建站时间'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SiteStatus)),
      allowNull: false,
      defaultValue: SiteStatus.NORMAL,
      comment: '站点状态'
    },
    lastInspectionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '上次巡检时间'
    },
    nextInspectionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '下次巡检时间'
    },
    contactPerson: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '联系人'
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '联系电话'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '创建人'
    }
  },
  {
    sequelize,
    tableName: 'observation_sites',
    modelName: 'ObservationSite'
  }
);

export default ObservationSite;
