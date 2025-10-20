import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUserService = {
    findByEmail: jest.fn().mockResolvedValue({
      id: 'uuid-1',
      email: 'test@example.com',
      name: 'John Doe',
      role: 'USER',
      createdAt: new Date(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find user by email', async () => {
    const user = await controller.findByEmail('test@example.com');
    expect(user).not.toBeNull();
    expect(user?.email).toBe('test@example.com');
    expect(user?.id).toBe('uuid-1');
  });
});
