import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePaymentStatusDto {
  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  payment_status_id: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  payment_method_id?: number;

  @ApiPropertyOptional({ example: 'GCASH-REF-987654321' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  payment_reference?: string;

  @ApiPropertyOptional({ example: 'Verified payment receipt by farmer' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  log_note?: string;
}