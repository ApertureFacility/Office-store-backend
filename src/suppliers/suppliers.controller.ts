import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './suppliers.dto';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Создать нового поставщика' })
  @ApiResponse({ status: 201, description: 'Поставщик успешно создан' })
  @ApiBody({ type: CreateSupplierDto })
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список поставщиков (с пагинацией и поиском)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'ООО Ромашка' })
  @ApiQuery({ name: 'withProducts', required: false, example: false })
  @ApiResponse({ status: 200, description: 'Список поставщиков' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('withProducts') withProducts?: string,
  ) {
    const parsedWithProducts =
      typeof withProducts === 'string'
        ? withProducts.toLowerCase() === 'true'
        : false;

    return this.suppliersService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search: search || '',
      withProducts: parsedWithProducts,
    });
  }

  @Get(':email')
  @ApiOperation({ summary: 'Получить одного поставщика по email' })
  findOne(@Param('email') email: string) {
    return this.suppliersService.findOne(email);
  }

  @Patch(':email')
  @ApiOperation({ summary: 'Обновить данные поставщика по email' })
  update(@Param('email') email: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(email, dto);
  }

  @Delete(':email')
  @ApiOperation({ summary: 'Удалить поставщика по email' })
  delete(@Param('email') email: string) {
    return this.suppliersService.delete(email);
  }
}
