import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  recipients: string[];
}
