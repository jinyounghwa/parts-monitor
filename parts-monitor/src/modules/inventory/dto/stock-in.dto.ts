import { IsString, IsNumber, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';

export class StockInDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  memo?: string;

  @IsString()
  @IsOptional()
  performedBy?: string;
}
