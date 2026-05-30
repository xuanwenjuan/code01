import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../index';

interface PaymentRecordAttributes {
  id: number;
  paymentNo: string;
  orderId: number;
  customerId: number;
  paymentType: 'deposit' | 'rent' | 'overdue' | 'damage';
  amount: number;
  paymentMethod: string;
  transactionNo?: string;
  remark?: string;
  operatorId?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentRecordCreationAttributes extends Optional<PaymentRecordAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PaymentRecord extends Model<PaymentRecordAttributes, PaymentRecordCreationAttributes> implements PaymentRecordAttributes {
  public id!: number;
  public paymentNo!: string;
  public orderId!: number;
  public customerId!: number;
  public paymentType!: 'deposit' | 'rent' | 'overdue' | 'damage';
  public amount!: number;
  public paymentMethod!: string;
  public transactionNo?: string;
  public remark?: string;
  public operatorId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    paymentNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '支付单号'
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '订单ID'
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '客户ID'
    },
    paymentType: {
      type: DataTypes.ENUM('deposit', 'rent', 'overdue', 'damage'),
      allowNull: false,
      comment: '支付类型'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '支付金额'
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '支付方式'
    },
    transactionNo: {
      type: DataTypes.STRING(100),
      comment: '交易流水号'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      comment: '操作员ID'
    }
  },
  {
    sequelize,
    modelName: 'PaymentRecord',
    tableName: 'payment_records',
    timestamps: true,
    indexes: [
      { fields: ['paymentNo'], unique: true },
      { fields: ['orderId'] },
      { fields: ['customerId'] },
      { fields: ['paymentType'] }
    ]
  }
);

export default PaymentRecord;
