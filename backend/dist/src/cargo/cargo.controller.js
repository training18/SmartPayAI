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
exports.CargoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cargo_service_1 = require("./cargo.service");
const cargo_dto_1 = require("./dto/cargo.dto");
const decorators_1 = require("../common/decorators");
const types_1 = require("../common/types");
let CargoController = class CargoController {
    cargoService;
    constructor(cargoService) {
        this.cargoService = cargoService;
    }
    getQuotes(user, dto) {
        return this.cargoService.getQuotesAndOptimize(user.sub, dto);
    }
    optimize(user, dto) {
        return this.cargoService.getQuotesAndOptimize(user.sub, dto);
    }
    createShipment(user, dto) {
        return this.cargoService.createShipment(user.sub, dto);
    }
    getHistory(user) {
        return this.cargoService.getShipmentHistory(user.sub);
    }
    getSavings(user) {
        return this.cargoService.getShippingAnalytics(user.sub);
    }
};
exports.CargoController = CargoController;
__decorate([
    (0, common_1.Post)('shipments/get-quotes'),
    (0, swagger_1.ApiOperation)({
        summary: 'Compare shipping options — queries and normalizes pricing across providers',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of quotes with base calculations' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload, cargo_dto_1.GetQuotesDto]),
    __metadata("design:returntype", void 0)
], CargoController.prototype, "getQuotes", null);
__decorate([
    (0, common_1.Post)('shipments/optimize'),
    (0, swagger_1.ApiOperation)({
        summary: 'Orchestrates Rules Engine -> AI Optimization Layer -> Final recommendation',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ranked shipping options with AI scoring and recommendations' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload, cargo_dto_1.GetQuotesDto]),
    __metadata("design:returntype", void 0)
], CargoController.prototype, "optimize", null);
__decorate([
    (0, common_1.Post)('shipments/create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Finalize and create a shipment order with a selected provider',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Created shipment detail with tracking and analytics updated' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload, cargo_dto_1.CreateShipmentDto]),
    __metadata("design:returntype", void 0)
], CargoController.prototype, "createShipment", null);
__decorate([
    (0, common_1.Get)('shipments/history'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get shipment order history for the current merchant',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of shipments with quotes and tracking details' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], CargoController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('analytics/shipping-savings'),
    (0, swagger_1.ApiOperation)({
        summary: 'Retrieve aggregate cargo analytics and savings metrics',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Aggregated spent, saved, and delivery time insights' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], CargoController.prototype, "getSavings", null);
exports.CargoController = CargoController = __decorate([
    (0, swagger_1.ApiTags)('Cargo Optimization'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('cargo'),
    __metadata("design:paramtypes", [cargo_service_1.CargoService])
], CargoController);
//# sourceMappingURL=cargo.controller.js.map