import { IsEmail, IsString, IsPhoneNumber, IsOptional } from 'class-validator';

export class CreateSupplierDto {
  @IsEmail({}, { message: 'Введите корректный email' })
  email: string;

  @IsString({ message: 'Имя должно быть строкой' })
  name: string;

  @IsPhoneNumber(undefined, {
    message: 'Укажите корректный номер телефона поставщика',
  })
  phone: string;

  @IsString({ message: 'Адрес должен быть строкой' })
  address: string;
}

export class UpdateSupplierDto {
  @IsOptional()
  @IsEmail({}, { message: 'Введите корректный email' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name: string;

  @IsOptional()
  @IsPhoneNumber(undefined, {
    message: 'Укажите корректный номер телефона поставщика',
  })
  phone: string;

  @IsOptional()
  @IsString({ message: 'Адрес должен быть строкой' })
  address: string;
}
