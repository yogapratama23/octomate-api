import { AuthGuard } from './auths.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  // Fake ExecutionContext
  const createMockContext = (req: any = {}) =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() } as any;
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new AuthGuard(jwtService, reflector);
  });

  it('should return true if route is public', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const context = createMockContext();
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    const req = { headers: {} };
    const context = createMockContext(req);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const req = {
      headers: { authorization: 'Bearer invalidtoken' },
    };
    const context = createMockContext(req);

    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('bad'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return true and attach payload if token is valid', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const req: any = {
      headers: { authorization: 'Bearer validtoken' },
    };
    const context = createMockContext(req);

    const fakePayload = { userId: '123', role: 'ADMIN' };
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(fakePayload);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(req.user).toEqual(fakePayload);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('validtoken', {
      secret: process.env.JWT_SECRET,
    });
  });
});
