import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { MaterialStatus } from '../types';

class MaterialStock extends Model {
  public id!: number;
  public batchNo!: string;
  public categoryId!: number;
  public name!: string;
  public origin?: string;
  public weight?: number;
  public grade?: string;
  public storageYears!: number;
  public quantity!: number;
  public unit!: string;
  public unitPrice!: number;
  public status!: MaterialStatus;
  public expireDate!: Date;
  public location?: string;
  public remark?: string;
  public operatorId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MaterialStock.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    batchNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '批次编号'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '类目ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '物料名称'
    },
    origin: {
      type: DataTypes.STRING(100),
      comment: '产地'
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '纸张克重'
    },
    grade: {
      type: DataTypes.STRING(50),
      comment: '品级'
    },
    storageYears: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '储存年限'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '数量'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MaterialStatus)),
      defaultValue: MaterialStatus.SUFFICIENT,
      comment: '状态'
    },
    expireDate: {
      type: DataTypes.DATE,
      comment: '过期日期'
    },
    location: {
      type: DataTypes.STRING(100),
      comment: '存放位置'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '操作人ID'
    }
  },
  {
    sequelize,
    modelName: 'MaterialStock',
    tableName: 'material_stocks',
    comment: '原料储备档案表'
  }
);

export default MaterialStock;
