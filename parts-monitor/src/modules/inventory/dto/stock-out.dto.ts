import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class StockOutDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

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
