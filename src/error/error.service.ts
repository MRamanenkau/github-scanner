import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

@Injectable()
export class ErrorService {
  private readonly logger = new Logger('ErrorService');

  handle(error: unknown, context: string): never {
    if (error instanceof AxiosError) {
      this.logger.error(
        `GitHub API error while trying to ${context}`,
        error.response?.data,
      );
    } else if (error instanceof Error) {
      this.logger.error(
        `Unexpected error while trying to ${context}`,
        error.message,
      );
    } else {
      this.logger.error(`Unknown error while trying to ${context}`, error);
    }

    throw new Error(`Failed to ${context}`);
  }
}
