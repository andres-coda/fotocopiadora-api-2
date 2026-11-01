import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { AdminGuard } from '@src/auth/guard/admin.guard';
import { UsuarioGuard } from '@src/auth/guard/user.guard';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: {} }],
    })
      .overrideGuard(UsuarioGuard)
      .useValue({ canActivate: () => true } as any)
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true } as any)
      .compile();
    controller = module.get<UserController>(UserController);
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
