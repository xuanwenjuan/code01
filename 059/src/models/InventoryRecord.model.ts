import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { InventoryType } from '../types';
import SparePart from './SparePart.model';
import Supplier from './Supplier.model';
import User from './User.model';

class InventoryRecord extends Model {
  public id!: number;
  public sparePartId!: number;
  public type!: InventoryType;
  public quantity!: number;
  public beforeQuantity!: number;
  public afterQuantity!: number;
  public supplierId!: number;
  public applicantId!: number;
  public applicantName!: string;
  public department!: string;
  public reason!: string;
  public orderNo!: string;
  public remark!: string;
  public operatorId!: number;
  public operatorName!: string;
  public readonly createdAt!: Date;
  public readonly sparePart?: SparePart;
  public readonly supplier?: Supplier;
}

InventoryRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sparePartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '备件ID'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(InventoryType)),
      allowNull: false,
      comment: '出入库类型'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '数量'
    },
    beforeQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '操作前库存'
    },
    afterQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '操作后库存'
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '供应商ID（入库时）'
    },
    applicantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '申请人ID（出库时）'
    },
    applicantName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '申请人姓名'
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '领用部门'
    },
    reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '原因/用途'
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '单号'
    },
    remark: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: '备注'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '操作员ID'
    },
    operatorName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作员姓名'
    }
  },
  {
    sequelize,
    tableName: 'inventory_records',
    modelName: 'InventoryRecord'
  }
);

InventoryRecord.belongsTo(SparePart, { as: 'sparePart', foreignKey: 'sparePartId' });
InventoryRecord.belongsTo(Supplier, { as: 'supplier', foreignKey: 'supplierId' });
InventoryRecord.belongsTo(User, { as: 'operator', foreignKey: 'operatorId' });

export default InventoryRecord;
