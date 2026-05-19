import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma';
import { RegisterDto, LoginDto } from './dto';
import { TokenPair } from '../common/types';
import { VirtualCardsService } from '../virtual-cards/virtual-cards.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private readonly virtualCards;
    private readonly logger;
    private static readonly SALT_ROUNDS;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, virtualCards: VirtualCardsService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: string;
            isOnboarded: boolean;
            createdAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: string;
            isOnboarded: boolean;
            createdAt: Date;
        };
    }>;
    refresh(refreshToken: string): Promise<TokenPair>;
    private generateTokens;
    private updateRefreshToken;
    private sanitizeUser;
}
