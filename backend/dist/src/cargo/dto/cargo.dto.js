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
exports.CreateShipmentDto = exports.GetQuotesDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GetQuotesDto {
    senderName;
    senderAddress;
    senderCity;
    receiverName;
    receiverAddress;
    receiverCity;
    width;
    height;
    length;
    weight;
    merchantPreference;
}
exports.GetQuotesDto = GetQuotesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TechMerchant A.Ş.', description: 'Sender business name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "senderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Levent Mah. Nispetiye Cad. No:12', description: 'Sender address detail' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "senderAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Istanbul', description: 'Sender city' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "senderCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ahmet Yılmaz', description: 'Receiver customer name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "receiverName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Kavaklıdere Mah. Atatürk Bulvarı No:142', description: 'Receiver address detail' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "receiverAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ankara', description: 'Receiver city' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "receiverCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30, description: 'Package width in cm' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    __metadata("design:type", Number)
], GetQuotesDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20, description: 'Package height in cm' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    __metadata("design:type", Number)
], GetQuotesDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 40, description: 'Package length in cm' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    __metadata("design:type", Number)
], GetQuotesDto.prototype, "length", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4.5, description: 'Package weight in kg' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], GetQuotesDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Deliver as fast as possible. Prefer reliability over cheapest cost.',
        description: 'Custom semantic preference for AI optimization engine',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "merchantPreference", void 0);
class CreateShipmentDto extends GetQuotesDto {
    selectedProviderCode;
}
exports.CreateShipmentDto = CreateShipmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'yurtici', description: 'Code of the selected cargo provider' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "selectedProviderCode", void 0);
//# sourceMappingURL=cargo.dto.js.map