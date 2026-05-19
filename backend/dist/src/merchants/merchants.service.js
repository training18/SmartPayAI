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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
let MerchantsService = class MerchantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByName(merchantName) {
        const normalized = this.normalize(merchantName);
        return this.prisma.merchant.findUnique({
            where: { normalizedName: normalized },
        });
    }
    async upsert(data) {
        const normalized = this.normalize(data.name);
        const metadata = (data.aiMetadata ?? {});
        return this.prisma.merchant.upsert({
            where: { normalizedName: normalized },
            create: {
                name: data.name,
                normalizedName: normalized,
                category: data.category,
                mcc: data.mcc,
                spendingType: data.spendingType,
                aiMetadata: metadata,
            },
            update: {
                category: data.category,
                mcc: data.mcc,
                spendingType: data.spendingType,
                aiMetadata: metadata,
            },
        });
    }
    normalize(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    }
};
exports.MerchantsService = MerchantsService;
exports.MerchantsService = MerchantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], MerchantsService);
//# sourceMappingURL=merchants.service.js.map