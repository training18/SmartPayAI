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
exports.CampaignsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const campaigns_service_1 = require("./campaigns.service");
const campaign_aggregator_service_1 = require("../campaign-service/campaign-aggregator.service");
const dto_1 = require("./dto");
let CampaignsController = class CampaignsController {
    campaigns;
    aggregator;
    constructor(campaigns, aggregator) {
        this.campaigns = campaigns;
        this.aggregator = aggregator;
    }
    findAll(category, bankName, cardType) {
        return this.campaigns.findAll({ category, bankName, cardType });
    }
    create(dto) {
        return this.campaigns.create(dto);
    }
    refresh() {
        return this.aggregator.refreshAll();
    }
    stats() {
        return this.campaigns.getStats();
    }
    banks() {
        return this.aggregator.getAvailableBanks();
    }
};
exports.CampaignsController = CampaignsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List active campaigns (filterable)' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'bankName', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'cardType', required: false }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('bankName')),
    __param(2, (0, common_1.Query)('cardType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new campaign' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateCampaignDto]),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger real-time campaign refresh from all bank connectors' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Campaign aggregation statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('banks'),
    (0, swagger_1.ApiOperation)({ summary: 'List available bank connectors' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "banks", null);
exports.CampaignsController = CampaignsController = __decorate([
    (0, swagger_1.ApiTags)('Campaigns'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('campaigns'),
    __metadata("design:paramtypes", [campaigns_service_1.CampaignsService,
        campaign_aggregator_service_1.CampaignAggregatorService])
], CampaignsController);
//# sourceMappingURL=campaigns.controller.js.map