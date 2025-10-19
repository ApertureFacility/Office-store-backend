import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SuppliersModule } from './suppliers/supplires.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CategoriesModule } from './сategories/categories.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    SuppliersModule,
    AuthModule,
    ReviewsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
