import {
  IsUUID,
  IsOptional,
  IsEnum,
  IsDateString,
  IsString,
} from 'class-validator';
import { DeliveryStatus } from '@prisma/client';

export class CreateDeliveryDto {
  @IsUUID()
  orderId: string;

  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus = DeliveryStatus.PENDING;
}
export class UpdateDeliveryDto {
  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;
}
export class DeliveryStatusDto {
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;
}
