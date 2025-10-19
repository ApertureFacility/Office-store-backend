import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreateReviewDto } from './reviews.dto';
import { ReviewsService } from './reviews.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createReview(@Request() req, @Body() dto: CreateReviewDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.reviewsService.createReview(req.user.userId, dto);
  }

  @Get('product/:id')
  getReviews(@Param('id') productId: string) {
    return this.reviewsService.getReviewsByProduct(productId);
  }
}
