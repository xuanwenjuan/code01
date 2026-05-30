import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface ConsumableRecordAttributes {
  id?: number;
  recordNo: string;
  siteId?: number;
  equipmentCategoryId?: number;
  workOrderId?: number;
  name: string;
  specification?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'in' | 'out';
  operatorId?: number;
  receiveDate?: Date;
  remark?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class ConsumableRecord extends Model<ConsumableRecordAttributes> implements ConsumableRecordAttributes {
  public id!: number;
  public recordNo!: string;
  public siteId?: number;
  public equipmentCategoryId?: number;
  public workOrderId?: number;
  public name!: string;
  public specification?: string;
  public unit!: string;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public type!: 'in' | 'out';
  public operatorId?: number;
  public receiveDate?: Date;
  public remark?: string;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConsumableRecord.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    recordNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '记录编号'
    },
    siteId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '站点ID'
    },
    equipmentCategoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '设备类目ID'
    },
    workOrderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '工单ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '耗材名称'
    },
    specification: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '规格型号'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位'
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '数量'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价'
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '总价'
    },
    type: {
      type: DataTypes.ENUM('in', 'out'),
      allowNull: false,
      comment: '出入库类型'
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '经办人ID'
    },
    receiveDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '领用日期'
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
    tableName: 'consumable_records',
    modelName: 'ConsumableRecord'
  }
);

export default ConsumableRecord;
