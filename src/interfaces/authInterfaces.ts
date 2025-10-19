export interface JwtPayloadInterface {
  sub: string;
  email: string;
}
export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
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
