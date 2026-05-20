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
exports.SavingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const decorators_1 = require("../common/decorators");
const types_1 = require("../common/types");
const savings_service_1 = require("./savings.service");
let SavingsController = class SavingsController {
    savingsService;
    constructor(savingsService) {
        this.savingsService = savingsService;
    }
    getDashboard(user) {
        return this.savingsService.getSavingsDashboard(user.sub);
    }
    seedMock(user) {
        return this.savingsService.seedMockData(user.sub);
    }
};
exports.SavingsController = SavingsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get savings analytics dashboard' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], SavingsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('seed-mock'),
    (0, swagger_1.ApiOperation)({ summary: 'Seed mock savings history for the current user' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], SavingsController.prototype, "seedMock", null);
exports.SavingsController = SavingsController = __decorate([
    (0, swagger_1.ApiTags)('Savings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('savings'),
    __metadata("design:paramtypes", [savings_service_1.SavingsService])
], SavingsController);
//# sourceMappingURL=savings.controller.js.map