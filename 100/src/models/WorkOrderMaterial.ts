import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class WorkOrderMaterial extends Model {
  public id!: number;
  public workOrderId!: number;
  public materialStockId!: number;
  public categoryId!: number;
  public materialName!: string;
  public quantity!: number;
  public unit!: string;
  public unitPrice!: number;
  public totalPrice!: number;
  public operatorId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WorkOrderMaterial.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '工单ID'
    },
    materialStockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '物料库存ID'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '类目ID'
    },
    materialName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '物料名称'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '使用数量'
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
    totalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '总价'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '操作人ID'
    }
  },
  {
    sequelize,
    modelName: 'WorkOrderMaterial',
    tableName: 'work_order_materials',
    comment: '工单用料明细表'
  }
);

export default WorkOrderMaterial;
