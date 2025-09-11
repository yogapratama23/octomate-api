import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserType } from 'src/schemas/user.schema';
import { Types } from 'mongoose';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  beforeEach(async () => {
    userModel = {
      find: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('getUsers', () => {
    it('should return list of users excluding current user and admins', async () => {
      const mockUsers = [
        {
          _id: new Types.ObjectId(),
          name: 'User 1',
          user_type: UserType.VOTER,
        },
        {
          _id: new Types.ObjectId(),
          name: 'User 2',
          user_type: UserType.VOTER,
        },
      ];

      const execMock = jest.fn().mockResolvedValue(mockUsers);
      userModel.find.mockReturnValue({ exec: execMock });

      const result = await service.getUsers('123');

      expect(userModel.find).toHaveBeenCalledWith({
        _id: { $ne: '123' },
        user_type: { $ne: UserType.ADMIN },
      });
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should throw if find fails', async () => {
      userModel.find.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.getUsers('123')).rejects.toThrow('DB error');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by id', async () => {
      const validId = new Types.ObjectId().toString();

      userModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await service.deleteUser(validId);

      expect(userModel.deleteOne).toHaveBeenCalledWith(
        new Types.ObjectId(validId),
      );
      expect(result).toEqual({ message: 'delete success' });
    });

    it('should throw if delete fails', async () => {
      const validId = new Types.ObjectId().toString();

      userModel.deleteOne.mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteUser(validId)).rejects.toThrow(
        'Delete failed',
      );
    });
  });
});
