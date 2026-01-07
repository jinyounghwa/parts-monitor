import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateSafetyStockDto {
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsNumber()
  @IsNotEmpty()
  safetyStock: number;

  @IsNumber()
  @IsNotEmpty()
  reorderPoint: number;
}
