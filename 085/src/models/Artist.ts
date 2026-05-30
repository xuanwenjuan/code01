import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { ArtistStatus } from '../types';
import { User } from './User';

interface ArtistAttributes {
  id: number;
  userId: number;
  name: string;
  avatar?: string;
  bio?: string;
  specialties: string;
  style?: string;
  representativeWorks?: string;
  status: ArtistStatus;
  rejectionReason?: string;
  reviewedBy?: number;
  reviewedAt?: Date;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ArtistCreationAttributes extends Optional<ArtistAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'joinedAt'> {}

class Artist extends Model<ArtistAttributes, ArtistCreationAttributes> implements ArtistAttributes {
  public id!: number;
  public userId!: number;
  public name!: string;
  public avatar?: string;
  public bio?: string;
  public specialties!: string;
  public style?: string;
  public representativeWorks?: string;
  public status!: ArtistStatus;
  public rejectionReason?: string;
  public reviewedBy?: number;
  public reviewedAt?: Date;
  public joinedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user?: User;
}

Artist.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING(255)
    },
    bio: {
      type: DataTypes.TEXT
    },
    specialties: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '擅长品类，多个用逗号分隔'
    },
    style: {
      type: DataTypes.STRING(100),
      comment: '作品风格'
    },
    representativeWorks: {
      type: DataTypes.TEXT,
      comment: '代表作，JSON格式存储'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ArtistStatus)),
      allowNull: false,
      defaultValue: ArtistStatus.PENDING
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      comment: '审核拒绝原因'
    },
    reviewedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '审核人ID'
    },
    reviewedAt: {
      type: DataTypes.DATE,
      comment: '审核时间'
    },
    joinedAt: {
      type: DataTypes.DATE,
      comment: '入驻时间'
    }
  },
  {
    sequelize,
    modelName: 'Artist',
    tableName: 'artists',
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['specialties'] }
    ]
  }
);

Artist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Artist.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

export { Artist, ArtistAttributes, ArtistCreationAttributes };
