import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from 'prisma/prisma.service';
import { SuppliersController } from './suppliers.controller';

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService, PrismaService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
