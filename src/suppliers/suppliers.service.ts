import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSupplierDto, UpdateSupplierDto } from './suppliers.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSupplierDto) {
    const existing = await this.prisma.supplier.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Поставщик с таким email уже существует');
    }

    return this.prisma.supplier.create({ data: dto });
  }

  async findAll({
    page = 1,
    limit = 20,
    search = '',
    withProducts = false,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    withProducts?: boolean;
  }) {
    const MAX_LIMIT = 100;
    const safeLimit = Math.min(limit, MAX_LIMIT);
    const skip = (page - 1) * safeLimit;

    const where: Prisma.SupplierWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              email: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        include: withProducts ? { products: true } : undefined,
        orderBy: { name: 'asc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data: suppliers,
      meta: {
        page,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(email: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { email },
      include: { products: true },
    });

    if (!supplier) {
      throw new NotFoundException('Поставщик не найден');
    }

    return supplier;
  }

  async update(email: string, dto: UpdateSupplierDto) {
    const existing = await this.prisma.supplier.findUnique({
      where: { email },
    });
    if (!existing) {
      throw new NotFoundException('Поставщик не найден');
    }

    if (dto.email && dto.email !== email) {
      const emailExists = await this.prisma.supplier.findUnique({
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new ConflictException(
          'Поставщик с таким новым email уже существует',
        );
      }
    }

    return this.prisma.supplier.update({
      where: { email },
      data: dto,
    });
  }

  async delete(email: string) {
    const existing = await this.prisma.supplier.findUnique({
      where: { email },
    });
    if (!existing) {
      throw new NotFoundException('Поставщик не найден');
    }

    return this.prisma.supplier.delete({ where: { email } });
  }
}
