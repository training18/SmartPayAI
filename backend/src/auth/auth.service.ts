import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma';
import { RegisterDto, LoginDto } from './dto';
import { TokenPair } from '../common/types';
import { VirtualCardsService } from '../virtual-cards/virtual-cards.service';

/**
 * Authentication service — handles registration, login, and token refresh.
 *
 * On registration, automatically provisions a demo virtual card for the user.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private static readonly SALT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly virtualCards: VirtualCardsService,
  ) {}

  /** Register a new user + auto-create virtual card. */
  async register(dto: RegisterDto) {
    // Check for existing user
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, AuthService.SALT_ROUNDS);

    // Create user (role defaults to PERSONAL when omitted)
    const role = dto.role ?? UserRole.PERSONAL;
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role,
      },
    });

    // Auto-create demo virtual card only for personal accounts;
    // merchants are payment recipients and don't need one.
    if (role === UserRole.PERSONAL) {
      await this.virtualCards.createForUser(user.id, user.fullName);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Store hashed refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`User registered: ${user.email}`);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  /** Authenticate with email + password. */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`User logged in: ${user.email}`);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  /** Issue new token pair from a valid refresh token. */
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access denied');
      }

      const tokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!tokenValid) {
        throw new UnauthorizedException('Access denied');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.updateRefreshToken(user.id, tokens.refreshToken);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private async generateTokens(sub: string, email: string, role: string): Promise<TokenPair> {
    const payload = { sub, email, role };
    const accessExpiry = this.config.getOrThrow<string>('JWT_EXPIRATION');
    const refreshExpiry = this.config.getOrThrow<string>('JWT_REFRESH_EXPIRATION');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: accessExpiry as any,
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiry as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, AuthService.SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }

  private sanitizeUser(user: { id: string; email: string; fullName: string; role: string; isOnboarded: boolean; createdAt: Date }) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isOnboarded: user.isOnboarded,
      createdAt: user.createdAt,
    };
  }
}
