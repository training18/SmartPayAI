"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignServiceModule = void 0;
const common_1 = require("@nestjs/common");
const ai_module_1 = require("../ai/ai.module");
const campaign_parser_service_1 = require("./campaign-parser.service");
const campaign_aggregator_service_1 = require("./campaign-aggregator.service");
const campaign_cache_service_1 = require("./campaign-cache.service");
const campaign_scheduler_service_1 = require("./campaign-scheduler.service");
const connectors_1 = require("./connectors");
let CampaignServiceModule = class CampaignServiceModule {
};
exports.CampaignServiceModule = CampaignServiceModule;
exports.CampaignServiceModule = CampaignServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => ai_module_1.AiModule)],
        providers: [
            connectors_1.AkbankConnector,
            connectors_1.IsbankConnector,
            connectors_1.GarantiConnector,
            connectors_1.YkbConnector,
            campaign_parser_service_1.CampaignParserService,
            campaign_aggregator_service_1.CampaignAggregatorService,
            campaign_cache_service_1.CampaignCacheService,
            campaign_scheduler_service_1.CampaignSchedulerService,
        ],
        exports: [
            campaign_aggregator_service_1.CampaignAggregatorService,
            campaign_cache_service_1.CampaignCacheService,
        ],
    })
], CampaignServiceModule);
//# sourceMappingURL=campaign-service.module.js.map