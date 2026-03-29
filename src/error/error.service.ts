import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class ErroresService {
  public handleExceptions(error: any, customMessage: string): never {
    if (error instanceof ConflictException) {
      throw new HttpException(
        { status: HttpStatus.CONFLICT, message: customMessage, error: error.message },
        HttpStatus.CONFLICT
      );
    } else if (error instanceof HttpException) {
      throw error;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `${customMessage}`,
          error: error?.message || error
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
