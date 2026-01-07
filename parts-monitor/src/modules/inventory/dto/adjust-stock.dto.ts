import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsNumber()
  @IsNotEmpty()
  newQuantity: number;

  @IsString()
  @IsOptional()
  memo?: string;

  @IsString()
  @IsOptional()
  performedBy?: string;
}
