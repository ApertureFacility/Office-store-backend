/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  UserEntity,
  RefreshTokenEntity,
  AuthToken,
} from 'src/interfaces/authInterfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = (await this.usersService.findByEmail(email)) as UserEntity;
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

    return user;
  }

  async generateTokens(userId: string, email: string): Promise<AuthToken> {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    try {
      const createdToken = (await this.prisma.refreshToken.create({
        data: {
          userId,
          tokenHash: hashedRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })) as RefreshTokenEntity;

      console.log(' Refresh token saved in DB:', createdToken);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(' Error saving refresh token:', message);
      throw new Error(message);
    }

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string): Promise<AuthToken> {
    const user = await this.validateUser(email, password);
    return this.generateTokens(user.id, user.email);
  }

  async register(dto: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthToken> {
    const existing = (await this.usersService.findByEmail(
      dto.email,
    )) as UserEntity | null;
    if (existing) throw new UnauthorizedException('Email already in use');

    const newUser = (await this.usersService.create(dto)) as UserEntity;
    return this.generateTokens(newUser.id, newUser.email);
  }

  async refresh(userId: string, oldRefreshToken: string): Promise<AuthToken> {
    const tokenInDb = (await this.prisma.refreshToken.findFirst({
      where: { userId },
    })) as RefreshTokenEntity | null;

    if (!tokenInDb) throw new UnauthorizedException('Refresh token not found');

    const isValid = await bcrypt.compare(oldRefreshToken, tokenInDb.tokenHash);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    await this.prisma.refreshToken.delete({ where: { id: tokenInDb.id } });

    const user = (await this.usersService.findById(userId)) as UserEntity;
    if (!user) throw new UnauthorizedException('User not found');

    return this.generateTokens(user.id, user.email);
  }

  async revokeRefreshToken(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
