import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Reagent from './Reagent';
import { StockStatus } from '../types';

interface StockAttributes {
  id: number;
  reagentId: number;
  batchNo: string;
  quantity: number;
  availableQuantity: number;
  unitPrice: number;
  productionDate: Date;
  expiryDate: Date;
  location: string;
  status: StockStatus;
  inspectorId: number;
  inspectionRemark: string;
  inboundBy: number;
  inboundAt: Date;
  remarks: string;
}

interface StockCreationAttributes extends Optional<StockAttributes, 'id' | 'availableQuantity' | 'status' | 'remarks'> {}

class Stock extends Model<StockAttributes, StockCreationAttributes> implements StockAttributes {
  public id!: number;
  public reagentId!: number;
  public batchNo!: string;
  public quantity!: number;
  public availableQuantity!: number;
  public unitPrice!: number;
  public productionDate!: Date;
  public expiryDate!: Date;
  public location!: string;
  public status!: StockStatus;
  public inspectorId!: number;
  public inspectionRemark!: string;
  public inboundBy!: number;
  public inboundAt!: Date;
  public remarks!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly reagent?: Reagent;
}

Stock.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    reagentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'reagent_id'
    },
    batchNo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '批次号'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '入库数量'
    },
    availableQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '可用数量'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    productionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '生产日期'
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '有效期'
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '存放位置'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(StockStatus)),
      allowNull: false,
      defaultValue: StockStatus.PENDING
    },
    inspectorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'inspector_id',
      comment: '质检员ID'
    },
    inspectionRemark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '质检备注'
    },
    inboundBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'inbound_by',
      comment: '入库操作员ID'
    },
    inboundAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'inbound_at',
      comment: '入库时间'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'stocks',
    modelName: 'Stock'
  }
);

Stock.belongsTo(Reagent, { as: 'reagent', foreignKey: 'reagentId' });

export default Stock;
