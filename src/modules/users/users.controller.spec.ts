import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Types } from 'mongoose';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    getUsers: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return users for a given user.sub', async () => {
      const mockUser = { sub: 'user123' };
      const mockResult = [{ name: 'Alice' }, { name: 'Bob' }];

      (service.getUsers as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getUsers(mockUser);

      expect(service.getUsers).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by id', async () => {
      const validId = new Types.ObjectId().toString();
      const mockResult = { message: 'delete success' };

      (service.deleteUser as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.deleteUser(validId);

      expect(service.deleteUser).toHaveBeenCalledWith(validId);
      expect(result).toEqual(mockResult);
    });

    it('should throw if service.deleteUser throws', async () => {
      const validId = new Types.ObjectId().toString();

      (service.deleteUser as jest.Mock).mockRejectedValue(
        new Error('Delete failed'),
      );

      await expect(controller.deleteUser(validId)).rejects.toThrow(
        'Delete failed',
      );
    });
  });
});
