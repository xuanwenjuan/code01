import { IsString, IsOptional, IsInt, IsNumber, Min, IsDate, IsEnum } from 'class-validator';
import { EquipmentStatus } from '../types';

export class CreateEquipmentDto {
  @IsString()
  equipmentNo!: string;

  @IsString()
  name!: string;

  @IsInt()
  categoryId!: number;

  @IsString()
  brand!: string;

  @IsString()
  model!: string;

  @IsInt()
  @Min(1900)
  manufactureYear!: number;

  @IsOptional()
  @IsInt()
  inspectionCycle?: number;

  @IsOptional()
  @IsDate()
  lastInspectionDate?: Date;

  @IsOptional()
  @IsDate()
  nextInspectionDate?: Date;

  @IsInt()
  storeId!: number;

  @IsNumber()
  @Min(0)
  dailyRent!: number;

  @IsNumber()
  @Min(0)
  deposit!: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateEquipmentDto {
  @IsOptional()
  @IsString()
  equipmentNo?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  manufactureYear?: number;

  @IsOptional()
  @IsInt()
  inspectionCycle?: number;

  @IsOptional()
  @IsDate()
  lastInspectionDate?: Date;

  @IsOptional()
  @IsDate()
  nextInspectionDate?: Date;

  @IsOptional()
  @IsInt()
  storeId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyRent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deposit?: number;

  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @IsOptional()
  @IsString()
  remark?: string;
}
