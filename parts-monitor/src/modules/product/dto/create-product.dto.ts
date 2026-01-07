import { IsString, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';
import { TargetSite } from '../entities/product.entity';
import type { AlertThreshold } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  partNumber: string;

  @IsString()
  manufacturer: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  targetSites: TargetSite[];

  @IsObject()
  alertThreshold: AlertThreshold;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
