import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'passwordActual123' })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ example: 'nuevaPassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
