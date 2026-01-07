import { IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class FindQuotationsDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fromDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  toDate?: Date;
}
