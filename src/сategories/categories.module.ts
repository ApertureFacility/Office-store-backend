import { Module } from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { PrismaService } from 'prisma/prisma.service';
import { CategoriesController } from './categories.controller';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService],
})
export class CategoriesModule {}
