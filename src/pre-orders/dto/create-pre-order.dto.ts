import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreatePreOrderDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  harvest_id: number;

  @ApiProperty({ example: 25.5 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  pre_order_quantity: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Defaults to first/initial status if omitted',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pre_order_status_id?: number;
}