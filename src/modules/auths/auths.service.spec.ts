import { Test, TestingModule } from '@nestjs/testing';
import { AuthsService } from './auths.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  UnprocessableEntityException,
  UnauthorizedException,
} from '@nestjs/common';
import { hashPassword, checkPassword } from 'src/helpers/bcrypt.helper';
import { User } from 'src/schemas/user.schema';

// Mock bcrypt helpers
jest.mock('src/helpers/bcrypt.helper', () => ({
  hashPassword: jest.fn(),
  checkPassword: jest.fn(),
}));

describe('AuthsService', () => {
  let service: AuthsService;
  let userModel: any;
  let jwtService: JwtService;

  const mockUserDoc = (overrides = {}) => ({
    id: 'mockUserId',
    user_type: 'USER',
    save: jest.fn(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthsService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            // when called with `new this.userModel(...)`
            // it should behave like a constructor
            prototype: {},
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthsService>(AuthsService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      const dto = { name: 'Alice', email: 'alice@test.com', password: '123' };
      const userInstance = mockUserDoc();

      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (jwtService.signAsync as jest.Mock).mockResolvedValue('jwtToken');

      // Simulate `new this.userModel(...)`
      const userConstructorMock: any = jest
        .fn()
        .mockImplementation(() => userInstance);
      userConstructorMock.findOne = userModel.findOne; // keep findOne
      service = new AuthsService(userConstructorMock, jwtService);

      userInstance.save.mockResolvedValue(userInstance);

      const result = await service.register(dto);

      expect(userConstructorMock).toHaveBeenCalledWith({
        name: dto.name,
        email: dto.email,
        password: 'hashedPassword',
      });
      expect(userInstance.save).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'mockUserId',
        role: 'USER',
      });
      expect(result).toEqual({ access_token: 'jwtToken' });
    });

    it('should throw if email already exists', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue({
        id: 'existingUser',
      });
      const dto = { name: 'Bob', email: 'bob@test.com', password: '123' };

      await expect(service.register(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw if hashPassword fails', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue(null);
      const dto = { name: 'Eve', email: 'eve@test.com', password: '123' };

      await expect(service.register(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const dto = { email: 'alice@test.com', password: '123' };
      const user = mockUserDoc({ password: 'hashedPassword' });

      (userModel.findOne as jest.Mock).mockResolvedValue(user);
      (checkPassword as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('jwtToken');

      const result = await service.login(dto);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: dto.email });
      expect(checkPassword).toHaveBeenCalledWith('123', 'hashedPassword');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'mockUserId',
        role: 'USER',
      });
      expect(result).toEqual({ access_token: 'jwtToken' });
    });

    it('should throw if user not found', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      const dto = { email: 'notfound@test.com', password: '123' };

      await expect(service.login(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw if password is incorrect', async () => {
      const user = mockUserDoc({ password: 'hashedPassword' });
      (userModel.findOne as jest.Mock).mockResolvedValue(user);
      (checkPassword as jest.Mock).mockResolvedValue(false);

      const dto = { email: 'alice@test.com', password: 'wrong' };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
