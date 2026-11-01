import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { EditorialController } from '../editorial.controller';
import { EditorialService } from '../editorial.service';
import { UsuarioGuard } from '@src/auth/guard/user.guard';

describe('EditorialController', () => {
  let controller: EditorialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditorialController],
      providers: [{ provide: EditorialService, useValue: {} }],
    })
      .overrideGuard(UsuarioGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<EditorialController>(EditorialController);
  });

  afterEach(() => jest.restoreAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
