import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CostLedger extends Model {
  public id!: number;
  public ledgerNo!: string;
  public workOrderId?: number;
  public categoryId?: number;
  public bookName?: string;
  public categoryName?: string;
  public materialCost!: number;
  public laborCost!: number;
  public totalCost!: number;
  public statisticsDate!: Date;
  public remark?: string;
  public operatorId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CostLedger.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ledgerNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '台账编号'
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      comment: '工单ID'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      comment: '类目ID'
    },
    bookName: {
      type: DataTypes.STRING(200),
      comment: '书目名称'
    },
    categoryName: {
      type: DataTypes.STRING(100),
      comment: '类目名称'
    },
    materialCost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '原料成本'
    },
    laborCost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '人工工时成本'
    },
    totalCost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '总成本'
    },
    statisticsDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '统计日期'
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
    modelName: 'CostLedger',
    tableName: 'cost_ledgers',
    comment: '用料成本台账表'
  }
);

export default CostLedger;
