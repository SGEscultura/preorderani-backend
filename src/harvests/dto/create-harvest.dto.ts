import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateHarvestDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  crop_id: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  unit_id: number;

  @ApiPropertyOptional({ example: 1, description: 'Defaults to first/available status if omitted' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  harvest_status_id?: number;

  @ApiProperty({ example: 150.5 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  harvest_quantity: number;

  @ApiProperty({ example: 65.0 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  harvest_price_per_unit: number;

  @ApiProperty({ example: '2026-12-15' })
  @IsDateString()
  harvest_date: string;

  @ApiProperty({ example: 'Brgy. Silway 8, Polomolok' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  harvest_location: string;

  @ApiPropertyOptional({ example: 'Sweet Queen pineapples, freshly harvested' })
  @IsOptional()
  @IsString()
  harvest_description?: string;
}