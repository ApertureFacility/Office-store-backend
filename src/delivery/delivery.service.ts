import { Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateDeliveryDto, UpdateDeliveryDto } from './delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDeliveryDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.delivery.create({
      data: {
        orderId: dto.orderId,
        status: dto.status ?? DeliveryStatus.PENDING,
      },
    });
  }

  async findAll() {
    return this.prisma.delivery.findMany({
      include: { order: true },
    });
  }

  async findOne(id: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    return delivery;
  }

  async update(id: string, dto: UpdateDeliveryDto) {
    const existing = await this.prisma.delivery.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Delivery not found');

    const data: any = { ...dto };

    if (dto.status === DeliveryStatus.SHIPPED) data.shippedAt = new Date();
    if (dto.status === DeliveryStatus.DELIVERED) data.deliveredAt = new Date();

    if (dto.estimatedDelivery)
      data.estimatedDelivery = new Date(dto.estimatedDelivery);

    return this.prisma.delivery.update({
      where: { id },
      data,
    });
  }
}
