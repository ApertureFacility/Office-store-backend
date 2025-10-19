import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Введите корректный email' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Введите корректный email' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string;
}
