import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  name: string;

  @IsString({ message: 'URL-ключ должен быть строкой' })
  @IsNotEmpty({ message: 'URL-ключ не может быть пустым' })
  urlKey: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name: string;

  @IsOptional()
  @IsString({ message: 'URL-ключ должен быть строкой' })
  urlKey: string;
}
