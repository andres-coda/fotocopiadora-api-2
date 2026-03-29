import { Module } from '@nestjs/common';
import { ErroresService } from './error.service';

@Module({
  providers: [ErroresService],
  exports: [ErroresService]
})
export class ErroresModule { }
