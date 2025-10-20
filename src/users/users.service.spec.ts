import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const dto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'John Doe',
    };

    const mockUser = {
      id: 'uuid-1',
      email: dto.email,
      name: dto.name,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);

    const user = await service.create(dto);
    expect(user).toEqual(mockUser);
  });

  it('should find user by email', async () => {
    const email = 'test@example.com';
    const mockUser = {
      id: 'uuid-1',
      email,
      name: 'John Doe',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

    const user = await service.findByEmail(email);
    expect(user).toEqual(mockUser);
  });

  it('should update user', async () => {
    const dto: UpdateUserDto = { name: 'New Name' };
    const mockUser = {
      id: 'uuid-1',
      email: 'test@example.com',
      name: dto.name,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any);

    const user = await service.update('test@example.com', dto);
    expect(user).toEqual(mockUser);
  });

  it('should delete user by email', async () => {
    const mockUser = {
      id: 'uuid-1',
      email: 'test@example.com',
      name: 'John Doe',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUser as any);

    const user = await service.deleteByEmail('test@example.com');
    expect(user).toEqual(mockUser);
  });
});
