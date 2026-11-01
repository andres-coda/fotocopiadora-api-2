import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaController } from '../empresa.controller';
import { EmpresaService } from '../empresa.service';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { SuperAdminGuard } from '@src/auth/guard/superAdmin.guard';

describe('EmpresaController', () => {
  let controller: EmpresaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpresaController],
      providers: [{ provide: EmpresaService, useValue: {} }],
    })
      .overrideGuard(UsuarioGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(SuperAdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<EmpresaController>(EmpresaController);
  });

  afterEach(() => jest.restoreAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
