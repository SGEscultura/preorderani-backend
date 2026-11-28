import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 2, description: 'Role ID (e.g. FARMER or CONSUMER)' })
  @IsInt()
  role_id: number;

  @ApiProperty({ example: 'Juan Dela Cruz' })
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  user_email: string;

  @ApiProperty({ example: 'StrongPass123!', minLength: 6 })
  @IsString()
  @MinLength(6)
  user_password: string;

  @ApiPropertyOptional({ example: '09171234567' })
  @IsOptional()
  @IsString()
  user_phone?: string;

  @ApiPropertyOptional({ example: 'Polomolok' })
  @IsOptional()
  @IsString()
  user_location?: string;
}