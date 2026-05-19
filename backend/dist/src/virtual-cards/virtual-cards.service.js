"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VirtualCardsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualCardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
let VirtualCardsService = VirtualCardsService_1 = class VirtualCardsService {
    prisma;
    logger = new common_1.Logger(VirtualCardsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createForUser(userId, holderName) {
        const cardNumber = this.generateCardNumber();
        const cvv = this.generateCvv();
        const now = new Date();
        const card = await this.prisma.virtualCard.create({
            data: {
                userId,
                cardNumber,
                expiryMonth: now.getMonth() + 1,
                expiryYear: now.getFullYear() + 3,
                cvv,
                cardHolder: holderName.toUpperCase(),
                balance: 10000.0,
                provider: 'SmartPay',
                status: 'ACTIVE',
            },
        });
        this.logger.log(`Virtual card created for user ${userId}: ****${card.cardNumber.slice(-4)}`);
        return card;
    }
    async getByUserId(userId) {
        return this.prisma.virtualCard.findUnique({
            where: { userId },
        });
    }
    async deductBalance(userId, amount) {
        const card = await this.prisma.virtualCard.findUniqueOrThrow({
            where: { userId },
        });
        const currentBalance = Number(card.balance);
        if (currentBalance < amount) {
            throw new Error('Insufficient virtual card balance');
        }
        return this.prisma.virtualCard.update({
            where: { userId },
            data: { balance: currentBalance - amount },
        });
    }
    generateCardNumber() {
        const prefix = '4903';
        let number = prefix;
        for (let i = 0; i < 11; i++) {
            number += Math.floor(Math.random() * 10).toString();
        }
        number += this.luhnCheckDigit(number);
        return number;
    }
    luhnCheckDigit(partial) {
        const digits = partial.split('').map(Number).reverse();
        let sum = 0;
        for (let i = 0; i < digits.length; i++) {
            let d = digits[i];
            if (i % 2 === 0) {
                d *= 2;
                if (d > 9)
                    d -= 9;
            }
            sum += d;
        }
        return ((10 - (sum % 10)) % 10).toString();
    }
    generateCvv() {
        return Math.floor(100 + Math.random() * 900).toString();
    }
};
exports.VirtualCardsService = VirtualCardsService;
exports.VirtualCardsService = VirtualCardsService = VirtualCardsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], VirtualCardsService);
//# sourceMappingURL=virtual-cards.service.js.map