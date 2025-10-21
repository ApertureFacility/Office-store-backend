import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsPhoneNumber, IsOptional } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email поставщика (уникальный)',
  })
  @IsEmail({}, { message: 'Введите корректный email' })
  email: string;

  @ApiProperty({
    example: 'ООО Ромашка',
    description: 'Название или имя поставщика',
  })
  @IsString({ message: 'Имя должно быть строкой' })
  name: string;

  @ApiProperty({
    example: '+79991234567',
    description: 'Телефон поставщика в международном формате',
  })
  @IsPhoneNumber(undefined, { message: 'Укажите корректный номер телефона' })
  phone: string;

  @ApiProperty({
    example: 'г. Москва, ул. Ленина, д. 10',
    description: 'Адрес поставщика',
  })
  @IsString({ message: 'Адрес должен быть строкой' })
  address: string;
}

export class UpdateSupplierDto {
  @ApiProperty({
    example: 'newmail@example.com',
    description: 'Email (опционально)',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Введите корректный email' })
  email?: string;

  @ApiProperty({
    example: 'ООО Ландыш',
    description: 'Название поставщика (опционально)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string;

  @ApiProperty({
    example: '+79995554433',
    description: 'Телефон поставщика (опционально)',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Укажите корректный номер телефона' })
  phone?: string;

  @ApiProperty({
    example: 'г. Санкт-Петербург, Невский пр., д. 25',
    description: 'Адрес поставщика (опционально)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Адрес должен быть строкой' })
  address?: string;
}
