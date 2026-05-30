import { IsString, IsOptional, IsInt, IsDate, IsNumber, Min, IsEnum } from 'class-validator';
import { MaintenanceStatus } from '../types';

export class CreateMaintenanceDto {
  @IsInt()
  equipmentId!: number;

  @IsInt()
  storeId!: number;

  @IsString()
  type!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsDate()
  startDate!: Date;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class StartMaintenanceDto {
  @IsInt()
  handledBy!: number;
}

export class CompleteMaintenanceDto {
  @IsInt()
  recordId!: number;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsString()
  remark?: string;
}
