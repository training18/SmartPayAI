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
exports.CreateSavedCardDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateSavedCardDto {
    bankName;
    cardType;
    last4;
    cardAlias;
    holderName;
    monthlyLimit;
    rewardType;
}
exports.CreateSavedCardDto = CreateSavedCardDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Garanti BBVA' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateSavedCardDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.CardType, example: 'CREDIT' }),
    (0, class_validator_1.IsEnum)(client_1.CardType),
    __metadata("design:type", String)
], CreateSavedCardDto.prototype, "cardType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '4567' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(4, 4),
    __metadata("design:type", String)
], CreateSavedCardDto.prototype, "last4", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Bonus Gold' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateSavedCardDto.prototype, "cardAlias", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ALEXANDER W.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateSavedCardDto.prototype, "holderName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 25000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSavedCardDto.prototype, "monthlyLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.RewardType, example: 'CASHBACK' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RewardType),
    __metadata("design:type", String)
], CreateSavedCardDto.prototype, "rewardType", void 0);
//# sourceMappingURL=create-saved-card.dto.js.map