import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  pre_order_id: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  payment_method_id: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Defaults to first/initial payment status if omitted',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  payment_status_id?: number;

  @ApiPropertyOptional({ example: 'GCASH-REF-987654321' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  payment_reference?: string;

  @ApiPropertyOptional({ example: 'Initial payment submitted via GCash' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  log_note?: string;
}