import { IsString, IsNumber, IsOptional, IsNotEmpty, IsArray, IsDate, IsEnum, validate } from 'class-validator';
import { Type } from 'class-transformer';

export class QuotationItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  memo?: string;
}

export class CreateQuotationDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  quotationDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validUntil?: Date;

  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsArray()
  @IsNotEmpty()
  items: QuotationItemDto[];

  @IsString()
  @IsOptional()
  createdBy?: string;
}
