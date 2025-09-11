import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserType } from 'src/schemas/user.schema';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const createMockContext = (user: any = {}) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  it('should return true if no roles are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    const context = createMockContext({ role: UserType.ADMIN });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true if user role is ADMIN and ADMIN is required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserType.ADMIN,
    ]);

    const context = createMockContext({ role: UserType.ADMIN });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true if user role is VOTER and VOTER is required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserType.VOTER,
    ]);

    const context = createMockContext({ role: UserType.VOTER });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return false if user role is VOTER but ADMIN is required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserType.ADMIN,
    ]);

    const context = createMockContext({ role: UserType.VOTER });
    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should return false if user role is ADMIN but VOTER is required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserType.VOTER,
    ]);

    const context = createMockContext({ role: UserType.ADMIN });
    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });
});
