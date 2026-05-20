import { RequestDeduplicationInterceptor } from './request-deduplication.interceptor';
import { ExecutionContext, CallHandler, ConflictException } from '@nestjs/common';
import { of } from 'rxjs';

describe('RequestDeduplicationInterceptor', () => {
  let interceptor: RequestDeduplicationInterceptor;

  beforeEach(() => {
    interceptor = new RequestDeduplicationInterceptor();
  });

  it('should allow single request to pass through', async () => {
    const mockRequest = {
      method: 'POST',
      url: '/transactions/initiate',
      user: { sub: 'user-123' },
      body: { amount: 100, merchantName: 'Migros' },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockHandler = {
      handle: () => of('result'),
    } as CallHandler;

    const result = await interceptor.intercept(mockContext, mockHandler).toPromise();
    expect(result).toBe('result');
  });

  it('should block parallel duplicate requests with ConflictException', async () => {
    const mockRequest = {
      method: 'POST',
      url: '/transactions/initiate',
      user: { sub: 'user-123' },
      body: { amount: 100, merchantName: 'Migros' },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    // Simulate handler
    const mockHandler = {
      handle: () => of('result'),
    } as CallHandler;

    // First request is initiated (registers the key in Set)
    interceptor.intercept(mockContext, mockHandler);

    // Second request is made concurrently before the first one completes/clears the key
    expect(() => {
      interceptor.intercept(mockContext, mockHandler);
    }).toThrow(ConflictException);
  });
});
