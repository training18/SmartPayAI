import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class RequestDeduplicationInterceptor implements NestInterceptor {
    private readonly logger;
    private readonly activeRequests;
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
