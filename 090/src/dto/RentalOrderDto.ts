import { IsString, IsOptional, IsInt, IsDate, IsNumber, Min, IsPhoneNumber, IsEnum } from 'class-validator';
import { OrderStatus } from '../types';

export class CreateRentalOrderDto {
  @IsString()
  customerName!: string;

  @IsString()
  customerPhone!: string;

  @IsString()
  customerIdCard!: string;

  @IsInt()
  equipmentId!: number;

  @IsInt()
  storeId!: number;

  @IsDate()
  startDate!: Date;

  @IsDate()
  endDate!: Date;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class OutboundDto {
  @IsInt()
  orderId!: number;
}

export class ReturnDto {
  @IsInt()
  orderId!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  damageCompensation?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateRentalOrderDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerIdCard?: string;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  remark?: string;
}
