import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    const existingReview = await this.prisma.review.findFirst({
      where: { userId, productId: dto.productId },
    });
    if (existingReview) {
      throw new BadRequestException('Вы уже оставили отзыв для этого товара');
    }

    return this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async getReviewsByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReview(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }
    if (review.userId !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужой отзыв');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: dto,
    });
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }
    if (review.userId !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужой отзыв');
    }

    await this.prisma.review.delete({ where: { id: reviewId } });
  }
}
