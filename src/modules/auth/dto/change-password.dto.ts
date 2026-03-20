import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'passwordActual123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'passwordNueva123', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
