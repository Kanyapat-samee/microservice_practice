import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue({ message: 'registered' }),
            login: jest.fn().mockResolvedValue({ token: 'jwt-token' }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a user', async () => {
      const dto = {
        email: 'test@example.com',
        password: '123456',
        role: 'user' as const, // ใส่ role ที่ถูกต้องตาม RegisterDto
      };
      const result = await authController.register(dto);
      expect(result).toEqual({ message: 'registered' });
      expect(authService.register).toHaveBeenCalledWith('test@example.com', '123456', 'user');
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const result = await authController.login({
        email: 'test@example.com',
        password: '123456',
      });
      expect(result).toEqual({ token: 'jwt-token' });
      expect(authService.login).toHaveBeenCalledWith('test@example.com', '123456');
    });
  });
});