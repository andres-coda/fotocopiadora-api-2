import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { NivelController } from '../nivel.controller';
import { NivelService } from '../nivel.service';
import { UsuarioGuard } from '@src/auth/guard/user.guard';

describe('NivelController', () => {
  let controller: NivelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NivelController],
      providers: [{ provide: NivelService, useValue: {} }],
    })
      .overrideGuard(UsuarioGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<NivelController>(NivelController);
  });

  afterEach(() => jest.restoreAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
