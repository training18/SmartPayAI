"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma_1 = require("../prisma");
const virtual_cards_service_1 = require("../virtual-cards/virtual-cards.service");
let AuthService = class AuthService {
    static { AuthService_1 = this; }
    prisma;
    jwt;
    config;
    virtualCards;
    logger = new common_1.Logger(AuthService_1.name);
    static SALT_ROUNDS = 12;
    constructor(prisma, jwt, config, virtualCards) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.virtualCards = virtualCards;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, AuthService_1.SALT_ROUNDS);
        const role = dto.role ?? client_1.UserRole.PERSONAL;
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                fullName: dto.fullName,
                role,
            },
        });
        if (role === client_1.UserRole.PERSONAL) {
            await this.virtualCards.createForUser(user.id, user.fullName);
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        this.logger.log(`User registered: ${user.email}`);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        this.logger.log(`User logged in: ${user.email}`);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwt.verify(refreshToken, {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || !user.refreshToken) {
                throw new common_1.UnauthorizedException('Access denied');
            }
            const tokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
            if (!tokenValid) {
                throw new common_1.UnauthorizedException('Access denied');
            }
            const tokens = await this.generateTokens(user.id, user.email, user.role);
            await this.updateRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async generateTokens(sub, email, role) {
        const payload = { sub, email, role };
        const accessExpiry = this.config.getOrThrow('JWT_EXPIRATION');
        const refreshExpiry = this.config.getOrThrow('JWT_REFRESH_EXPIRATION');
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.getOrThrow('JWT_SECRET'),
                expiresIn: accessExpiry,
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
                expiresIn: refreshExpiry,
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hashed = await bcrypt.hash(refreshToken, AuthService_1.SALT_ROUNDS);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hashed },
        });
    }
    sanitizeUser(user) {
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isOnboarded: user.isOnboarded,
            createdAt: user.createdAt,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        virtual_cards_service_1.VirtualCardsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map