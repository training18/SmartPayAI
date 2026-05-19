/**
 * JWT payload interface — decoded from the access token.
 *
 * Exported as both a value (class) and type so NestJS decorator metadata
 * reflection works with `isolatedModules` + `emitDecoratorMetadata`.
 */
export class JwtPayload {
  sub: string;       // user ID
  email: string;
  role: string;
}

/**
 * Token pair returned on login/register/refresh.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
