import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: {} }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
