import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

@Table({
  tableName: 'guests',
  timestamps: true
})
export class Guest extends Model<Guest> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  name: string;

  @Column({
    type: DataType.ENUM(...Object.values(Gender)),
    allowNull: true
  })
  gender: Gender;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true
  })
  idCard: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  phone: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  address: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  remark: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
