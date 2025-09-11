import { Test, TestingModule } from '@nestjs/testing';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';
import { UserType } from 'src/schemas/user.schema';
import { RegisterDto, LoginDto } from './auths.dto';

describe('AuthsController', () => {
  let controller: AuthsController;
  let service: AuthsService;

  const mockAuthsService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthsController],
      providers: [
        {
          provide: AuthsService,
          useValue: mockAuthsService,
        },
      ],
    }).compile();

    controller = module.get<AuthsController>(AuthsController);
    service = module.get<AuthsService>(AuthsService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call service.register and return token', async () => {
      const dto: RegisterDto = {
        name: 'Alice',
        email: 'alice@test.com',
        password: '123',
      };
      const mockResult = { access_token: 'jwtToken' };

      (service.register as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.register(dto);

      expect(service.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('login', () => {
    it('should call service.login and return token', async () => {
      const dto: LoginDto = { email: 'alice@test.com', password: '123' };
      const mockResult = { access_token: 'jwtToken' };

      (service.login as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.login(dto);

      expect(service.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('isAdmin', () => {
    it('should return true if user role is ADMIN', async () => {
      const user = { role: UserType.ADMIN };
      const result = await controller.isAdmin(user);
      expect(result).toBe(true);
    });

    it('should return false if user role is not ADMIN', async () => {
      const user = { role: UserType.VOTER };
      const result = await controller.isAdmin(user);
      expect(result).toBe(false);
    });
  });
});
