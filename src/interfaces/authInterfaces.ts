import { Role } from '@prisma/client';

export interface JwtPayloadInterface {
  sub: string;
  email: string;
}
export interface UserEntity {
  id: string;
  email: string;
  passwordHash?: string;
}

export interface RefreshTokenEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface JwtValidatedUser {
  userId: string;
  email: string;
}

export interface SafeUserEntity {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
}
export interface FullUserEntity extends SafeUserEntity {
  passwordHash: string;
}
