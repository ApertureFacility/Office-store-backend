import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { SafeUserEntity } from 'src/interfaces/authInterfaces';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { SafeUserDto } from './users.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Создать нового пользователя' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Пользователь успешно создан' })
  create(@Body() dto: CreateUserDto): Promise<SafeUserEntity> {
    return this.usersService.create(dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Обновить данные пользователя по email' })
  @ApiQuery({
    name: 'email',
    description: 'Email пользователя',
    required: true,
  })
  @ApiBody({ type: UpdateUserDto })
  update(
    @Query('email') email: string,
    @Body() dto: UpdateUserDto,
  ): Promise<SafeUserEntity> {
    return this.usersService.update(email, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Удалить пользователя по email' })
  @ApiQuery({
    name: 'email',
    description: 'Email пользователя',
    required: true,
  })
  delete(@Query('email') email: string): Promise<SafeUserEntity> {
    return this.usersService.deleteByEmail(email);
  }

  @Get('find-by-email')
  @ApiOperation({ summary: 'Найти пользователя по email' })
  @ApiQuery({
    name: 'email',
    description: 'Email пользователя',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь найден',
    type: SafeUserDto,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findByEmail(
    @Query('email') email: string,
  ): Promise<SafeUserEntity | null> {
    return this.usersService.findByEmail(email);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список пользователей с фильтрацией' })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  findAll(
    @Query('email') email?: string,
    @Query('role') role?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<SafeUserEntity[]> {
    return this.usersService.findAll({
      email,
      role,
      skip: Number(skip) || 0,
      take: Number(take) || 10,
    });
  }
}
