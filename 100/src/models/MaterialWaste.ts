import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class MaterialWaste extends Model {
  public id!: number;
  public wasteNo!: string;
  public workOrderId!: number;
  public materialStockId!: number;
  public categoryId!: number;
  public materialName!: string;
  public quantity!: number;
  public unit!: string;
  public unitPrice!: number;
  public totalCost!: number;
  public wasteReason!: string;
  public wasteType!: string;
  public reportedById!: number;
  public verifiedById?: number;
  public verifiedAt?: Date;
  public isVerified!: boolean;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MaterialWaste.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    wasteNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '损耗单号'
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '工单ID'
    },
    materialStockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '原料库存ID'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '类目ID'
    },
    materialName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '原料名称'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '损耗数量'
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
    totalCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '损耗总成本'
    },
    wasteReason: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '损耗原因'
    },
    wasteType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '损耗类型（雕版损耗/印刷损耗/装订损耗等）'
    },
    reportedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '上报人ID'
    },
    verifiedById: {
      type: DataTypes.INTEGER,
      comment: '审核人ID'
    },
    verifiedAt: {
      type: DataTypes.DATE,
      comment: '审核时间'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否已审核'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'MaterialWaste',
    tableName: 'material_wastes',
    comment: '原料损耗记录表'
  }
);

export default MaterialWaste;
