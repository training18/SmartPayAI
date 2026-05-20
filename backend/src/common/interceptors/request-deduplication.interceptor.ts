import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

/**
 * Intercepts parallel requests (e.g. button double-taps) and blocks duplicates.
 */
@Injectable()
export class RequestDeduplicationInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Deduplication');
  private readonly activeRequests = new Set<string>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body } = request;

    // Only apply deduplication on POST /transactions/initiate
    if (method !== 'POST' || !url.includes('/transactions/initiate')) {
      return next.handle();
    }

    const userId = user?.sub || user?.id || 'anonymous';
    const amount = body?.amount ?? '';
    const merchantName = body?.merchantName ?? '';

    const requestKey = `${userId}:${method}:${url}:${merchantName}:${amount}`;

    if (this.activeRequests.has(requestKey)) {
      this.logger.warn(`Duplicate request blocked for user ${userId}: ${requestKey}`);
      throw new ConflictException(
        'Bu işlem zaten gerçekleştiriliyor. Lütfen bekleyin.',
      );
    }

    this.activeRequests.add(requestKey);
    this.logger.debug(`Registering active request key: ${requestKey}`);

    return next.handle().pipe(
      finalize(() => {
        this.activeRequests.delete(requestKey);
        this.logger.debug(`Cleared request key: ${requestKey}`);
      }),
    );
  }
}
