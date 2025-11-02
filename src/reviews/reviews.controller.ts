import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  Delete,
  Patch,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateReviewDto, UpdateReviewDto } from './reviews.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createReview(@Request() req, @Body() dto: CreateReviewDto) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('Не удалось определить пользователя');
    }

    return this.reviewsService.createReview(userId, dto);
  }

  @Get('product/:id')
  async getReviews(@Param('id') productId: string) {
    const reviews = await this.reviewsService.getReviewsByProduct(productId);
    if (!reviews.length) {
      throw new NotFoundException('Отзывы не найдены');
    }
    return reviews;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateReview(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(req.user.userId, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(@Param('id') id: string, @Request() req) {
    await this.reviewsService.deleteReview(req.user.userId, id);
  }
}
