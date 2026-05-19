import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as publicly accessible — bypasses JWT guard.
 *
 * Usage: `@Public()` on a controller method.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
