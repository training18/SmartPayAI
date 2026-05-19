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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const merchant_intelligence_service_1 = require("./merchant-intelligence.service");
const card_recommendation_service_1 = require("./card-recommendation.service");
const decorators_1 = require("../common/decorators");
const types_1 = require("../common/types");
class AnalyzeMerchantDto {
    merchantName;
    mcc;
}
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'Migros' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyzeMerchantDto.prototype, "merchantName", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ example: '5411' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyzeMerchantDto.prototype, "mcc", void 0);
class RecommendCardDto {
    merchantName;
    merchantCategory;
    amount;
    currency;
}
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'Migros' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecommendCardDto.prototype, "merchantName", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'grocery' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecommendCardDto.prototype, "merchantCategory", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ example: 350.0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecommendCardDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ example: 'TRY' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecommendCardDto.prototype, "currency", void 0);
let AiController = class AiController {
    merchantIntel;
    cardRecommendation;
    constructor(merchantIntel, cardRecommendation) {
        this.merchantIntel = merchantIntel;
        this.cardRecommendation = cardRecommendation;
    }
    analyzeMerchant(dto) {
        return this.merchantIntel.analyze(dto.merchantName, dto.mcc);
    }
    recommendCard(user, dto) {
        return this.cardRecommendation.recommend(user.sub, dto.merchantName, dto.merchantCategory, dto.amount, dto.currency);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('analyze-merchant'),
    (0, swagger_1.ApiOperation)({ summary: 'AI-powered merchant analysis' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyzeMerchantDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "analyzeMerchant", null);
__decorate([
    (0, common_1.Post)('recommend-card'),
    (0, swagger_1.ApiOperation)({ summary: 'AI-powered card recommendation' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload, RecommendCardDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "recommendCard", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [merchant_intelligence_service_1.MerchantIntelligenceService,
        card_recommendation_service_1.CardRecommendationService])
], AiController);
//# sourceMappingURL=ai.controller.js.map