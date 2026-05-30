
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { ApplicationStatus, ApplicationType } from '../types';
import Asset from './Asset';
import User from './User';

class AssetApplication extends Model {
  public id!: number;
  public applicationNo!: string;
  public type!: ApplicationType;
  public assetId!: number;
  public applicantId!: number;
  public applicantDepartment!: string;
  public targetDepartment!: string;
  public reason!: string;
  public expectedReturnDate!: Date;
  public status!: ApplicationStatus;
  public approverId!: number;
  public approvalRemark!: string;
  public approvalTime!: Date;
  public completionTime!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AssetApplication.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    applicationNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '申请单号'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(ApplicationType)),
      allowNull: false,
      comment: '申请类型'
    },
    assetId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '资产ID'
    },
    applicantId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '申请人ID'
    },
    applicantDepartment: {
      type: DataTypes.STRING(100),
      comment: '申请人部门'
    },
    targetDepartment: {
      type: DataTypes.STRING(100),
      comment: '目标部门(调拨用)'
    },
    reason: {
      type: DataTypes.TEXT,
      comment: '申请原因'
    },
    expectedReturnDate: {
      type: DataTypes.DATE,
      comment: '预计归还日期'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ApplicationStatus)),
      allowNull: false,
      defaultValue: ApplicationStatus.PENDING,
      comment: '状态'
    },
    approverId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '审批人ID'
    },
    approvalRemark: {
      type: DataTypes.TEXT,
      comment: '审批意见'
    },
    approvalTime: {
      type: DataTypes.DATE,
      comment: '审批时间'
    },
    completionTime: {
      type: DataTypes.DATE,
      comment: '完成时间'
    }
  },
  {
    sequelize,
    tableName: 'asset_applications',
    modelName: 'AssetApplication',
    timestamps: true
  }
);

AssetApplication.belongsTo(Asset, { as: 'asset', foreignKey: 'assetId' });
AssetApplication.belongsTo(User, { as: 'applicant', foreignKey: 'applicantId' });
AssetApplication.belongsTo(User, { as: 'approver', foreignKey: 'approverId' });

export default AssetApplication;
