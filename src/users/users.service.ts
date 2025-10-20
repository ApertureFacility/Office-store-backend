// src/users/users.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { CreateUserDto, UpdateUserDto } from './users.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';
import { SafeUserEntity, FullUserEntity } from 'src/interfaces/authInterfaces';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<SafeUserEntity> {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      return this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          name: dto.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Email already in use');
      }
      throw err;
    }
  }

  async update(email: string, dto: UpdateUserDto): Promise<SafeUserEntity> {
    const data: Prisma.UserUpdateInput = {};
    if (dto.name) data.name = dto.name;
    if (dto.email) data.email = dto.email;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { email },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteByEmail(email: string): Promise<SafeUserEntity> {
    return this.prisma.user.delete({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(filters: {
    email?: string;
    role?: string;
    skip?: number;
    take?: number;
  }): Promise<SafeUserEntity[]> {
    const where: Prisma.UserWhereInput = {};

    if (filters.email) {
      where.email = {
        contains: decodeURIComponent(filters.email),
        mode: 'insensitive',
      };
    }

    if (filters.role && ['USER', 'MANAGER', 'ADMIN'].includes(filters.role)) {
      where.role = filters.role as Role;
    }

    return this.prisma.user.findMany({
      where,
      skip: filters.skip ?? 0,
      take: filters.take ?? 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(
    email: string,
    withPassword = false,
  ): Promise<SafeUserEntity | FullUserEntity | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: withPassword
        ? {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
            createdAt: true,
            updatedAt: true,
          }
        : {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
    });
  }
}
