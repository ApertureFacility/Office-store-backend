import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя (уникальный)',
  })
  @IsEmail({}, { message: 'Введите корректный email' })
  email: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Пароль (минимум 6 символов)',
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  password: string;

  @ApiPropertyOptional({
    example: 'Иван Иванов',
    description: 'Имя пользователя (необязательно)',
  })
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'new@example.com',
    description: 'Новый email (если нужно изменить)',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Введите корректный email' })
  email?: string;

  @ApiPropertyOptional({
    example: 'newPassword456',
    description: 'Новый пароль (если нужно изменить)',
  })
  @IsOptional()
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  password?: string;

  @ApiPropertyOptional({
    example: 'Иван Петров',
    description: 'Новое имя пользователя',
  })
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string;
}
export class SafeUserDto {
  @ApiProperty({ example: '218a439e-15aa-49cd-b188-2ac52f2fed99' })
  id: string;

  @ApiProperty({ example: 'test@gmail.com' })
  email: string;

  @ApiProperty({ example: 'Иван Иванов', nullable: true })
  name: string | null;

  @ApiProperty({ example: 'USER', enum: Role })
  role: Role;

  @ApiProperty({ example: '2025-10-20T12:34:56.789Z' })
  createdAt: Date;
}
