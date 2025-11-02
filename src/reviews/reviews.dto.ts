import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'uuid', description: 'ID продукта' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 5, description: 'Оценка от 1 до 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Отличный товар!', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 4, description: 'Обновлённая оценка' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: 'Теперь думаю иначе...' })
  @IsOptional()
  @IsString()
  comment?: string;
}
