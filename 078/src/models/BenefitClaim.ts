import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import BenefitBatch from './BenefitBatch';
import BenefitProduct from './BenefitProduct';
import Department from './Department';

export enum ClaimStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SHIPPED = 'shipped',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

class BenefitClaim extends Model {
  public id!: number;
  public claimNo!: string;
  public userId!: number;
  public departmentId!: number;
  public batchId!: number;
  public productId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public totalAmount!: number;
  public status!: ClaimStatus;
  public receiverName!: string;
  public receiverPhone!: string;
  public receiverAddress!: string;
  public remark!: string | null;
  public approvedBy!: number | null;
  public approvedAt!: Date | null;
  public shippedBy!: number | null;
  public shippedAt!: Date | null;
  public receivedAt!: Date | null;
  public logisticsNo!: string | null;
  public isReissue!: number;
  public originalClaimId!: number | null;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BenefitClaim.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    claimNo: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      comment: '申领单号'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '申领人ID'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '部门ID'
    },
    batchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '发放批次ID'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID'
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '数量'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '总金额'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ClaimStatus)),
      defaultValue: ClaimStatus.PENDING,
      comment: '状态：pending待审核，approved已批准，rejected已拒绝，shipped已发货，received已签收，cancelled已取消'
    },
    receiverName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '收货人姓名'
    },
    receiverPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '收货人电话'
    },
    receiverAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '收货地址'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '审核人ID'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '审核时间'
    },
    shippedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '发货人ID'
    },
    shippedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '发货时间'
    },
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '签收时间'
    },
    logisticsNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '物流单号'
    },
    logisticsCompany: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '物流公司'
    },
    isReissue: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '是否补发：1是，0否'
    },
    originalClaimId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '原申领单ID（补发时关联）'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '创建人ID'
    }
  },
  {
    sequelize,
    modelName: 'BenefitClaim',
    tableName: 'benefit_claims',
    comment: '福利申领表'
  }
);

BenefitClaim.belongsTo(User, { foreignKey: 'userId', as: 'user' });
BenefitClaim.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
BenefitClaim.belongsTo(BenefitBatch, { foreignKey: 'batchId', as: 'batch' });
BenefitClaim.belongsTo(BenefitProduct, { foreignKey: 'productId', as: 'product' });
BenefitClaim.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
BenefitClaim.belongsTo(BenefitClaim, { foreignKey: 'originalClaimId', as: 'originalClaim' });

export default BenefitClaim;
