import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsEnum(['draft', 'sent', 'approved', 'rejected', 'expired'])
  @IsNotEmpty()
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
}
