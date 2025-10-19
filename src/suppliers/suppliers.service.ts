import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './suppliers.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  // Создание нового поставщика
  create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        name: dto.name,
        address: dto.address,
      },
    });
  }

  // Получение всех поставщиков
  findAll() {
    return this.prisma.supplier.findMany();
  }

  // Получение одного поставщика по id
  findOne(id: string) {
    return this.prisma.supplier.findUnique({
      where: { id },
    });
  }

  // Обновление поставщика
  update(id: string, dto: UpdateSupplierDto) {
    return this.prisma.supplier.update({
      where: { id },
      data: { ...dto },
    });
  }

  // Удаление поставщика
  delete(id: string) {
    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}
